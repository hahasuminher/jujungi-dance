const s=Math.sin,c=Math.cos,ab=Math.abs,PI=Math.PI;
/* ---------- 캐릭터 뼈대 ---------- */
const B=CHAR.body,HEADP=CHAR.head,LM=CHAR.lm,N=B.length;
const pt=i=>B[(i%N+N)%N];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const xs=B.map(p=>p[0]);const CX=(Math.min(...xs)+Math.max(...xs))/2;
const ys=[...B,...HEADP].map(p=>p[1]);const TOP=Math.min(...ys),BOT=Math.max(...ys),H=BOT-TOP;
const CY=TOP+H*.52;
function arc(a,b,must){ // a에서 b까지 must를 지나는 윤곽 구간
  const walk=d=>{const o=[];let i=a,ok=false;for(;;){o.push(i);if(i===must)ok=true;if(i===b)break;i=(i+d+N)%N}return ok?o:null};
  return walk(1)||walk(-1);
}
const notch=B.reduce((best,p,i)=>Math.abs(p[0]-CX)<60&&p[1]<B[best][1]?i:best,LM.pL);
const LIMBS={};
function limb(name,pit,end,tip,w0,w1){
  const idx=arc(pit,end,tip),k=idx.indexOf(tip),outer=idx.slice(k);
  const P0=pt(pit);
  let near=outer[0],nd=1e9;for(const i of outer){const d=dist(pt(i),P0);if(d<nd){nd=d;near=i}}
  const root=[(P0[0]+pt(near)[0])/2,(P0[1]+pt(near)[1])/2],T=pt(tip);
  const dx=T[0]-root[0],dy=T[1]-root[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
  const pts=idx.map(i=>{const q=pt(i),rx=q[0]-root[0],ry=q[1]-root[1];
    const t=Math.max(0,Math.min(1.03,(rx*ux+ry*uy)/L)),n=-rx*uy+ry*ux;
    const e=Math.max(0,Math.min(1,((rx*ux+ry*uy)/L-w0)/(w1-w0)));
    return{i,t,n,w:e*e*(3-2*e)}});
  LIMBS[name]={root,L,th:Math.atan2(dy,dx),pts};
}
limb('aL',LM.pL,notch,LM.hL,.02,.3);
limb('aR',LM.pR,notch,LM.hR,.02,.3);
limb('lL',LM.cr,LM.pL,LM.fL,.0,.26);
limb('lR',LM.cr,LM.pR,LM.fR,.0,.26);
const weight=new Float32Array(N),lid=new Int8Array(N),lt=new Float32Array(N),ln=new Float32Array(N);
Object.keys(LIMBS).forEach((k,li)=>{for(const q of LIMBS[k].pts){if(q.w>weight[q.i]){weight[q.i]=q.w;lid[q.i]=li;lt[q.i]=q.t;ln[q.i]=q.n}}});
const LK=Object.keys(LIMBS);
const NECK=[CX,B[notch][1]-8];
// 목이 늘어날 때 몸과 머리를 잇는 지점
function neckAnchors(side){
  let bi=0,hi=0,d=1e9;
  B.forEach((p,i)=>{if((p[0]-CX)*side<45)return;if(p[1]>NECK[1]+120)return;
    HEADP.forEach((h,j)=>{const q=dist(p,h);if(q<d){d=q;bi=i;hi=j}})});
  return[bi,hi];
}
const NA=[neckAnchors(-1),neckAnchors(1)];
const REST={rx:0,ry:0,rr:0,sx:1,sy:1,bd:0,tw:0,hx:0,hy:0,hr:0,hs:1,al:0,ar:0,bl:0,br:0,sl:1,sr:1,ll:0,lr:0,kl:0,kr:0,gl:1,gr:1,clones:0,ghost:0};
const ANG=['rr','hr','al','ar','ll','lr'];
const X={...REST},V=Object.fromEntries(Object.keys(REST).map(k=>[k,0]));
const noise=new Float32Array(4096).map(()=>Math.random()*2-1);
const wob=(i,seed)=>{const f=i/9,k=f|0,e=f-k,u=e*e*(3-2*e),a=noise[(k+seed)&4095],b=noise[(k+1+seed)&4095];return a+(b-a)*u};

function drawChar(ctx,P,ox,oy,S,o){
  o=o||{};
  const j=(o.boil||0)*WOBBLE,lw=Math.max(2.2,7*S*.95),stroke=o.stroke||'#0d0d0d',fill=o.fill===undefined?'#fff':o.fill;
  const hh=H*.3;
  const T=(x,y)=>{const v=(y-CY)/hh;return[x+P.bd*v*v*hh*.55+P.tw*v*hh*.5,y]};
  const curves={};
  [['aL',P.al,P.bl,P.sl,1],['aR',P.ar,P.br,P.sr,-1],['lL',P.ll,P.kl,P.gl,1],['lR',P.lr,P.kr,P.gr,-1]].forEach(([k,a,b,st,sg])=>{
    const l=LIMBS[k],r=T(l.root[0],l.root[1]),K=20,cx=new Float32Array(K+1),cy=new Float32Array(K+1),th=new Float32Array(K+1);
    cx[0]=r[0];cy[0]=r[1];const seg=l.L*st/K;
    for(let i=0;i<=K;i++){th[i]=l.th+sg*(a+b*i/K);if(i<K){cx[i+1]=cx[i]+c(th[i])*seg;cy[i+1]=cy[i]+s(th[i])*seg}}
    curves[k]={cx,cy,th,K};
  });
  const pts=new Float32Array(N*2);
  for(let i=0;i<N;i++){
    const q=B[i],t0=T(q[0],q[1]);let x=t0[0],y=t0[1];const w=weight[i];
    if(w>0){const C=curves[LK[lid[i]]],f=Math.min(C.K-.001,lt[i]*C.K),k=f|0,e=f-k;
      const th=C.th[k]+(C.th[k+1]-C.th[k])*e,mx=C.cx[k]+(C.cx[k+1]-C.cx[k])*e,my=C.cy[k]+(C.cy[k+1]-C.cy[k])*e,
        lx=mx-s(th)*ln[i],ly=my+c(th)*ln[i];
      x+=(lx-x)*w;y+=(ly-y)*w}
    pts[i*2]=x+j*wob(i,o.seed);pts[i*2+1]=y+j*wob(i,o.seed+777);
  }
  ctx.save();
  ctx.lineJoin=ctx.lineCap='round';
  const root=()=>{ctx.translate(ox+P.rx*H*S,oy+P.ry*H*S);ctx.rotate(P.rr);ctx.scale(S*P.sx,S*P.sy);ctx.translate(-CX,-CY)};
  const stk=()=>{if(fill){ctx.fillStyle=fill;ctx.fill()}ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()};
  // 몸
  ctx.save();root();ctx.beginPath();ctx.moveTo(pts[0],pts[1]);
  for(let i=1;i<N;i++)ctx.lineTo(pts[i*2],pts[i*2+1]);ctx.closePath();ctx.restore();stk();
  // 머리 변환
  const nk=T(NECK[0],NECK[1]),hX=nk[0]+P.hx*H,hY=nk[1]+P.hy*H;
  const head=()=>{ctx.translate(hX,hY);ctx.rotate(P.hr);ctx.scale(P.hs,P.hs);ctx.translate(-NECK[0],-NECK[1])};
  // 늘어나는 목
  const hp=(i)=>{const h=HEADP[i],x=h[0]-NECK[0],y=h[1]-NECK[1],cr=c(P.hr)*P.hs,sr=s(P.hr)*P.hs;return[hX+x*cr-y*sr,hY+x*sr+y*cr]};
  const a=[pts[NA[0][0]*2],pts[NA[0][0]*2+1]],b=[pts[NA[1][0]*2],pts[NA[1][0]*2+1]],ha=hp(NA[0][1]),hb=hp(NA[1][1]);
  if(Math.hypot(P.hx,P.hy)>.006||ab(P.hr)>.02||ab(P.hs-1)>.03||ab(P.bd)+ab(P.tw)>.03){
    ctx.save();root();ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(ha[0],ha[1]);ctx.lineTo(hb[0],hb[1]);ctx.lineTo(b[0],b[1]);ctx.closePath();ctx.restore();
    if(fill){ctx.fillStyle=fill;ctx.fill()}
    ctx.save();root();ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(ha[0],ha[1]);ctx.moveTo(b[0],b[1]);ctx.lineTo(hb[0],hb[1]);ctx.restore();
    ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();
  }
  // 머리와 얼굴
  ctx.save();root();head();ctx.beginPath();
  HEADP.forEach((p,i)=>{const x=p[0]+j*wob(i,o.seed+333),y=p[1]+j*wob(i,o.seed+1500);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.closePath();ctx.restore();stk();
  ctx.save();root();head();ctx.fillStyle=stroke;
  const m=o.mouth||0,feats=CHAR.feats;
  if(o.xeye){ctx.strokeStyle=stroke;ctx.lineWidth=17;ctx.lineCap='round';for(const x of[1096,1264]){ctx.beginPath();ctx.moveTo(x-46,478);ctx.lineTo(x+46,526);ctx.moveTo(x+46,478);ctx.lineTo(x-46,526);ctx.stroke()}}
  for(const f of feats){
    if(o.xeye&&f.cy<530)continue;
    const low=f===LOWER,dy=low?m*46:0;
    if(low&&m>.08){const u=UPPER;ctx.beginPath();ctx.ellipse(u.cx,(u.cy+f.cy+dy)/2,44,Math.max(3,(f.cy+dy-u.cy)/2),0,0,7);ctx.fill()}
    ctx.beginPath();f.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]+dy):ctx.moveTo(p[0],p[1]+dy));ctx.closePath();ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}
const LOWER=CHAR.feats.reduce((a,f)=>f.cy>a.cy?f:a,CHAR.feats[0]);
const UPPER=CHAR.feats.filter(f=>f!==LOWER).reduce((a,f)=>f.cy>a.cy?f:a,CHAR.feats[0]);


/* 2D 춤 엔진: 그린 포즈를 목표로 윤곽 점이 스프링처럼 따라가 중간 동작을 만든다 */
const SPECIALS={퇴근:'run',월요일:'melt',사랑해:'love',치킨:'chicken',로또:'lotto',살려줘:'sink',야근:'zombie',주둥이:'bigmouth',헤드스핀:'headspin',윈드밀:'windmill',비보이:'combo',스텝:'sixstep',둠칫:'groove'};
const Dance=(()=>{
const H_U=1790,D=POSES,M=D.M,SEG=D.seg,CXs=1181,CYs=1180,TAU=Math.PI*2,PIm=Math.PI,HH=494,BEAT=60/118;
const land=[];{let c=0;for(let i=0;i<8;i++){land[i]=c;c+=SEG[i]}}
const seg=new Float32Array(M);{const tips=[land[1],land[3],land[5],land[7]];for(let i=0;i<M;i++){let d=1e9;for(const t of tips){const a=Math.abs(i-t);d=Math.min(d,a,M-a)}seg[i]=Math.max(0,1-d/55)}}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
function polar(loop){const n=loop.length,cx=loop.reduce((a,p)=>a+p[0],0)/n,cy=loop.reduce((a,p)=>a+p[1],0)/n,o=[],lens=[0];for(let i=0;i<n;i++){const a=loop[i],b=loop[(i+1)%n];lens.push(lens[i]+Math.hypot(a[0]-b[0],a[1]-b[1]))}let st=0,best=1e9;loop.forEach((p,i)=>{if(p[1]<best){best=p[1];st=i}});const T=lens[n],area=loop.reduce((s,p,i)=>{const q=loop[(i+1)%n];return s+p[0]*q[1]-q[0]*p[1]},0),dir=area>0?1:-1;
 for(let k=0;k<72;k++){let t=(lens[st]+dir*k/72*T+T)%T,i=0;while(lens[i+1]<t)i++;const e=(t-lens[i])/(lens[i+1]-lens[i]||1),a=loop[i],b=loop[(i+1)%n];o.push([a[0]+(b[0]-a[0])*e-cx,a[1]+(b[1]-a[1])*e-cy])}return{p:o,cx,cy}}
const headFront=polar(HEADS.front.loop),headSide=polar(HEADS.side.loop),polyOf=k=>k===1?headSide:headFront;
const lowerFeat=(()=>{let b=0,y=-9;HEADS.front.feats.forEach((f,i)=>{const m=f.reduce((a,p)=>a+p[1],0)/f.length;if(m>y){y=m;b=i}});return b})();
function capture(P){const st=[];let m=[1,0,0,1,0,0],paths=[],cur=null;const ap=(x,y)=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]],mul=(a,b,c,d,e,f)=>{m=[m[0]*a+m[2]*b,m[1]*a+m[3]*b,m[0]*c+m[2]*d,m[1]*c+m[3]*d,m[0]*e+m[2]*f+m[4],m[1]*e+m[3]*f+m[5]]};
 const ctx={save(){st.push(m.slice())},restore(){m=st.pop()},translate(x,y){mul(1,0,0,1,x,y)},rotate(a){mul(Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0)},scale(x,y){mul(x,0,0,y,0,0)},beginPath(){cur={pts:[],m:m.slice()};paths.push(cur)},moveTo(x,y){cur.pts.push(ap(x,y))},lineTo(x,y){cur.pts.push(ap(x,y))},closePath(){},fill(){},stroke(){},ellipse(){}};
 const feats=CHAR.feats;CHAR.feats=[];drawChar(ctx,P,CXs,CYs,1,{boil:0,seed:0,mouth:0});CHAR.feats=feats;
 const bp=paths.find(p=>p.pts.length>400),hd=paths.filter(p=>p.pts.length>100&&p.pts.length<400).pop(),body=new Float32Array(M*2),a=D.aIdx,N=bp.pts.length,dirS=((a[1]-a[0]+N)%N)<N/2?1:-1;let o=0;
 for(let s=0;s<8;s++){const i0=a[s],i1=a[(s+1)%8],span=dirS>0?((i1-i0+N)%N):((i0-i1+N)%N);for(let k=0;k<SEG[s];k++){const f=i0+dirS*span*k/SEG[s],j=((Math.floor(f)%N)+N)%N,j2=(j+1)%N,e=f-Math.floor(f);body[o*2]=bp.pts[j][0]+(bp.pts[j2][0]-bp.pts[j][0])*e;body[o*2+1]=bp.pts[j][1]+(bp.pts[j2][1]-bp.pts[j][1])*e;o++}}
 const mh=hd.m,cx=D.par.A.x,cy=D.par.A.y;return{body,head:{x:mh[0]*cx+mh[2]*cy+mh[4],y:mh[1]*cx+mh[3]*cy+mh[5],ang:Math.atan2(mh[1],mh[0]),s:Math.hypot(mh[0],mh[1]),k:0},rot:0,cel:null}}
const fromDraw=(k,rot=0)=>{const b=new Float32Array(D.poses[k]),h=D.par[k],c=Math.cos(-rot),s0=Math.sin(-rot);for(let i=0;i<M;i++){const x=b[i*2]-CXs,y=b[i*2+1]-CYs;b[i*2]=CXs+x*c-y*s0;b[i*2+1]=CYs+x*s0+y*c}const x=h.x-CXs,y=h.y-CYs;return{body:b,head:{x:CXs+x*c-y*s0,y:CYs+x*s0+y*c,ang:(k==='E'?0:h.ang)-rot,s:1,k:k==='E'?1:0},rot,cel:k}};
const mirror=p=>{const b=new Float32Array(M*2);for(let i=0;i<M;i++){const j=(M-i)%M;b[i*2]=2*CXs-p.body[j*2];b[i*2+1]=p.body[j*2+1]}return{body:b,head:{...p.head,x:2*CXs-p.head.x,ang:-p.head.ang,flip:!p.head.flip},rot:-p.rot,cel:p.cel,mir:!p.mir}};
const widen=(p,k)=>{const b=p.body.slice();for(let i=0;i<M;i++)b[i*2]=CXs+(b[i*2]-CXs)*k;return{...p,body:b,cel:null}};
const hk=(p,k,flip)=>({...p,cel:null,head:{...p.head,k,flip:!!flip}});
const cache=new Map();const rp=o=>{const key=JSON.stringify(o);if(cache.has(key))return cache.get(key);const q={...REST,...o,rr:0},r=capture(q);r.rot=o.rr||0;if(cache.size>600)cache.clear();cache.set(key,r);return r};
const swapK=o=>{const q={...o},s=(a,b)=>{const x=o[a],y=o[b];delete q[a];delete q[b];if(y!==undefined)q[a]=y;if(x!==undefined)q[b]=x};s('al','ar');s('bl','br');s('sl','sr');s('ll','lr');s('kl','kr');s('gl','gr');for(const k of['rr','bd','tw','rx','hx','hr'])if(q[k]!==undefined)q[k]=-q[k];return q};
const A=fromDraw('A'),B=fromDraw('B'),C=fromDraw('C'),DD=fromDraw('D'),E=fromDraw('E'),Em=mirror(E),F=fromDraw('F',2.75),Cm=mirror(C);
/* 자음: 팔다리 작은 동작 */
const CONS=[['팔 번쩍',{al:1.9}],['반대 팔 번쩍',{ar:1.9}],['만세',{al:2.5,ar:2.5}],['고무팔',{al:1.2,ar:1.2,sl:1.5,sr:1.5}],['닭 날개',{al:.9,ar:.9,bl:-2.2,br:-2.2}],['삿대질',{al:1.45,sl:1.35,bl:.2}],['뺨 치기',{al:2,bl:2.4}],['왼발 툭',{ll:.75,kl:-.6}],['오른발 툭',{lr:.75,kr:-.6}],['다리 벌림',{ll:.55,lr:.55}],['무릎 굽힘',{kl:1.5,kr:1.5,ll:.15,lr:.15,ry:.05}],['뒷발질',{ll:.9,kl:1.8}],['게걸음',{ll:.7,lr:.7,kl:-1.4,kr:-1.4,al:1.2,ar:1.2,bl:1.8,br:1.8,ry:.04}],['문어팔',{bl:2.6,br:-2.2}],['반대 문어팔',{bl:-2.2,br:2.6}],['허우적',{al:.9,ar:1.7,bl:1.5,br:-1.2}],['티라노',{sl:.4,sr:.4,al:1.5,ar:1.5,bl:-1.5,br:-1.5}],['팔 짧아짐',{sl:.55,sr:.55}],['깍지',{al:.8,ar:.8,bl:1.8,br:1.8}],['어깨춤',{al:.7,ar:.2,bl:1,br:.8}],['한 발 들기',{ll:1.1,kl:-1.3,ar:1.3}],['양 무릎 찍기',{kl:2.2,kr:2.2,ll:.4,lr:.4,ry:.08}]];
/* 모음: 몸통과 머리 */
const VOWS=[['고개 끄덕',{hy:.03,hr:.04}],['갸우뚱',{hr:.5,hx:.03}],['반대 갸우뚱',{hr:-.5,hx:-.03}],['목 쭉',{hy:-.14}],['머리 쏙',{hy:.05,hs:.85}],['머리 뻥',{hs:1.38}],['상체 꺾기',{bd:.6}],['반대로 꺾기',{bd:-.6}],['허리 틀기',{tw:.55}],['반대로 틀기',{tw:-.55}],['기울기',{rr:.16}],['반대로 기울기',{rr:-.16}],['옆구리 빼기',{bd:.35,tw:-.3,rx:.04}],['옆으로 슬쩍',{rx:-.06,bd:-.3}],['폴짝',{ry:-.07}],['털썩',{ry:.05,bd:.15,hy:.03}],['고개 뒤로',{hy:.02,hr:.2,bd:-.2}],['몸 늘림',{sy:1.1,sx:.93}],['몸 눌림',{sy:.92,sx:1.08}],['목 삐딱',{hx:.07,hy:-.05,hr:.35}],['반대 삐딱',{hx:-.07,hy:-.05,hr:-.35}],['물결',{bd:.42,tw:.42}]];
let rnd=Math.random,mapC={},mapV={};
function reseed(seed){let a=seed>>>0;rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};const sh=x=>{x=[...x];for(let i=x.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};const mc=sh(CONS),mv=sh(VOWS);CHO.forEach((j,i)=>mapC[j]=mc[i]);JUNG.forEach((j,i)=>mapV[j]=mv[i])}
/* 큰 춤: [박자, 자세, 옵션] */
const stepL={ll:.62,lr:-.12,kl:-1.5,kr:.5,al:1.15,ar:.25,bl:-1.2,br:.9,bd:.38,tw:.25,rx:-.05,ry:.03,hr:.18},low={ll:.1,lr:.1,kl:.9,kr:.9,al:.5,ar:.5,bl:1.3,br:1.3,sy:.92,ry:.05,bd:-.1},spreadV={ll:.62,lr:.62,al:1.45,ar:1.45,bl:-.2,br:-.2};
const s1={ry:.12,ll:1.25,kl:.25,lr:.25,kr:1.9,al:-.05,ar:.35,bl:.3,br:.5,rx:.05,bd:.3,hr:.12},s2={ry:.1,ll:.85,kl:.5,lr:-.45,kr:.8,al:.1,ar:.5,bl:.4,br:.9,rx:.02,bd:.12,tw:.2},s3={ry:.13,ll:.1,kl:2,lr:.1,kr:2,al:.2,ar:.2,bl:.5,br:.5,bd:.35};
const spinUp=(start,end)=>{const V=rp(spreadV),Ew=widen(E,1.4),Emw=widen(Em,1.4),cyc=[{...V,rot:PIm},{...Ew,rot:PIm},{...hk(V,2),rot:PIm},{...Emw,rot:PIm}],o=[[start,{...V,rot:PIm}]];let b=start+.9,d=.9,i=1;while(b<end){o.push([b,cyc[i%4]]);b+=d;d=Math.max(.28,d*.84);i++}return o};
const wind=(start,n)=>{const v=[rp(spreadV),F,rp({ll:1.3,lr:.3,kl:-.8,al:.3,ar:1.5}),mirror(F)],o=[];for(let i=0;i<n;i++)o.push([start+i,{...v[i%4],cel:null,rot:F.rot+i*2.35},{orbit:1}]);return o};
const six=(st)=>[[st,rp(s1)],[st+1,rp(s2)],[st+2,hk(rp(s3),1)],[st+3,hk(rp(swapK(s1)),2)],[st+4,hk(rp(swapK(s2)),2)],[st+5,hk(rp(s3),1,true)],[st+6,rp(s1)],[st+7,rp(s2)]];
const BIG={
 headspin:()=>[...spinUp(0,7.5),[7.8,F],[9.5,A]],
 windmill:()=>[[0,rp(low)],...wind(1,8),[9,F],[11,A]],
 sixstep:()=>[...six(0),[8,rp(low)],[8.6,B],[10,A]],
 combo:()=>[[0,B],...six(1),...spinUp(9,14),...wind(14.5,5),[19.5,F],[22,A]],
 groove:()=>[[0,A],[1,C],[2,Cm],[3,A],[4,B],[5,rp({hy:-.32})],[6,DD],[7,rp({hs:2})],[8,A]],
 run:()=>{const o=[];for(let i=0;i<6;i++)o.push([i*.5,rp(i%2?swapK(stepL):stepL),{dx:i*.32}]);return[...o,[3,A,{dx:-1.6,snap:1}],[3.2,rp(stepL),{dx:-.8}],[3.8,rp(swapK(stepL)),{dx:-.2}],[4.4,A,{dx:0}]]},
 melt:()=>[[0,rp(low)],[.7,rp({sy:.45,sx:1.5,ry:.16,al:.1,ar:.1,hs:.9})],[3,rp({sy:.26,sx:2,ry:.24,hs:.8})],[5,rp({sy:.6,sx:1.3,ry:.1})],[5.7,A]],
 love:()=>[[0,rp({al:2.6,ar:2.6,bl:2.2,br:2.2})],[1,rp({al:2.6,ar:2.6,bl:2.2,br:2.2,hs:1.6})],[2,rp({al:2.6,ar:2.6,bl:2.2,br:2.2,hs:2.6})],[3,rp({hs:.4,ry:.02})],[3.6,B],[5,A]],
 chicken:()=>{const o=[];for(let i=0;i<10;i++)o.push([i*.35,rp({al:.8,ar:.8,bl:i%2?-2.8:-1.2,br:i%2?-2.8:-1.2,ry:-.02}),{dy:-i*.03}]);return[...o,[3.6,A,{dy:0}]]},
 lotto:()=>[[0,B],[.6,rp({al:2.7,ar:2.7}),{clones:1}],[1.4,rp({ll:.8,lr:.8,al:1.4,ar:1.4}),{clones:1}],[2.2,rp({al:2.7,ar:2.7}),{clones:1}],[3,rp({ll:.8,lr:.8,al:1.4,ar:1.4}),{clones:1}],[3.8,A]],
 sink:()=>[[0,rp({al:2.5,ar:2.5})],[.8,rp({al:2.5,ar:2.5}),{dy:.3}],[1.6,rp({al:2.6,ar:2.4}),{dy:.75}],[3,rp({al:2.5,ar:2.5}),{dy:1.2}],[3.5,A,{dy:-1.2,snap:1}],[3.7,A,{dy:0}]],
 zombie:()=>[[0,rp({al:1.45,ar:1.45,hr:.3,bd:.1})],[1.2,rp({al:1.45,ar:1.45,hr:-.3,bd:-.1}),{dx:.08}],[2.4,rp({al:1.45,ar:1.45,hr:.35,bd:.1}),{dx:.16}],[3.6,rp({rr:1.5,ry:.25,al:.1,ar:.1})],[6,A,{dx:0}]],
 bigmouth:()=>[[0,rp({hs:1.5}),{mouth:3}],[1,rp({hs:2.1,al:2,ar:2}),{mouth:4}],[2.5,rp({hs:2.5}),{mouth:5}],[3.5,A]],
};
/* 상태 */
const X=A.body.slice(),V0=new Float32Array(M*2),T={body:A.body,head:A.head,rot:0,cel:'A',mir:false};
const H={x:A.head.x,y:A.head.y,ang:0,s:1,vx:0,vy:0,va:0,vs:0},R={rot:0,v:0,dx:0,dy:0,vx:0,vy:0};
let hkA=0,hkB=0,hkU=1,hfA=false,hfB=false,cloneOn=0,orbit=0,mouth=0,mouthExtra=0,bigSeq=null,bigT=0,bigI=0,cOv={},vOv={},tOv=0,lvl=0,qv=0,tilv=0,dots=false,settled=false,glabel='';
const wrap=a=>{a=(a+PIm)%TAU;return a<0?a+TAU-PIm:a-PIm};
function setTarget(p,o={}){T.body=p.body;T.head=p.head;T.rot=p.rot;T.cel=p.cel;T.mir=p.mir;if(p.head.k!==hkB||!!p.head.flip!==hfB){hkA=hkU<.5?hkA:hkB;hfA=hkU<.5?hfA:hfB;hkB=p.head.k;hfB=!!p.head.flip;hkU=0}
 if(o.snap){R.dx=o.dx??R.dx;R.dy=o.dy??R.dy;R.vx=R.vy=0}if(o.dx!==undefined)T.dx=o.dx;if(o.dy!==undefined)T.dy=o.dy;cloneOn=o.clones?1:0;orbit=o.orbit?1:0;if(o.mouth)mouthExtra=o.mouth}
T.dx=0;T.dy=0;
function small(){const q={...cOv,...vOv};if(lvl>0){q.hs=(q.hs||1)+.1*lvl;q.ry=(q.ry||0)-.012*lvl}if(qv>0)q.hr=(q.hr||0)+Math.sin(performance.now()/70)*.14*Math.min(3,qv);if(tilv>0){q.bd=(q.bd||0)+Math.sin(performance.now()/160)*.4;q.tw=(q.tw||0)+Math.cos(performance.now()/160)*.3}if(dots){q.bd=(q.bd||0)+.2;q.al=.05;q.ar=.05;q.ry=(q.ry||0)+.03;q.hr=(q.hr||0)+.12}return rp(q)}
function stepBody(dt){const h=dt/2;for(let n=0;n<2;n++)for(let i=0;i<M*2;i++){const w=seg[i>>1],k=lerp(300,150,w),c=2*Math.sqrt(k)*.6;V0[i]+=((T.body[i]-X[i])*k-V0[i]*c)*h;X[i]+=V0[i]*h}
 let da=T.head.ang-H.ang;while(da>PIm)da-=TAU;while(da<-PIm)da+=TAU;const kk=260,cc=2*Math.sqrt(kk)*.65;H.vx+=((T.head.x-H.x)*kk-H.vx*cc)*dt;H.x+=H.vx*dt;H.vy+=((T.head.y-H.y)*kk-H.vy*cc)*dt;H.y+=H.vy*dt;H.va+=(da*kk-H.va*cc)*dt;H.ang+=H.va*dt;H.vs+=((T.head.s-H.s)*kk-H.vs*cc)*dt;H.s+=H.vs*dt;
 const kr=orbit?70:150,cr=2*Math.sqrt(kr)*.85;R.v+=((T.rot-R.rot)*kr-R.v*cr)*dt;R.rot+=R.v*dt;const kd=120,cd=2*Math.sqrt(kd)*.8;R.vx+=((T.dx-R.dx)*kd-R.vx*cd)*dt;R.dx+=R.vx*dt;R.vy+=((T.dy-R.dy)*kd-R.vy*cd)*dt;R.dy+=R.vy*dt;
 hkU=Math.min(1,hkU+dt*8);mouth=Math.max(0,mouth-dt*7);mouthExtra=Math.max(0,mouthExtra-dt*1.6)}
function update(dt,beatClock,speaking){
 if(bigSeq){bigT+=dt/BEAT;while(bigI<bigSeq.length&&bigSeq[bigI][0]<=bigT){const[,p,o]=bigSeq[bigI];setTarget(p,o||{dx:T.dx,dy:T.dy});bigI++}if(bigI>=bigSeq.length&&bigT>bigSeq[bigSeq.length-1][0]+.9){bigSeq=null;cloneOn=0;orbit=0;R.rot=wrap(R.rot);T.dx=0;T.dy=0;glabel=''}}
 else{tOv-=dt;if(tOv<0){cOv={};vOv={};lvl=0;qv=0;tilv=0;dots=false}
  if(speaking||Object.keys(cOv).length||Object.keys(vOv).length)setTarget(small());
  else if(beatClock!==null){const b=Math.floor(beatClock),g=[A,rp({ry:.018,sy:.97}),A,rp({ry:.018,sy:.97}),C,rp({ry:.018,sy:.97}),A,Cm];setTarget(g[((b%8)+8)%8])}else setTarget(A)}
 stepBody(dt);let e=0;for(let i=0;i<M*2;i+=11)e+=Math.abs(X[i]-T.body[i]);settled=e/(M*2/11)<2.4&&Math.abs(H.x-T.head.x)<3&&hkU>=1&&Math.abs(wrap(R.rot-T.rot))<.02}
const ANG={};
function anchors(){const p=(s,t=0)=>{const i=Math.round(land[s]+SEG[s]*t)%M;return[X[i*2],X[i*2+1]]};const hipL=p(2,.42),hipR=p(5,.58),chestL=p(2,.03),chestR=p(6,0),chest=mid(chestL,chestR,.5),collar=p(0);return{hipL,hipR,waist:mid(mid(hipL,hipR,.5),chest,.04),crotch:p(4),crotchL:p(3,.8),crotchR:p(4,.2),waistL:p(2,.33),waistR:p(5,.67),thighL:p(2,.68),thighR:p(5,.32),innerL:p(3,.6),innerR:p(4,.4),collar,collarL:p(0,.1),collarR:p(7,.9),chest,chestL,chestR,belly:mid(mid(hipL,hipR,.5),chest,.3),handL:p(1),handR:p(7),wristL0:p(0,.9),wristL1:p(1,.1),wristR0:p(6,.9),wristR1:p(7,.1),ankleL0:p(2,.93),ankleL1:p(3,.07),ankleR0:p(4,.93),ankleR1:p(5,.07)}}
const wob=(i,s0)=>Math.sin(i*.35+s0)*1.4+Math.sin(i*.13+s0*1.7)*1.4;
function headPoly(){const fp=(p,f)=>f?p.map((q,i)=>{const r=p[(72-i)%72];return[-r[0],r[1]]}):p,a=fp(polyOf(hkA).p,hfA&&hkA===1),b=fp(polyOf(hkB).p,hfB&&hkB===1);if(hkU>=1||hkA===hkB)return b;const t=hkU;return a.map((p,i)=>[p[0]+(b[i][0]-p[0])*t,p[1]+(b[i][1]-p[1])*t])}
function draw(g,ox,oy,S,tick,outfit,raster){const sd=tick*2.1;const lw=2.6/S*Math.min(1,S/.28+.25);
 g.save();g.translate(ox+R.dx*H_U*S,oy+R.dy*H_U*S);g.rotate(R.rot);g.scale(S,S);g.translate(-CXs,-CYs);g.lineJoin=g.lineCap='round';
 const useR=raster&&settled&&T.cel&&IMG[T.cel];const items=OUTFITS.filter(o=>outfit.has(o.id));
 if(useR){g.save();g.rotate(0);if(T.mir){g.translate(CXs*2,0);g.scale(-1,1)}g.translate(0,0);const rot=T.rot;if(rot){g.translate(CXs,CYs);g.rotate(-rot);g.translate(-CXs,-CYs)}g.drawImage(IMG[T.cel],0,0,2362,2362);g.restore()}
 else{g.beginPath();for(let i=0;i<M;i++){const x=X[i*2]+wob(i,sd)*1.1,y=X[i*2+1]+wob(i,sd+9)*1.1;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#0d0d0d';g.lineWidth=lw;g.stroke()}
 const a=items.some(o=>o.body)?anchors():null;for(const o of items)if(o.body)o.body(g,a);
 const k=hkU<.5?hkA:hkB,fl=hkU<.5?hfA:hfB,side=k===1;
 g.save();g.translate(H.x,H.y);g.rotate(H.ang);g.scale(HH*H.s,HH*H.s);
 if(!useR||items.length||mouth>.05||mouthExtra>.05){const poly=headPoly();g.beginPath();poly.forEach((q,i)=>{const x=q[0]+wob(i,sd+3)*.0016,y=q[1]+wob(i,sd+5)*.0016;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#0d0d0d';g.lineWidth=lw/(HH*H.s);g.stroke();
  if(k!==2){g.save();g.clip();const src=side?HEADS.side:HEADS.front,cen=side?headSide:headFront,sh=hkA===hkB?0:(hkU<.5?hkU*2:(1-hkU)*2)*.1*(fl?1:-1);g.scale(fl&&side?-1:1,1);g.fillStyle='#0d0d0d';const m=clamp(mouth+mouthExtra,0,6);src.feats.forEach((f,fi)=>{const low=!side&&fi===lowerFeat,dy=low?m*.05:0;g.beginPath();f.forEach((q,i)=>{const x=q[0]-cen.cx+sh,y=q[1]-cen.cy+dy;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fill()});
   if(!side&&m>.1){const up=HEADS.front.feats[lowerFeat],uy=up.reduce((s2,p)=>s2+p[1],0)/up.length-headFront.cy;g.beginPath();g.ellipse(sh,uy-.02+m*.025,.055+m*.012,m*.03,0,0,7);g.fill()}g.restore()}}
 if(fl&&side)g.scale(-1,1);for(const o of items)if(o.head&&(k===0||(!o.face&&k!==0)))o.head(g);
 g.restore();g.restore()}
return{setImages(i){Object.assign(IMG,i)},reseed,update,draw,
 event(e){if(bigSeq){if(e.kind==='v')mouth=1;return null}tOv=.3;lvl=e.ex;qv=e.q;tilv=e.til;dots=e.dots;let m;if(e.kind==='v'){m=mapV[e.j];vOv=m[1];mouth=/[ㅏㅑㅐㅒㅓㅕㅘ]/.test(e.j)?1:.65}else{m=mapC[e.j];cOv=m[1]}return m[0]},
 big(name){const f=BIG[name];if(!f)return;bigSeq=f().slice().sort((a,b)=>a[0]-b[0]);bigT=0;bigI=0;R.rot=wrap(R.rot);tOv=0},
 isBig:()=>!!bigSeq,stop(){bigSeq=null;tOv=-1;cOv={};vOv={};T.dx=0;T.dy=0;cloneOn=0;orbit=0;R.rot=wrap(R.rot)},clones:()=>cloneOn,
 orbitOn:()=>orbit};
})();
const IMG={};

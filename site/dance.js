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
/* 첫 초안의 자모 동작 */
const CONS_MOVES=[
 ['풍차 돌리기',(t,P)=>{P.al=t*17;P.ar=t*17+PI}],
 ['만세 삼창',(t,P)=>{P.al=P.ar=2.7+.35*s(t*24);P.ll=P.lr=.25}],
 ['문어발 발작',(t,P)=>{P.bl=2.8*s(t*17);P.br=2.8*s(t*17+1);P.kl=2.2*s(t*15+2);P.kr=2.2*s(t*15)}],
 ['고무팔 펀치',(t,P)=>{P.al=P.ar=1.35;P.sl=1+1.7*ab(s(t*11));P.sr=1+1.7*ab(c(t*11))}],
 ['다리 찢기',(t,P)=>{P.ll=P.lr=1.42;P.ry+=.17;P.al=P.ar=1.3}],
 ['제자리 전력질주',(t,P)=>{const a=s(t*26);P.ll=1.15*a;P.lr=-1.15*a;P.kl=1.1;P.kr=1.1;P.al=-a;P.ar=a;P.bl=P.br=1.6}],
 ['게걸음',(t,P)=>{P.ll=P.lr=.95;P.kl=P.kr=-2.1;P.al=P.ar=1.5;P.bl=P.br=2.1;P.rx+=.25*s(t*9);P.ry+=.1}],
 ['치실 댄스',(t,P)=>{const a=s(t*19);P.al=.75+.85*a;P.ar=.75-.85*a;P.rx+=.09*a;P.ll=.2*a;P.lr=-.2*a}],
 ['뒤돌려차기',(t,P)=>{P.ll=2.3*Math.max(0,s(t*13));P.lr=2.3*Math.max(0,-s(t*13));P.ry+=-.05}],
 ['닭 날개',(t,P)=>{P.al=P.ar=.95;P.bl=P.br=-2.5+.7*s(t*31)}],
 ['셀프 싸대기',(t,P)=>{P.al=2.05;P.bl=2.6+.7*s(t*25);P.ar=.2;P.br=.5*s(t*25)}],
 ['다리 헬리콥터',(t,P)=>{P.ll=t*19;P.lr=t*19+PI;P.ry+=-.26;P.al=P.ar=1.5}],
 ['오징어춤',(t,P)=>{P.al=1.3+s(t*13);P.ar=1.3+s(t*13+1.5);P.ll=.8+.6*s(t*13+3);P.lr=.8+.6*s(t*13+4.5);P.bl=P.kl=2*s(t*9);P.br=P.kr=-2*s(t*9)}],
 ['개구리 점프',(t,P)=>{const h=ab(s(t*13));P.ry+=-.36*h;P.ll=P.lr=.5+.8*(1-h);P.kl=P.kr=2.5*(1-h);P.al=P.ar=2.4*h}],
 ['고장난 로봇',(t,P)=>{const q=Math.floor(t*9);P.al=(q*2.3)%3;P.ar=(q*1.1)%3;P.ll=(q%3)*.35;P.lr=((q+1)%3)*.35;P.bl=(q%2)*1.57;P.br=((q+1)%2)*1.57}],
 ['무릎 슬라이딩',(t,P)=>{P.kl=P.kr=2.7;P.ll=P.lr=-.6;P.rx+=.3*s(t*5);P.ry+=.14;P.al=P.ar=2.5}],
 ['강아지 뒷발질',(t,P)=>{P.ll=1.05;P.kl=2.4*s(t*33);P.al=.4;P.ar=.2}],
 ['늘어진 허우적',(t,P)=>{P.sl=P.sr=2.4;P.al=1.1+1.2*s(t*8);P.ar=1.1-1.2*s(t*8);P.bl=2*s(t*6);P.br=-2*c(t*6)}],
 ['티라노 앞발',(t,P)=>{P.sl=P.sr=.32;P.al=P.ar=1.6;P.bl=P.br=-1.6+.4*s(t*30);P.ll=.25*s(t*12);P.lr=-.25*s(t*12)}],
 ['다리만 길어짐',(t,P)=>{P.gl=P.gr=1.5+.4*s(t*14);P.ry+=-.2;P.al=P.ar=.8}],
 ['한 발로 뺑뺑이',(t,P)=>{P.ll=1.9;P.kl=-1.5;P.al=1.5;P.ar=2.5;P.lr=0;P.bl=2*s(t*20)}],
 ['양팔 빨래 짜기',(t,P)=>{P.al=P.ar=1.45;P.bl=3.2*s(t*20);P.br=-3.2*s(t*20)}],
];
const VOW_MOVES=[
 ['머리 승천',(t,P)=>{P.hy=-.42-.08*s(t*20)}],
 ['호떡 되기',(t,P)=>{P.sx=1.75;P.sy=.42;P.ry+=.16}],
 ['멸치 되기',(t,P)=>{P.sx=.42;P.sy=1.42}],
 ['대왕 머리',(t,P)=>{P.hs=2.5+.3*s(t*18)}],
 ['콩알 머리',(t,P)=>{P.hs=.32;P.hy=.02}],
 ['통째로 회전',(t,P)=>{P.rr=t*15}],
 ['지렁이',(t,P)=>{P.bd=.75*s(t*15);P.tw=.3*c(t*15)}],
 ['림보 꺾기',(t,P)=>{P.bd=1.15;P.hr=-1;P.rx+=-.1}],
 ['목 360도',(t,P)=>{P.hr=t*21}],
 ['머리 위성 궤도',(t,P)=>{P.hx=.42*c(t*11);P.hy=-.2+.32*s(t*11);P.hr=t*9}],
 ['도리도리',(t,P)=>{P.hr=.8*s(t*31)}],
 ['부들부들',(t,P)=>{P.rx+=.025*s(t*93);P.ry+=.02*s(t*77);P.sy=.93}],
 ['분신술',(t,P)=>{P.clones=1;P.rr=.12*s(t*12)}],
 ['잔상 남기기',(t,P)=>{P.ghost=1;P.rx+=.33*s(t*11)}],
 ['물구나무',(t,P)=>{P.rr=PI;P.sy=.98+.1*s(t*24)}],
 ['뻗어버리기',(t,P)=>{P.rr=PI/2;P.ry+=.2;P.rx+=.05*s(t*30)}],
 ['엉덩이 씰룩',(t,P)=>{P.tw=.75*s(t*26);P.bd=.2*s(t*13)}],
 ['고개만 쭉',(t,P)=>{P.hx=.32*s(t*10);P.hy=-.08}],
 ['문워크',(t,P)=>{P.rx+=.4*s(t*5);P.rr=-.25*c(t*5)}],
 ['머리 튕기기',(t,P)=>{P.hy=-.32*ab(s(t*16));P.hs=1-.25*ab(c(t*16))}],
 ['꽈배기',(t,P)=>{P.tw=1.1*s(t*9);P.bd=-.9*c(t*9);P.hr=-1.2*s(t*9)}],
 ['젤리 출렁',(t,P)=>{const q=s(t*23);P.sx=1+.32*q;P.sy=1-.32*q}],
];
let rnd=Math.random,mapC={},mapV={};
function reseed(seed){let a=seed>>>0;rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};const sh=x=>{x=[...x];for(let i=x.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};const mc=sh(CONS_MOVES),mv=sh(VOW_MOVES);CHO.forEach((j,i)=>mapC[j]=mc[i]);JUNG.forEach((j,i)=>mapV[j]=mv[i])}
/* 큰 춤: [박자, 자세, 옵션] */
const stepL={ll:.62,lr:-.12,kl:-1.5,kr:.5,al:1.15,ar:.25,bl:-1.2,br:.9,bd:.38,tw:.25,rx:-.05,ry:.03,hr:.18},low={ll:.1,lr:.1,kl:.9,kr:.9,al:.5,ar:.5,bl:1.3,br:1.3,sy:.92,ry:.05,bd:-.1},spreadV={ll:.62,lr:.62,al:1.45,ar:1.45,bl:-.2,br:-.2};
const s1={ry:.12,ll:1.25,kl:.25,lr:.25,kr:1.9,al:-.05,ar:.35,bl:.3,br:.5,rx:.05,bd:.3,hr:.12},s2={ry:.1,ll:.85,kl:.5,lr:-.45,kr:.8,al:.1,ar:.5,bl:.4,br:.9,rx:.02,bd:.12,tw:.2},s3={ry:.13,ll:.1,kl:2,lr:.1,kr:2,al:.2,ar:.2,bl:.5,br:.5,bd:.35};
const spinUp=(start,end)=>{const V=rp(spreadV),Ew=widen(E,1.4),Emw=widen(Em,1.4),cyc=[{...V,rot:PIm},{...Ew,rot:PIm},{...hk(V,2),rot:PIm},{...Emw,rot:PIm}],o=[[start,{...V,rot:PIm}]];let b=start+.9,d=.9,i=1;while(b<end){o.push([b,cyc[i%4]]);b+=d;d=Math.max(.28,d*.84);i++}return o};
const wind=(start,n)=>{const v=[rp(spreadV),F,rp({ll:1.3,lr:.3,kl:-.8,al:.3,ar:1.5}),mirror(F)],o=[];for(let i=0;i<n;i++)o.push([start+i,{...v[i%4],cel:null,rot:F.rot+i*2.35},{orbit:1}]);return o};
const six=(st)=>[[st,rp(s1)],[st+1,rp(s2)],[st+2,hk(rp(s3),1)],[st+3,hk(rp(swapK(s1)),2)],[st+4,hk(rp(swapK(s2)),2)],[st+5,hk(rp(s3),1,true)],[st+6,rp(s1)],[st+7,rp(s2)]];
const sprint=i=>({ll:i%2?1.25:-.35,lr:i%2?-.35:1.25,kl:i%2?.2:1.7,kr:i%2?1.7:.2,al:i%2?1.6:-.3,ar:i%2?-.3:1.6,bl:1.7,br:1.7,bd:-.7,rr:.28,hx:.1,hy:.03});
const fit=(q,end=8)=>{const last=Math.max(...q.map(k=>k[0]));return q.map(k=>[k[0]*end/last,k[1],k[2]])};
const flap=i=>rp({al:.85,ar:.85,bl:i%2?-2.9:-.9,br:i%2?-2.9:-.9,ll:i%2?.35:.1,lr:i%2?.35:.1});
const BIG={
 headspin:()=>fit([[0,B],...spinUp(.7,6.6),[6.9,F],[8,A]]),
 windmill:()=>fit([[0,rp(low)],...wind(.6,7),[7.5,F],[8,A]]),
 sixstep:()=>fit([...six(0),[7.7,B],[8,A]]),
 combo:()=>fit([[0,B],...six(.6).slice(0,3),...spinUp(3.2,5.4),...wind(5.4,2).map(k=>[k[0],k[1],k[2]]),[7.5,F],[8,A]]),
 groove:()=>[[0,B],[.5,rp({hy:-.4})],[1,DD],[1.5,rp({hs:2.4})],[2,C],[2.5,Cm],[3,rp(pinA)],[3.5,rp(pinB)],[4,rp(octA)],[4.5,rp(octB)],[5,B],[5.5,F],[6,mirror(F)],[6.5,rp({hs:2.6,al:2.6,ar:2.6})],[7.2,B],[8,A]],
 run:()=>{const o=[[0,B]];for(let i=0;i<8;i++)o.push([.4+i*.27,rp(sprint(i))]);o.push([2.6,rp(sprint(0)),{dx:.25}],[2.85,rp(sprint(1)),{dx:.7}],[3.1,rp(sprint(0)),{dx:1.8}]);o.push([3.4,rp(sprint(1)),{dx:-1.9,snap:1}]);for(let i=0;i<6;i++)o.push([3.6+i*.25,rp(sprint(i)),{dx:-1.6+i*.3}]);o.push([5.3,DD,{dx:0}],[6,rp({al:2.7,ar:2.7,hs:1.5}),{dx:0}],[6.8,B,{dx:0}],[8,A,{dx:0}]);return o},
 melt:()=>fit([[0,rp(low)],[.7,rp({sy:.45,sx:1.5,ry:.16,al:.1,ar:.1,hs:.9})],[3,rp({sy:.26,sx:2,ry:.24,hs:.8})],[5,rp({sy:.26,sx:2.2,ry:.24,hs:1.2})],[5.8,rp({sy:1.25,sx:.6,ry:-.08})],[6.5,B],[8,A]]),
 love:()=>fit([[0,rp({al:2.6,ar:2.6,bl:2.2,br:2.2})],[1,rp({al:2.6,ar:2.6,bl:2.2,br:2.2,hs:1.6})],[2,rp({al:2.6,ar:2.6,bl:2.2,br:2.2,hs:2.2})],[3,rp({al:2.6,ar:2.6,bl:2.2,br:2.2,hs:3})],[3.3,rp({hs:.35,ry:.02})],[4.2,rp({hs:.35,ll:.9,lr:.9})],[5.2,B],[6,F],[7,DD],[8,A]]),
 chicken:()=>{const o=[];for(let i=0;i<16;i++)o.push([i*.4,flap(i),{dy:-Math.min(i,10)*.055}]);return[...o,[6.6,rp({al:2.7,ar:2.7}),{dy:0}],[7.2,B,{dy:0}],[8,A,{dy:0}]]},
 lotto:()=>fit([[0,B],[.5,rp({al:2.7,ar:2.7}),{clones:1}],[1.2,rp({ll:.8,lr:.8,al:1.4,ar:1.4}),{clones:1}],[2,rp({al:2.7,ar:2.7,hs:1.6}),{clones:1}],[2.8,F,{clones:1}],[3.6,mirror(F),{clones:1}],[4.4,rp({al:2.7,ar:2.7,ll:.7,lr:.7}),{clones:1}],[5.2,B,{clones:1}],[6,rp({hs:2.2}),{clones:1}],[7,DD],[8,A]]),
 sink:()=>fit([[0,rp({al:2.5,ar:2.5})],[.8,rp({al:2.7,ar:2.3}),{dy:.15}],[1.6,rp({al:2.3,ar:2.7}),{dy:.35}],[2.4,rp({al:2.7,ar:2.3}),{dy:.65}],[3.2,rp({al:2.5,ar:2.5}),{dy:1.2}],[4,rp({al:2.5,ar:2.5}),{dy:-1.3,snap:1}],[4.6,F,{dy:-.5}],[5.4,DD,{dy:0}],[6.5,B,{dy:0}],[8,A,{dy:0}]]),
 zombie:()=>fit([[0,rp({al:1.45,ar:1.45,hr:.5,bd:.3})],[1,rp({al:1.45,ar:1.45,hr:-.5,bd:-.3,ll:.2}),{dx:.08}],[2,rp({al:1.6,ar:1.2,hr:.6,bd:.3,lr:.2}),{dx:.16}],[3,rp({al:1.2,ar:1.6,hr:-.6,bd:-.3,ll:.2}),{dx:.24}],[4,rp({rr:1.5,ry:.25,al:.1,ar:.1})],[6,rp({rr:1.5,ry:.25,al:1.4,ar:1.4})],[7,B,{dx:0}],[8,A,{dx:0}]]),
 bigmouth:()=>fit([[0,rp({hs:1.5}),{mouth:3}],[1,rp({hs:2.1,al:2,ar:2}),{mouth:4}],[2.5,rp({hs:2.6}),{mouth:5}],[3.5,rp({hs:3}),{mouth:6}],[5,rp({hs:.4}),{mouth:1}],[6,B],[8,A]]),
};
const pinA={al:2.8,ar:.2,bl:.4,br:-.4},pinB={al:.2,ar:2.8,bl:-.4,br:.4},octA={bl:2.8,br:-2.4,kl:2.2,kr:-1.6,bd:.3},octB={bl:-2.4,br:2.8,kl:-1.6,kr:2.2,bd:-.3};
/* 상태 */
const X=A.body.slice(),V0=new Float32Array(M*2),T={body:A.body,head:A.head,rot:0,cel:'A',mir:false};
const H={x:A.head.x,y:A.head.y,ang:0,s:1,vx:0,vy:0,va:0,vs:0},R={rot:0,v:0,dx:0,dy:0,vx:0,vy:0};
let hkA=0,hkB=0,hkU=1,hfA=false,hfB=false,cloneOn=0,orbit=0,mouth=0,mouthExtra=0,bigSeq=null,bigT=0,bigI=0,cOv={},vOv={},tOv=0,lvl=0,qv=0,tilv=0,dots=false,settled=false,glabel='';
const now2=()=>performance.now();function endBig(){Object.assign(RX,REST);for(const k in RV)RV[k]=0;T.dx=0;T.dy=0;setTarget(A);R.rot=0}
const wrap=a=>{a=(a+PIm)%TAU;return a<0?a+TAU-PIm:a-PIm};
function setTarget(p,o={}){T.body=p.body;T.head=p.head;T.rot=p.rot;T.cel=p.cel;T.mir=p.mir;if(p.head.k!==hkB||!!p.head.flip!==hfB){hkA=hkU<.5?hkA:hkB;hfA=hkU<.5?hfA:hfB;hkB=p.head.k;hfB=!!p.head.flip;hkU=0}
 if(o.snap){R.dx=o.dx??R.dx;R.dy=o.dy??R.dy;R.vx=R.vy=0}if(o.dx!==undefined)T.dx=o.dx;if(o.dy!==undefined)T.dy=o.dy;cloneOn=o.clones?1:0;orbit=o.orbit?1:0;if(o.mouth)mouthExtra=o.mouth}
T.dx=0;T.dy=0;
function small(){const q={...cOv,...vOv};if(lvl>0){q.hs=(q.hs||1)+.1*lvl;q.ry=(q.ry||0)-.012*lvl}if(qv>0)q.hr=(q.hr||0)+Math.sin(performance.now()/70)*.14*Math.min(3,qv);if(tilv>0){q.bd=(q.bd||0)+Math.sin(performance.now()/160)*.4;q.tw=(q.tw||0)+Math.cos(performance.now()/160)*.3}if(dots){q.bd=(q.bd||0)+.2;q.al=.05;q.ar=.05;q.ry=(q.ry||0)+.03;q.hr=(q.hr||0)+.12}return rp(q)}
function stepBody(dt){const h=dt/2;for(let n=0;n<2;n++)for(let i=0;i<M*2;i++){const w=seg[i>>1],k=lerp(460,240,w),c=2*Math.sqrt(k)*.5;V0[i]+=((T.body[i]-X[i])*k-V0[i]*c)*h;X[i]+=V0[i]*h}
 let da=T.head.ang-H.ang;while(da>PIm)da-=TAU;while(da<-PIm)da+=TAU;const kk=260,cc=2*Math.sqrt(kk)*.65;H.vx+=((T.head.x-H.x)*kk-H.vx*cc)*dt;H.x+=H.vx*dt;H.vy+=((T.head.y-H.y)*kk-H.vy*cc)*dt;H.y+=H.vy*dt;H.va+=(da*kk-H.va*cc)*dt;H.ang+=H.va*dt;H.vs+=((T.head.s-H.s)*kk-H.vs*cc)*dt;H.s+=H.vs*dt;
 const kr=orbit?70:150,cr=2*Math.sqrt(kr)*.85;R.v+=((T.rot-R.rot)*kr-R.v*cr)*dt;R.rot+=R.v*dt;const kd=120,cd=2*Math.sqrt(kd)*.8;R.vx+=((T.dx-R.dx)*kd-R.vx*cd)*dt;R.dx+=R.vx*dt;R.vy+=((T.dy-R.dy)*kd-R.vy*cd)*dt;R.dy+=R.vy*dt;
 hkU=Math.min(1,hkU+dt*8);mouth=Math.max(0,mouth-dt*7);mouthExtra=Math.max(0,mouthExtra-dt*1.6)}
function update(dt,beatClock,speaking){
 if(bigSeq){bigT+=dt/BEAT;while(bigI<bigSeq.length&&bigSeq[bigI][0]<=bigT){const[,p,o]=bigSeq[bigI];setTarget(p,o||{dx:T.dx,dy:T.dy});bigI++}if(bigI>=bigSeq.length&&bigT>=8.15){bigSeq=null;cloneOn=0;orbit=0;endBig()}}
 else{tOv-=dt;if(tOv<0){cOv={};vOv={};lvl=0;qv=0;tilv=0;dots=false}
  if(speaking||Object.keys(cOv).length||Object.keys(vOv).length)setTarget(small());
  else if(beatClock!==null){const b=Math.floor(beatClock),g=[A,rp({ry:.018,sy:.97}),A,rp({ry:.018,sy:.97}),C,rp({ry:.018,sy:.97}),A,Cm];setTarget(g[((b%8)+8)%8])}else setTarget(A)}
 stepBody(dt);let e=0;for(let i=0;i<M*2;i+=11)e+=Math.abs(X[i]-T.body[i]);settled=e/(M*2/11)<2.4&&Math.abs(H.x-T.head.x)<3&&hkU>=1&&Math.abs(wrap(R.rot-T.rot))<.02}
const wob=(i,s0)=>Math.sin(i*.35+s0)*1.4+Math.sin(i*.13+s0*1.7)*1.4;
function headPoly(){const fp=(p,f)=>f?p.map((q,i)=>{const r=p[(72-i)%72];return[-r[0],r[1]]}):p,a=fp(polyOf(hkA).p,hfA&&hkA===1),b=fp(polyOf(hkB).p,hfB&&hkB===1);if(hkU>=1||hkA===hkB)return b;const t=hkU;return a.map((p,i)=>[p[0]+(b[i][0]-p[0])*t,p[1]+(b[i][1]-p[1])*t])}
function draw(g,ox,oy,S,tick,raster){const sd=tick*2.1;const lw=2.6/S*Math.min(1,S/.28+.25);
 g.save();g.translate(ox+R.dx*H_U*S,oy+R.dy*H_U*S);g.rotate(R.rot);g.scale(S,S);g.translate(-CXs,-CYs);g.lineJoin=g.lineCap='round';
 const useR=raster&&settled&&T.cel&&IMG[T.cel];
 if(useR){g.save();if(T.mir){g.translate(CXs*2,0);g.scale(-1,1)}const rot=T.rot;if(rot){g.translate(CXs,CYs);g.rotate(-rot);g.translate(-CXs,-CYs)}g.drawImage(IMG[T.cel],0,0,2362,2362);g.restore()}
 else{g.beginPath();for(let i=0;i<M;i++){const x=X[i*2]+wob(i,sd)*1.1,y=X[i*2+1]+wob(i,sd+9)*1.1;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#0d0d0d';g.lineWidth=lw;g.stroke()}
 const k=hkU<.5?hkA:hkB,fl=hkU<.5?hfA:hfB,side=k===1;
 g.save();g.translate(H.x,H.y);g.rotate(H.ang);g.scale(HH*H.s,HH*H.s);
 if(!useR||mouth>.05||mouthExtra>.05){const poly=headPoly();g.beginPath();poly.forEach((q,i)=>{const x=q[0]+wob(i,sd+3)*.0016,y=q[1]+wob(i,sd+5)*.0016;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#0d0d0d';g.lineWidth=lw/(HH*H.s);g.stroke();
  if(k!==2){g.save();g.clip();const src=side?HEADS.side:HEADS.front,cen=side?headSide:headFront,sh=hkA===hkB?0:(hkU<.5?hkU*2:(1-hkU)*2)*.1*(fl?1:-1);g.scale(fl&&side?-1:1,1);g.fillStyle='#0d0d0d';const m=clamp(mouth+mouthExtra,0,6);src.feats.forEach((f,fi)=>{const low=!side&&fi===lowerFeat,dy=low?m*.05:0;g.beginPath();f.forEach((q,i)=>{const x=q[0]-cen.cx+sh,y=q[1]-cen.cy+dy;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fill()});
   if(!side&&m>.1){const up=HEADS.front.feats[lowerFeat],uy=up.reduce((s2,p)=>s2+p[1],0)/up.length-headFront.cy;g.beginPath();g.ellipse(sh,uy-.02+m*.025,.055+m*.012,m*.03,0,0,7);g.fill()}g.restore()}}
 g.restore();g.restore()}
/* 첫 초안 뼈대 상태: 평소 자모 춤 */
const RX={...REST},RV=Object.fromEntries(Object.keys(REST).map(k=>[k,0]));
let curC=null,curV=null,tC=0,tV=0,trail=[],boilSeed=0,boilT=0,fx={ex:0,q:0,til:0,dots:false};
const wrapA=wrap;
function rigStep(dt,now,calm){tC+=dt;tV+=dt;const P={...REST};if(curC)curC[1](tC,P);if(curV)curV[1](tV,P);
 if(curC||curV){const a=1+.16*Math.min(5,fx.ex);for(const k of['al','ar','bl','br','ll','lr','kl','kr','hr','bd','tw','rx','ry','rr','hy','hx'])P[k]*=a;P.hs*=1+.08*Math.min(5,fx.ex);P.sx=1+(P.sx-1)*a;P.sy=1+(P.sy-1)*a;
  if(fx.q){P.hr+=Math.sin(now/55)*.3*Math.min(3,fx.q)}if(fx.til){P.tw+=Math.sin(now/170)*.6;P.bd+=Math.cos(now/170)*.5}if(fx.dots){P.ry+=.03;P.al*=.3;P.ar*=.3;P.hy+=.03}}
 else{P.ry=.004*Math.sin(now/900);P.hr=.012*Math.sin(now/1300)}
 for(const k in REST){if(k==='clones'||k==='ghost'){RX[k]=P[k];continue}const hard=k==='rx'||k==='ry'?300:380;for(let i=0;i<2;i++){RV[k]+=(P[k]-RX[k])*hard*dt/2-RV[k]*15*dt/2;RX[k]+=RV[k]*dt/2}}
 mouth=Math.max(0,mouth-dt*7);boilT+=dt;if(boilT>.11&&!calm){boilT=0;boilSeed=Math.random()*4000|0}}
function drawRig(g,W,Ht,S,ox,oy,calm,accent){const boil=calm?0:5;
 if(RX.ghost>.5){trail.push({...RX});if(trail.length>7)trail.shift();trail.forEach((q,i)=>{if(i%2)return;g.globalAlpha=.2+.06*i;drawChar(g,q,ox,oy,S,{boil:0,seed:0,fill:null,stroke:accent?'#0d0d0d':'#ff2bb3'});g.globalAlpha=1})}else trail.length=0;
 if(RX.clones>.5){const off=W*.31,sc=S*.66;drawChar(g,{...RX,rr:-RX.rr},ox-off,oy+Ht*.12,sc,{boil,seed:boilSeed,mouth});drawChar(g,RX,ox+off,oy+Ht*.12,sc,{boil,seed:boilSeed,mouth})}
 drawChar(g,RX,ox,oy,S,{boil,seed:boilSeed,mouth})}
function toMorph(){const c=capture({...RX,rr:0,clones:0,ghost:0});X.set(c.body);V0.fill(0);H.x=c.head.x;H.y=c.head.y;H.ang=c.head.ang;H.s=c.head.s;H.vx=H.vy=H.va=H.vs=0;R.rot=wrap(RX.rr);R.v=0;R.dx=0;R.dy=0;R.vx=R.vy=0;T.dx=0;T.dy=0;hkA=hkB=0;hkU=1;hfA=hfB=false}
return{setImages(i){Object.assign(IMG,i)},reseed,
 update(dt,now,calm){if(bigSeq)update(dt,null,false);else rigStep(dt,now,calm)},
 render(g,W,Ht,S,ox,oy,tick,calm,accent){if(bigSeq){const orb=orbit?[Math.cos(now2()/500)*W*.05,Math.sin(now2()/500)*Ht*.04]:[0,0];if(cloneOn){draw(g,ox-W*.31,oy+Ht*.12,S*.62,tick,false);draw(g,ox+W*.31,oy+Ht*.12,S*.62,tick,false)}draw(g,ox+orb[0],oy+orb[1],S,tick,true)}else drawRig(g,W,Ht,S,ox,oy,calm,accent)},
 event(e){if(bigSeq){if(e.kind==='v')mouth=1;return}fx={ex:e.ex,q:e.q,til:e.til,dots:e.dots};if(e.kind==='v'){curV=mapV[e.j];tV=0;for(const k of['rr','hr'])RX[k]=wrap(RX[k]);mouth=/[ㅏㅑㅐㅒㅓㅕㅘ]/.test(e.j)?1:.65}else{curC=mapC[e.j];tC=0;for(const k of['al','ar','ll','lr'])RX[k]=wrap(RX[k])}},
 big(name){const f=BIG[name];if(!f)return false;if(!bigSeq)toMorph();curC=curV=null;bigSeq=f().slice().sort((a,b)=>a[0]-b[0]);bigT=0;bigI=0;return true},
 relax(){curC=curV=null;for(const k of['rr','hr','al','ar','ll','lr'])RX[k]=wrap(RX[k])},
 isBig:()=>!!bigSeq,stop(){if(bigSeq){bigSeq=null;cloneOn=0;orbit=0;endBig()}curC=curV=null}};
})();
const IMG={};

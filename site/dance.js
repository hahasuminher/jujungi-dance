/* 2D 춤 엔진: 그린 포즈를 목표로 윤곽 점이 스프링처럼 따라가 중간 동작을 만든다 */
const SPECIALS={퇴근:'run',월요일:'melt',사랑해:'love',치킨:'chicken',로또:'lotto',살려줘:'sink',야근:'zombie',주둥이:'bigmouth',윈드밀:'windmill',비보이:'combo',스텝:'sixstep',둠칫:'groove',출근:'commute',월급:'salary',다이어트:'diet',시험:'exam',망했다:'doom',대박:'jackpot',소주:'soju',커피:'coffee',야식:'snack',졸려:'sleepy',엄마:'mom',사장님:'boss',생일:'bday',바이:'bye',바이바이:'bye',빠이:'bye',잘자:'night','잘 자':'night',굿나잇:'night',굿밤:'night'};
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
 ['게걸음',(t,P)=>{P.ll=P.lr=.95;P.kl=P.kr=-2.1;P.al=P.ar=1.5;P.bl=P.br=2.1;P.rx+=.25*s(t*9);P.ry+=.1}],
 ['치실 댄스',(t,P)=>{const a=s(t*19);P.al=.75+.85*a;P.ar=.75-.85*a;P.rx+=.09*a;P.ll=.2*a;P.lr=-.2*a}],
 ['뒤돌려차기',(t,P)=>{P.ll=2.3*Math.max(0,s(t*13));P.lr=2.3*Math.max(0,-s(t*13));P.ry+=-.05}],
 ['닭 날개',(t,P)=>{P.al=P.ar=.95;P.bl=P.br=-2.5+.7*s(t*31)}],
 ['셀프 싸대기',(t,P)=>{P.al=2.05;P.bl=2.6+.7*s(t*25);P.ar=.2;P.br=.5*s(t*25)}],
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
 ['상체 스프링',(t,P)=>{const q=s(t*20);P.sy=1+.14*q;P.ry+=-.07*Math.max(0,q);P.bd=.25*c(t*20)}],
 ['트위스트',(t,P)=>{P.tw=.9*s(t*17);P.bd=-.5*s(t*17);P.rx+=.08*c(t*17)}],
 ['머리 승천',(t,P)=>{P.hy=-.42-.08*s(t*20)}],
 ['호떡 되기',(t,P)=>{P.sx=1.75;P.sy=.42;P.ry+=.16}],
 ['멸치 되기',(t,P)=>{P.sx=.42;P.sy=1.42}],
 ['대왕 머리',(t,P)=>{P.hs=2.5+.3*s(t*18)}],
 ['콩알 머리',(t,P)=>{P.hs=.32;P.hy=.02}],
 ['지렁이',(t,P)=>{P.bd=.75*s(t*15);P.tw=.3*c(t*15)}],
 ['림보 꺾기',(t,P)=>{P.bd=1.15;P.hr=-1;P.rx+=-.1}],
 ['목 360도',(t,P)=>{P.hr=t*21}],
 ['머리 위성 궤도',(t,P)=>{P.hx=.42*c(t*11);P.hy=-.2+.32*s(t*11);P.hr=t*9}],
 ['도리도리',(t,P)=>{P.hr=.8*s(t*31)}],
 ['부들부들',(t,P)=>{P.rx+=.025*s(t*93);P.ry+=.02*s(t*77);P.sy=.93}],
 ['분신술',(t,P)=>{P.clones=1;P.rr=.12*s(t*12)}],
 ['잔상 남기기',(t,P)=>{P.ghost=1;P.rx+=.33*s(t*11)}],
 ['엉덩이 씰룩',(t,P)=>{P.tw=.75*s(t*26);P.bd=.2*s(t*13)}],
 ['고개만 쭉',(t,P)=>{P.hx=.32*s(t*10);P.hy=-.08}],
 ['문워크',(t,P)=>{P.rx+=.4*s(t*5);P.rr=-.25*c(t*5)}],
 ['머리 튕기기',(t,P)=>{P.hy=-.32*ab(s(t*16));P.hs=1-.25*ab(c(t*16))}],
 ['꽈배기',(t,P)=>{P.tw=1.1*s(t*9);P.bd=-.9*c(t*9);P.hr=-1.2*s(t*9)}],
 ['젤리 출렁',(t,P)=>{const q=s(t*23);P.sx=1+.32*q;P.sy=1-.32*q}],
];
/* 전신 동작: 앉고 구르고 뒤집히고 돈다 */
const WHOLE=(()=>{const t2=TAU,ff=[A,widen(E,1.25),hk(A,2),widen(Em,1.25)],s=Math.sin;return[
 {n:'쩍벌',dur:.5,pose:()=>B},{n:'쪼그려',dur:.5,f:(t,P)=>{P.ry=.17;P.kl=P.kr=2.4;P.ll=P.lr=.45;P.al=P.ar=1.1;P.bl=P.br=1.6}},
 {n:'물구나무',c:'tilt',dur:.7,f:(t,P)=>{P.rr=PIm;P.ll=P.lr=.45+.2*s(t*14);P.al=P.ar=2.9;P.bl=P.br=.2}},{n:'앞구르기',c:'spin',dur:.6,f:(t,P)=>{P.rr=t*t2/.6;P.kl=P.kr=2.4;P.ll=P.lr=-.4;P.al=P.ar=.4;P.bl=P.br=2;P.ry=.1}},
 {n:'옆돌기',c:'spin',dur:.65,f:(t,P)=>{P.rr=t*t2/.65;P.rx=.3*s(t*4.8);P.ll=P.lr=.85;P.al=P.ar=2.3}},
 {n:'점프',dur:.5,f:(t,P)=>{const h=s(t*6.28);P.ry=-.34*h;P.kl=P.kr=2.1*h;P.ll=P.lr=.5*h;P.al=P.ar=2.5*h}},{n:'대자 눕기',c:'tilt',dur:.6,f:(t,P)=>{P.rr=1.57;P.ry=.22;P.ll=P.lr=.6;P.al=P.ar=1.2}},
 {n:'엎드리기',c:'tilt',dur:.6,f:(t,P)=>{P.rr=-1.57;P.ry=.26;P.al=P.ar=.15;P.ll=.1;P.lr=.1;P.kl=P.kr=1.2*s(t*22)}},{n:'런지',dur:.5,f:(t,P)=>{P.ll=1;P.kl=.2;P.lr=-.7;P.kr=1.9;P.ry=.12;P.al=2.4;P.ar=.3;P.bd=.4}},
 {n:'다리찢기',dur:.5,f:(t,P)=>{P.ll=P.lr=1.42;P.ry=.19;P.al=P.ar=1.3}},{n:'제자리 턴',c:'spin',dur:.62,pose:t=>ff[Math.floor(t*11)%4]},{n:'옆모습',dur:.45,pose:()=>E},{n:'반대 옆모습',dur:.45,pose:()=>Em},{n:'뒷모습',dur:.45,pose:()=>ff[2]},
 {n:'긴 목',dur:.45,pose:()=>DD},{n:'갸우뚱',dur:.42,pose:()=>C},{n:'반대 갸우뚱',dur:.42,pose:()=>Cm},{n:'뒤집기',c:'tilt',dur:.55,pose:()=>F},
 {n:'브릿지',c:'tilt',dur:.6,f:(t,P)=>{P.rr=2.9;P.bd=1.1;P.ry=.08;P.kl=P.kr=1.2;P.al=P.ar=2.6}},{n:'큰절',c:'tilt',dur:.6,f:(t,P)=>{P.rr=1.3;P.kl=P.kr=2.2;P.ry=.17;P.al=P.ar=2.7}},{n:'벌러덩',c:'tilt',dur:.6,f:(t,P)=>{P.rr=-1.5;P.ry=.2;P.ll=.8+.5*s(t*20);P.lr=.8-.5*s(t*20)}},
 {n:'트월킹',dur:.55,f:(t,P)=>{P.tw=.95*s(t*30);P.bd=.55;P.kl=P.kr=1.4;P.ry=.1;P.rr=.3}},{n:'전력질주',dur:.55,f:(t,P)=>{const a=s(t*26);P.ll=1.2*a;P.lr=-1.2*a;P.kl=P.kr=1.1;P.al=-a;P.ar=a;P.bl=P.br=1.6;P.rr=.2;P.bd=-.4}},
 {n:'다리 헬기',dur:.6,f:(t,P)=>{P.ll=t*19;P.lr=t*19+PIm;P.ry=-.26;P.al=P.ar=1.5}},
 {n:'슬라이딩',dur:.5,f:(t,P)=>{P.rx=-.38+t*1.5;P.rr=-.55;P.ll=1.1;P.kl=.1;P.kr=2;P.al=2.6;P.ar=.5}},{n:'공중제비',c:'spin',dur:.5,f:(t,P)=>{P.rr=-t*TAU/.5;P.ry=-.42*s(t*6.28);P.kl=P.kr=2.3;P.ll=P.lr=-.3;P.al=P.ar=.4;P.bl=P.br=2}},
 {n:'코사크',dur:.55,f:(t,P)=>{const a=s(t*24)>0;P.ry=.16;P.ll=a?1.2:.1;P.kl=a?.1:2.3;P.lr=a?.1:1.2;P.kr=a?2.3:.1;P.al=P.ar=1.45;P.bl=P.br=1.9}},
 {n:'말 타기',dur:.55,f:(t,P)=>{P.ry=.1-.1*Math.abs(s(t*16));P.ll=P.lr=.8;P.kl=P.kr=1.9;P.ar=2.6;P.br=t*30;P.al=1;P.bl=1.8;P.rx=.15*s(t*8)}},
 {n:'배치기',dur:.45,f:(t,P)=>{const q=s(t*7);P.bd=-1.2*q;P.rx=.22*q;P.al=P.ar=.2;P.hr=-.4*q}},{n:'곤두박질',c:'tilt',dur:.55,f:(t,P)=>{P.rr=PIm*Math.min(1,t*4);P.ry=-.3+t*.7;P.ll=P.lr=.7;P.al=P.ar=2.7}},{n:'양옆 스텝',dur:.5,f:(t,P)=>{const q=s(t*12.5);P.rx=.17*q;P.ll=q>0?.65:.1;P.lr=q<0?.65:.1;P.kl=q>0?.3:1.2;P.kr=q<0?.3:1.2;P.bd=.45*q;P.al=1+.7*q;P.ar=1-.7*q;P.ry=.05}},
 {n:'웨이브',dur:.6,f:(t,P)=>{const a=t*14;P.bd=.75*s(a);P.tw=.65*s(a+1.2);P.hx=.05*s(a+2);P.hy=-.04*s(a+2.4);P.al=1+.8*s(a+.8);P.ar=1+.8*s(a+2.4);P.bl=1.2*s(a+1);P.br=1.2*s(a+2)}},
 {n:'골반 튕기기',dur:.5,f:(t,P)=>{const q=s(t*25);P.tw=1*q;P.bd=-.45*q;P.kl=P.kr=.9;P.ry=.06;P.al=P.ar=.8;P.bl=P.br=1.8}},
 {n:'바닥 찍기',dur:.5,f:(t,P)=>{const q=Math.abs(s(t*12.5));P.kl=P.kr=2.1*q;P.ll=P.lr=.45;P.ry=.18*q;P.al=P.ar=.15;P.bl=P.br=-.3;P.bd=.3*q;P.hy=.05*q}},
 {n:'어깨 들썩',dur:.5,f:(t,P)=>{const q=Math.abs(s(t*18));P.ry=.05-.06*q;P.al=P.ar=.4+.7*q;P.bl=P.br=1.8;P.hy=.04*q;P.sy=1-.06*q}},
 {n:'깡총 스텝',dur:.55,f:(t,P)=>{const q=s(t*17);P.ry=-.14*Math.abs(q);P.rx=.14*s(t*8.5);P.ll=q>0?.8:.05;P.kl=q>0?-1:1.7;P.kr=q>0?1.7:.2;P.al=q>0?2:.3;P.ar=q>0?.3:2}},
 {n:'앉았다 일어서기',dur:.55,f:(t,P)=>{const q=s(t*5.7);P.ry=.18*q;P.kl=P.kr=2.3*q;P.ll=P.lr=.4*q;P.al=P.ar=1.4*q+.2;P.bl=P.br=1.5}},
 {n:'크랩 워크',dur:.55,f:(t,P)=>{const q=s(t*20);P.ll=P.lr=.95;P.kl=P.kr=-2.1+.5*q;P.al=P.ar=1.5;P.bl=P.br=2.1;P.rx=.28*s(t*5.7);P.ry=.11;P.bd=.3*q}},
 {n:'허리 돌리기',dur:.55,f:(t,P)=>{const a=t*17;P.tw=.8*c(a);P.bd=.75*s(a);P.al=1.3+.5*s(a);P.ar=1.3-.5*s(a);P.rx=.05*c(a)}},
 {n:'무릎 튕기기',dur:.5,f:(t,P)=>{const q=Math.abs(s(t*18));P.kl=.3+1.5*q;P.kr=.3+1.5*(1-q);P.ll=.2;P.lr=.2;P.ry=.07*q;P.bd=.3*(q-.5);P.al=.9*q;P.ar=.9*(1-q)}},
 {n:'벽 튕기기',dur:.5,f:(t,P)=>{const q=s(t*12.5);P.rx=.36*q;P.rr=.5*q;P.kl=P.kr=1.2;P.al=P.ar=2.2}}]})();
let mapW={};
let rnd=Math.random,mapC={},mapV={};
function reseed(seed){let a=seed>>>0;rnd=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};const sh=x=>{x=[...x];for(let i=x.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};const mc=sh(CONS_MOVES),mv=sh(VOW_MOVES),mw=sh(WHOLE);JUNG.forEach((j,i)=>mapW[j]=mw[i%mw.length]);CHO.forEach((j,i)=>mapC[j]=mc[i]);JUNG.forEach((j,i)=>mapV[j]=mv[i])}
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
Object.assign(BIG,{
 commute:()=>fit([[0,Em,{dx:.14}],[1,rp({rr:-.3,bd:-.5,al:1.8,ar:1.8,ll:.3,kl:1.2}),{dx:.08}],[2,rp({rr:-.5,bd:-.6,al:2,ar:2,lr:.3,kr:1.2}),{dx:.02}],[3,rp({rr:-.7,al:2.4,ar:2.2}),{dx:-.06}],[4.2,rp({rr:-1.5,ry:.24,al:.1,ar:.1}),{dx:-.1}],[6,rp({rr:-1.5,ry:.24,sy:.8,al:.1,ar:.1}),{dx:-.1}],[7,rp(low),{dx:0}],[8,A,{dx:0}]]),
 salary:()=>fit([[0,B],[.7,rp({al:2.8,ar:2.8,hs:1.5}),{dy:-.22}],[1.6,rp({al:2.8,ar:2.8,ll:.7,lr:.7,hs:1.7}),{dy:-.3}],[2.6,F,{dy:-.1}],[3.2,rp({sy:.8,al:.2,ar:.2,hr:.5}),{dy:0}],[4.2,rp({rr:1.57,ry:.24,al:.1,ar:.1}),{dy:0}],[6.4,rp({rr:1.57,ry:.24,sy:.55,sx:1.3,al:.1,ar:.1}),{dy:0}],[7.3,rp(low)],[8,A]]),
 diet:()=>fit([[0,rp({sx:.4,sy:1.25,hs:.9})],[1.2,rp({sx:.34,sy:1.3,hs:.8})],[2,rp({sx:1.9,sy:.72,hs:1.35,bd:.2})],[3,rp({sx:2.3,sy:.62,hs:1.6,al:1.4,ar:1.4})],[4,rp({sx:.4,sy:1.25})],[5,rp({sx:2.4,sy:.6,hs:1.8})],[6.2,rp({sx:2.6,sy:.52,hs:2,ry:.1})],[7.2,B],[8,A]]),
 exam:()=>{const hold={al:2.45,ar:2.45,bl:2.3,br:2.3,hy:.03};return fit([[0,rp({...hold,hr:.4})],[.8,rp({...hold,hr:-.4,kl:1,kr:1,ry:.05})],[1.6,rp({...hold,rr:1.57,ry:.22}),{dx:-.14}],[2.4,rp({...hold,rr:3.14,ry:.06}),{dx:-.05}],[3.2,rp({...hold,rr:4.71,ry:.22}),{dx:.05}],[4,rp({...hold,rr:6.28}),{dx:.14}],[4.8,rp({...hold,rr:7.85,ry:.22}),{dx:.05}],[5.6,rp({...hold,rr:9.42,ry:.06}),{dx:-.05}],[6.6,hk(rp(low),0),{dx:0}],[8,A,{dx:0}]])},
 doom:()=>fit([[0,rp({kl:.9,kr:.9,ry:.04,hr:.3,al:.05,ar:.05})],[1.2,rp({kl:2.3,kr:2.3,ry:.17,al:.05,ar:.05,hy:.05,hr:.5})],[2.6,rp({sy:.6,sx:1.3,ry:.13,al:.05,ar:.05,hr:.5})],[3.8,rp({sy:.34,sx:1.8,ry:.22,hs:.9})],[6.2,rp({sy:.22,sx:2.3,ry:.27,hs:.85})],[7.2,rp(low)],[8,A]]),
 jackpot:()=>fit([[0,B],[.5,rp({al:2.8,ar:2.8}),{dy:-.25}],[1.2,B,{dy:0}],[1.7,rp({al:2.8,ar:2.8,ll:.8,lr:.8}),{dy:-.3,clones:1}],[2.5,B,{dy:0,clones:1}],[3,rp({al:2.8,ar:2.8,hs:1.8}),{dy:-.3,clones:1}],[3.8,F,{dy:0,clones:1}],[4.6,mirror(F),{clones:1}],[5.4,rp({ll:1.42,lr:1.42,ry:.19,al:1.3,ar:1.3}),{clones:1}],[6.4,DD],[7.2,B],[8,A]]),
 moon:()=>{const r={al:2.95,ar:2.95,ll:.02,lr:.02,sx:.72,sy:1.2};return[[0,B],[.8,rp(r),{dy:-.12}],[1.6,rp(r),{dy:-.5}],[2.4,rp(r),{dy:-1.05}],[3,rp(r),{dy:-1.9}],[3.3,rp({...r,rr:PIm}),{dy:1.9,snap:1}],[4,rp({...r,rr:PIm}),{dy:.75}],[4.8,rp({rr:PIm,ll:.6,lr:.6,al:1.4,ar:1.4}),{dy:.15}],[5.6,F,{dy:0}],[6.4,rp({al:2.8,ar:2.8,hs:1.6})],[7.2,B],[8,A]]},
 crash:()=>{const r={rr:PIm,al:.05,ar:.05,ll:.1,lr:.1};return[[0,rp({hr:.3})],[.8,rp({rr:.8,al:2.6,ar:2.6}),{dy:.1}],[1.6,rp(r),{dy:.45}],[2.4,rp(r),{dy:1.05}],[3,rp(r),{dy:1.9}],[3.3,rp(r),{dy:-1.9,snap:1}],[4,rp(r),{dy:-.7}],[4.8,rp({rr:6.28,sy:.45,sx:1.5,ry:.2}),{dy:0}],[6.2,rp({sy:.3,sx:1.9,ry:.24}),{dy:0}],[7.2,rp(low)],[8,A]]},
 soju:()=>fit([[0,rp({rr:.2,hr:.3,bd:.3})],[.8,rp({rr:-.3,hr:-.4,bd:-.4,ll:.3}),{dx:-.1}],[1.6,rp({rr:.35,hr:.5,bd:.5,lr:.3}),{dx:.1}],[2.4,rp({rr:-.4,hr:-.5,bd:-.5,al:1.5}),{dx:-.12}],[3.2,rp({rr:.45,bd:.6,ar:1.5}),{dx:.12}],[4,rp({rr:1.5,ry:.24,al:.1,ar:.2}),{dx:0}],[5.8,rp({rr:1.5,ry:.24,ll:.4,kl:1.2}),{dx:0}],[6.8,B],[8,A]]),
 coffee:()=>{const o=[];for(let i=0;i<24;i++)o.push([i*.25,i%2?rp({rx:.05,al:1.2,ar:.3,hr:.2,ll:.25,sy:1.04}):rp({rx:-.05,al:.3,ar:1.2,hr:-.2,lr:.25,sy:.97})]);return[...o,[6.2,rp({al:2.8,ar:2.8,hs:1.5})],[7,DD],[8,A]]},
 snack:()=>fit([[0,rp({hs:1.2,sx:1.15})],[1,rp({hs:1.5,sx:1.4,bd:.15})],[2,rp({hs:1.8,sx:1.7,sy:.9})],[3,rp({hs:2.1,sx:2,sy:.82,al:1,ar:1})],[4,rp({hs:2.5,sx:2.3,sy:.75})],[5.6,rp({hs:2.6,sx:2.5,sy:.7,kl:1.5,kr:1.5,ry:.1})],[6.6,rp({rr:1.5,ry:.2,sx:1.6})],[7.4,B],[8,A]]),
 sleepy:()=>fit([[0,rp({hy:.03,hr:.2})],[.8,rp({hy:.08,hr:.45,al:.05,ar:.05})],[1.2,rp({hr:0})],[2,rp({hy:.09,hr:-.45,al:.05,ar:.05})],[2.4,rp({hr:0})],[3.2,rp({hy:.1,hr:.5,kl:.8,kr:.8,ry:.04})],[4,rp({rr:.7,hy:.08,al:.1,ar:.1,kl:1,kr:1})],[4.8,rp({rr:1.57,ry:.24,al:.05,ar:.05})],[7,rp({rr:1.57,ry:.24,al:.05,ar:.05,sy:.92})],[7.7,DD],[8,A]]),
 mom:()=>{const at=rp({al:.02,ar:.02,ll:.01,lr:.01,sx:.84,sy:1.06});return[[0,rp({al:2.6,ar:2.6,hs:1.3}),{dy:-.2}],[.7,at,{dy:0}],[2.2,rp({rr:1.3,kl:2.2,kr:2.2,ry:.17,al:.05,ar:.05})],[3,at],[3.8,rp({rx:-.1,rr:-.35,al:.1,ar:.1}),{dx:-.1}],[4.3,at,{dx:0}],[5.1,rp({rx:.1,rr:.35,al:.1,ar:.1}),{dx:.1}],[5.6,at,{dx:0}],[7,rp({rr:1.3,kl:2.2,kr:2.2,ry:.17,al:2.7,ar:2.7})],[8,A]]},
 boss:()=>{const bow=rp({rr:1.3,kl:2.2,kr:2.2,ry:.17,al:2.7,ar:2.7}),up=rp(low);return[[0,up],[.7,bow],[1.4,up],[2.1,bow],[2.8,up],[3.5,bow],[4.2,up],[4.9,bow],[5.6,rp({al:2.7,ar:2.7,hs:1.3})],[6.5,B],[7.2,bow],[8,A]]},
 bye:()=>{const hi=rp({al:2.5,bl:.8,ar:.1}),lo=rp({al:2.5,bl:-.8,ar:.1});return[[0,hi],[.5,lo],[1,hi],[1.5,lo],[2,hi],[2.5,lo],[3,hk(rp({al:2.5,bl:.8}),1),{dx:.05}],[3.5,hk(rp({al:2.5,bl:-.8}),1),{dx:.25}],[4,hk(rp({ll:.5}),2),{dx:.55}],[4.5,hk(rp({lr:.5}),2),{dx:.95}],[5,hk(rp({ll:.5}),2),{dx:1.7}],[5.5,hk(rp({al:2.5,bl:.8}),0),{dx:-1.8,snap:1}],[6.1,rp({al:2.7,ar:2.7}),{dx:-.55}],[7,B,{dx:0}],[8,A,{dx:0}]]},
 night:()=>fit([[0,rp({hy:.02,hr:.15,al:2.4,bl:2.5})],[.9,rp({hr:-.2,ar:2.4,br:2.5})],[1.8,rp({hy:.08,hr:.4,al:.05,ar:.05})],[2.6,rp({kl:1.2,kr:1.2,ry:.08,hy:.08,hr:.45})],[3.4,rp({rr:.8,kl:1.4,kr:1.4,ry:.1,al:.1,ar:.1})],[4.2,rp({rr:1.57,ry:.24,al:.05,ar:.05})],[7,rp({rr:1.57,ry:.24,al:.05,ar:.05,sy:.93})],[8,rp({rr:1.57,ry:.24,al:.05,ar:.05})]]),
 bday:()=>fit([[0,B,{clones:1}],[.8,rp({al:2.8,ar:2.8}),{clones:1}],[1.6,rp({ll:.7,lr:.7,al:1.4,ar:1.4}),{clones:1}],[2.4,rp({al:2.8,ar:.2,bl:.3}),{clones:1}],[3.2,rp({ar:2.8,al:.2,br:.3}),{clones:1}],[4,B,{clones:1}],[4.8,F,{clones:1}],[5.6,mirror(F),{clones:1}],[6.4,rp({al:2.8,ar:2.8,hs:1.6}),{clones:1}],[7.2,B],[8,A]]),
});
const pinA={al:2.8,ar:.2,bl:.4,br:-.4},pinB={al:.2,ar:2.8,bl:-.4,br:.4},octA={bl:2.8,br:-2.4,kl:2.2,kr:-1.6,bd:.3},octB={bl:-2.4,br:2.8,kl:-1.6,kr:2.2,bd:-.3};
/* 상태 */
const X=A.body.slice(),V0=new Float32Array(M*2),T={body:A.body,head:A.head,rot:0,cel:'A',mir:false};
const H={x:A.head.x,y:A.head.y,ang:0,s:1,vx:0,vy:0,va:0,vs:0},R={rot:0,v:0,dx:0,dy:0,vx:0,vy:0};
let hkA=0,hkB=0,hkU=1,hfA=false,hfB=false,cloneOn=0,orbit=0,mouth=0,mouthExtra=0,bigSeq=null,bigT=0,bigI=0,cOv={},vOv={},tOv=0,lvl=0,qv=0,tilv=0,dots=false,settled=false,glabel='';
const now2=()=>performance.now();function endBig(){T.dx=0;T.dy=0;R.rot=wrap(R.rot)}
const wrap=a=>{a=(a+PIm)%TAU;return a<0?a+TAU-PIm:a-PIm};
function setTarget(p,o={}){T.body=p.body;T.head=p.head;T.rot=p.rot;T.cel=p.cel;T.mir=p.mir;if(p.head.k!==hkB||!!p.head.flip!==hfB){hkA=hkU<.5?hkA:hkB;hfA=hkU<.5?hfA:hfB;hkB=p.head.k;hfB=!!p.head.flip;hkU=0}
 if(o.snap){R.dx=o.dx??R.dx;R.dy=o.dy??R.dy;R.vx=R.vy=0}if(o.dx!==undefined)T.dx=o.dx;if(o.dy!==undefined)T.dy=o.dy;cloneOn=o.clones?1:0;orbit=o.orbit?1:0;if(o.mouth)mouthExtra=o.mouth}
T.dx=0;T.dy=0;
function stepBody(dt){const sn=lowP?1:2,h=dt/sn;for(let n=0;n<sn;n++)for(let i=0;i<M*2;i++){const w=seg[i>>1],k=lerp(820,420,w),c=2*Math.sqrt(k)*.48;V0[i]+=((T.body[i]-X[i])*k-V0[i]*c)*h;X[i]+=V0[i]*h}
 let da=T.head.ang-H.ang;while(da>PIm)da-=TAU;while(da<-PIm)da+=TAU;const kk=680,cc=2*Math.sqrt(kk)*.55;H.vx+=((T.head.x-H.x)*kk-H.vx*cc)*dt;H.x+=H.vx*dt;H.vy+=((T.head.y-H.y)*kk-H.vy*cc)*dt;H.y+=H.vy*dt;H.va+=(da*kk-H.va*cc)*dt;H.ang+=H.va*dt;H.vs+=((T.head.s-H.s)*kk-H.vs*cc)*dt;H.s+=H.vs*dt;
 const kr=orbit?70:560,cr=2*Math.sqrt(kr)*.7;R.v+=((T.rot-R.rot)*kr-R.v*cr)*dt;R.rot+=R.v*dt;const kd=120,cd=2*Math.sqrt(kd)*.8;R.vx+=((T.dx-R.dx)*kd-R.vx*cd)*dt;R.dx+=R.vx*dt;R.vy+=((T.dy-R.dy)*kd-R.vy*cd)*dt;R.dy+=R.vy*dt;
 hkU=Math.min(1,hkU+dt*8);mouth=Math.max(0,mouth-dt*7);mouthExtra=Math.max(0,mouthExtra-dt*1.6)}
const wob=(i,s0)=>Math.sin(i*.35+s0)*1.4+Math.sin(i*.13+s0*1.7)*1.4;
function headPoly(){const fp=(p,f)=>f?p.map((q,i)=>{const r=p[(72-i)%72];return[-r[0],r[1]]}):p,a=fp(polyOf(hkA).p,hfA&&hkA===1),b=fp(polyOf(hkB).p,hfB&&hkB===1);if(hkU>=1||hkA===hkB)return b;const t=hkU;return a.map((p,i)=>[p[0]+(b[i][0]-p[0])*t,p[1]+(b[i][1]-p[1])*t])}
function draw(g,ox,oy,S,tick,raster){const sd=tick*2.1;const lw=2.6/S*Math.min(1,S/.28+.25);
 g.save();g.translate(ox+R.dx*H_U*S,oy+R.dy*H_U*S);g.rotate(R.rot);g.scale(S,S);g.translate(-CXs,-CYs);g.lineJoin=g.lineCap='round';
 const useR=raster&&settled&&T.cel&&IMG[T.cel];
 if(useR){g.save();if(T.mir){g.translate(CXs*2,0);g.scale(-1,1)}const rot=T.rot;if(rot){g.translate(CXs,CYs);g.rotate(-rot);g.translate(-CXs,-CYs)}g.drawImage(IMG[T.cel],0,0,2362,2362);g.restore()}
 else{g.beginPath();for(let i=0;i<M;i++){const x=X[i*2]+wob(i,sd)*2,y=X[i*2+1]+wob(i,sd+9)*2;i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#0d0d0d';g.lineWidth=lw;g.stroke()}
 const nb=[X[0],X[1]],ca=Math.cos(H.ang),sa=Math.sin(H.ang),hw=HH*H.s,hp=(u,v)=>[H.x+u*hw*ca-v*hw*sa,H.y+u*hw*sa+v*hw*ca],hA=hp(-.15,.38),hB=hp(.15,.38);
 if(Math.hypot((hA[0]+hB[0])/2-nb[0],(hA[1]+hB[1])/2-nb[1])>NECK_REST+55){const L=[X[(M-16)*2],X[(M-16)*2+1]],Rr=[X[32],X[33]];g.beginPath();g.moveTo(L[0],L[1]);g.lineTo(hA[0],hA[1]);g.lineTo(hB[0],hB[1]);g.lineTo(Rr[0],Rr[1]);g.closePath();g.fillStyle='#fff';g.fill();g.beginPath();g.moveTo(L[0],L[1]);g.lineTo(hA[0],hA[1]);g.moveTo(Rr[0],Rr[1]);g.lineTo(hB[0],hB[1]);g.strokeStyle='#0d0d0d';g.lineWidth=lw;g.stroke()}
 const k=hkU<.5?hkA:hkB,fl=hkU<.5?hfA:hfB,side=k===1;
 g.save();g.translate(H.x,H.y);g.rotate(H.ang);g.scale(HH*H.s,HH*H.s);
 if(!useR||mouth>.05||mouthExtra>.05){const poly=headPoly();g.beginPath();poly.forEach((q,i)=>{const x=q[0]+wob(i,sd+3)*.0016,y=q[1]+wob(i,sd+5)*.0016;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fillStyle='#fff';g.fill();g.strokeStyle='#0d0d0d';g.lineWidth=lw/(HH*H.s);g.stroke();
  if(k!==2){g.save();g.clip();const src=side?HEADS.side:HEADS.front,cen=side?headSide:headFront,sh=hkA===hkB?0:(hkU<.5?hkU*2:(1-hkU)*2)*.1*(fl?1:-1);g.scale(fl&&side?-1:1,1);g.fillStyle='#0d0d0d';const m=clamp(mouth+mouthExtra,0,6);src.feats.forEach((f,fi)=>{const low=!side&&fi===lowerFeat,dy=low?m*.05:0;g.beginPath();f.forEach((q,i)=>{const x=q[0]-cen.cx+sh,y=q[1]-cen.cy+dy;i?g.lineTo(x,y):g.moveTo(x,y)});g.closePath();g.fill()});
   if(!side&&m>.1){const up=HEADS.front.feats[lowerFeat],uy=up.reduce((s2,p)=>s2+p[1],0)/up.length-headFront.cy;g.beginPath();g.ellipse(sh,uy-.02+m*.025,.055+m*.012,m*.03,0,0,7);g.fill()}g.restore()}}
 g.restore();g.restore()}
/* 평소 춤: 뼈대 자세를 윤곽 목표로 삼아 탄력 있게 따라간다. 전신 동작을 덮어 쓴다 */
let curC=null,curV=null,curW=null,tC=0,tV=0,tW=0,wCool=0,fxv={ex:0,q:0,til:0,dots:false},ghostOn=0,trail=[];
let lowP=false,lowT=0,clock=0,lastSpin=-99,lastKind='s';const recent=[],shuffle2=x=>{x=[...x];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
const ARM=['al','ar','bl','br','sl','sr'],SOFT=['hr','hx','hy','hs'];
const IDLE={...A,cel:null};const NECK_REST=Math.hypot(A.head.x-A.body[0],A.head.y+.38*HH-A.body[1]);
function liveTarget(dt,now){tC+=dt;tV+=dt;if(curW){tW+=dt;if(tW>=curW.dur){curW=null;wCool=.04;R.rot=wrap(R.rot)}}else wCool=Math.max(0,wCool-dt);
 if(curW&&curW.pose){setTarget(curW.pose(tW));return}
 if(!curC&&!curV&&!curW){setTarget(IDLE);cloneOn=0;ghostOn=0;return}
 const P={...REST},Q={...REST};if(curC)curC[1](tC,Q);if(curV)curV[1](tV,Q);
 if(curW){curW.f(tW,P);for(const k of ARM)P[k]=P[k]+(Q[k]-REST[k])*.6;for(const k of SOFT)P[k]=P[k]+(Q[k]-REST[k])*.5}else{Object.assign(P,Q);for(const k of['al','ar','bl','br','ll','lr','kl','kr','bd','tw','rx','ry','hx','hy','hr'])P[k]*=1.3}
 const a=1+.16*Math.min(5,fxv.ex);for(const k of['al','ar','bl','br','ll','lr','kl','kr','hr','bd','tw','rx','ry','hy','hx'])P[k]*=a;P.hs*=1+.08*Math.min(5,fxv.ex);
 if(fxv.q)P.hr+=Math.sin(now/55)*.3*Math.min(3,fxv.q);if(fxv.til){P.tw+=Math.sin(now/170)*.6;P.bd+=Math.cos(now/170)*.5}if(fxv.dots){P.ry+=.03;P.al*=.3;P.ar*=.3;P.hy+=.03}
 cloneOn=P.clones>.5?1:0;ghostOn=P.ghost>.5?1:0;if(lowP&&(lowT=(lowT+1)%3)){T.rot=P.rr;return}const c=capture({...P,rr:0,clones:0,ghost:0});c.rot=P.rr;setTarget(c)}
function drawTrail(g,ox,oy,S,accent){if(!ghostOn){trail.length=0;return}trail.push(X.slice());if(trail.length>9)trail.shift();g.save();g.translate(ox+R.dx*H_U*S,oy+R.dy*H_U*S);g.rotate(R.rot);g.scale(S,S);g.translate(-CXs,-CYs);g.strokeStyle=accent?'#0d0d0d':'#ff2bb3';g.lineWidth=3/S;trail.forEach((q,n)=>{if(n%2)return;g.globalAlpha=.16+.05*n;g.beginPath();for(let i=0;i<M;i+=2){i?g.lineTo(q[i*2],q[i*2+1]):g.moveTo(q[i*2],q[i*2+1])}g.closePath();g.stroke()});g.restore();g.globalAlpha=1}
const FINALE={run:'sixstep',melt:'headspin',love:'lotto',chicken:'windmill',lotto:'combo',sink:'headspin',zombie:'sixstep',bigmouth:'lotto',headspin:'windmill',windmill:'headspin',sixstep:'combo',combo:'groove',groove:'combo',commute:'melt',salary:'sink',diet:'chicken',exam:'run',doom:'melt',jackpot:'combo',moon:'headspin',crash:'sink',soju:'windmill',coffee:'run',snack:'love',sleepy:'zombie',mom:'sixstep',boss:'sixstep',bday:'groove',bye:'run',night:'sleepy'};
return{setLow(v){lowP=v},setImages(i){Object.assign(IMG,i)},reseed,
 update(dt,now){clock+=dt;if(bigSeq){bigT+=dt/BEAT;while(bigI<bigSeq.length&&bigSeq[bigI][0]<=bigT){const[,p,o]=bigSeq[bigI];setTarget(p,o||{dx:T.dx,dy:T.dy});bigI++}if(bigT>=16.1){bigSeq=null;cloneOn=0;orbit=0;endBig()}}else liveTarget(dt,now);stepBody(dt);let e=0;for(let i=0;i<M*2;i+=11)e+=Math.abs(X[i]-T.body[i]);settled=!!bigSeq&&e/(M*2/11)<2.4&&Math.abs(H.x-T.head.x)<3&&hkU>=1&&Math.abs(wrap(R.rot-T.rot))<.02},
 render(g,W,Ht,S,ox,oy,tick,calm,accent){const orb=orbit?[Math.cos(now2()/500)*W*.05,Math.sin(now2()/500)*Ht*.04]:[0,0];drawTrail(g,ox,oy,S,accent);if(cloneOn){draw(g,ox-W*.31,oy+Ht*.12,S*.62,tick,false);draw(g,ox+W*.31,oy+Ht*.12,S*.62,tick,false)}draw(g,ox+orb[0],oy+orb[1],S,tick,true)},
 eyes(W,Ht,S,ox,oy){const px=(H.x-CXs)*S,py=(H.y-CYs)*S,cr=Math.cos(R.rot),sr=Math.sin(R.rot),c0=[ox+R.dx*H_U*S+px*cr-py*sr,oy+R.dy*H_U*S+px*sr+py*cr],a=H.ang+R.rot,e=HH*H.s*S;return[-1,1].map(q=>[c0[0]+Math.cos(a)*q*e*.19-Math.sin(a)*-.03*e,c0[1]+Math.sin(a)*q*e*.19+Math.cos(a)*-.03*e])},
 event(e){if(bigSeq){if(e.kind==='v')mouth=1;return}fxv={ex:e.ex,q:e.q,til:e.til,dots:e.dots};if(e.kind==='v'){curV=mapV[e.j];tV=0;mouth=/[ㅏㅑㅐㅒㅓㅕㅘ]/.test(e.j)?1:.65;if(!curW&&wCool<=0){const ok=x=>{if(x.c==='spin')return lastKind==='s'&&clock-lastSpin>=5;if(x.c==='tilt')return lastKind==='s';return true};let w=mapW[e.j];if(recent.includes(w)||!ok(w)){const un=shuffle2(WHOLE.filter(x=>ok(x)&&!recent.includes(x)&&x.c!=='spin'));w=un[0]||shuffle2(WHOLE.filter(x=>!x.c))[0]}lastKind=w.c||'s';if(w.c==='spin')lastSpin=clock;recent.push(w);if(recent.length>Math.min(18,WHOLE.length-3))recent.shift();curW=w;tW=0;R.rot=wrap(R.rot)}}else{curC=mapC[e.j];tC=0}},
 big(name){const f=BIG[name];if(!f)return false;curC=curV=curW=null;const a=f(),end=Math.min(8,Math.max(...a.map(k=>k[0]))),b=BIG[FINALE[name]]().map(k=>[k[0]+8,k[1],k[2]]);bigSeq=[...a.filter(k=>k[0]<8),...b].sort((x,y)=>x[0]-y[0]);bigT=0;bigI=0;R.rot=wrap(R.rot);return true},
 relax(){curC=curV=curW=null},copy(g,x,y,S,tick){draw(g,x,y,S,tick,false)},wholeCount:()=>WHOLE.length,recentList:()=>recent.map(x=>x.n),isBig:()=>!!bigSeq,stop(){if(bigSeq){bigSeq=null;cloneOn=0;orbit=0;endBig()}curC=curV=curW=null},bigBeat:()=>bigT};
})();
const IMG={};

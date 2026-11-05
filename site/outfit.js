/* 아저씨 꾸미기. 머리 소품은 머리 높이=1 좌표(중심 0,0), 몸 소품은 윤곽선 기준 */
const INK='#0d0d0d',PINK='#ff2bb3',YEL='#f4ff1f',RED='#e8222b',BLU='#2b6cff',GRN='#21c35a',SKIN='#ffd9b8',WH='#fff';
const dr=(g,d,fill=WH,lw=.012)=>{const p=new Path2D(d);if(fill){g.fillStyle=fill;g.fill(p)}if(lw){g.strokeStyle=INK;g.lineWidth=lw;g.stroke(p)}};
const circ=(g,x,y,r,f=WH,lw=.012)=>{g.beginPath();g.arc(x,y,r,0,7);if(f){g.fillStyle=f;g.fill()}if(lw){g.strokeStyle=INK;g.lineWidth=lw;g.stroke()}};
const OUTFITS=[
// 머리카락
{id:'afro',n:'뽀글 가발',slot:'hair',head(g){for(let i=0;i<13;i++){const a=Math.PI*(1.02+i*.96/12);circ(g,Math.cos(a)*.38,Math.sin(a)*.42-.1,.17,INK,0)}circ(g,0,-.36,.32,INK,0)}},
{id:'part',n:'2대8 가르마',slot:'hair',head(g){dr(g,'M-.36-.12C-.4-.42-.2-.56.02-.54C.26-.53.4-.36.37-.1C.3-.26.2-.33.1-.36C0-.28-.2-.22-.36-.12Z',INK)}},
{id:'mohawk',n:'닭벼슬 모히칸',slot:'hair',head(g){dr(g,'M-.2-.42L-.3-.72L-.12-.53L-.1-.8L.02-.55L.1-.8L.14-.52L.3-.72L.2-.42Z',PINK)}},
{id:'pig',n:'양갈래',slot:'hair',head(g){dr(g,'M-.36-.15C-.4-.5.4-.5.36-.15C.1-.34-.1-.34-.36-.15Z',INK);dr(g,'M-.36-.1C-.62-.1-.7.2-.56.42C-.5.2-.4.1-.33.02Z',INK);dr(g,'M.36-.1C.62-.1.7.2.56.42C.5.2.4.1.33.02Z',INK)}},
{id:'topknot',n:'상투',slot:'hair',head(g){dr(g,'M-.3-.33C-.15-.52.15-.52.3-.33C.1-.42-.1-.42-.3-.33Z',INK);circ(g,0,-.6,.09,INK,0)}},
{id:'combover',n:'세 가닥',slot:'hair',head(g){for(const x of[-.12,0,.12])dr(g,`M${x}-.48C${x+.08}-.62 ${x+.22}-.56 ${x+.2}-.44`,null,.016)}},
{id:'mullet',n:'뒷머리 멀릿',slot:'hair',head(g){dr(g,'M-.36-.2C-.4-.5.4-.5.36-.2C.42.1.46.34.34.5C.3.3.3.1.26-.06C.1-.3-.1-.3-.26-.06C-.3.1-.3.3-.34.5C-.46.34-.42.1-.36-.2Z',YEL)}},
// 모자와 머리 장식
{id:'crown',n:'왕관',slot:'hat',head(g){dr(g,'M-.24-.44L-.28-.68L-.12-.55L0-.74L.12-.55L.28-.68L.24-.44Z',YEL)}},
{id:'cone',n:'파티 고깔',slot:'hat',head(g){dr(g,'M-.2-.44L.02-.88L.22-.44Z',PINK);circ(g,.02,-.9,.04,YEL)}},
{id:'straw',n:'밀짚모자',slot:'hat',head(g){dr(g,'M-.56-.34C-.3-.44.3-.44.56-.34C.3-.26-.3-.26-.56-.34Z',YEL);dr(g,'M-.24-.38C-.24-.64.24-.64.24-.38Z',YEL)}},
{id:'cap',n:'거꾸로 캡',slot:'hat',head(g){dr(g,'M-.33-.34C-.3-.6.3-.6.33-.34Z',BLU);dr(g,'M-.3-.36C-.5-.42-.56-.3-.34-.3Z',BLU)}},
{id:'horn',n:'더듬이',slot:'hat',head(g){dr(g,'M-.12-.47C-.16-.62-.26-.68-.3-.74',null,.014);dr(g,'M.12-.47C.16-.62.26-.68.3-.74',null,.014);circ(g,-.31,-.77,.04,GRN);circ(g,.31,-.77,.04,GRN)}},
{id:'bow',n:'왕리본',slot:'hat',head(g){dr(g,'M0-.52L-.26-.66L-.26-.4Z',PINK);dr(g,'M0-.52L.26-.66L.26-.4Z',PINK);circ(g,0,-.52,.05,YEL)}},
{id:'fish',n:'머리 위 붕어',slot:'hat',head(g){dr(g,'M-.3-.54C-.1-.68.16-.66.24-.54C.16-.42-.1-.42-.3-.54ZM.22-.54L.38-.64L.36-.44Z','#f0b050');circ(g,-.16,-.56,.014,INK,0)}},
{id:'arrow',n:'머리에 화살',slot:'hat',head(g){dr(g,'M-.56-.22L-.3-.24M.3-.26L.56-.28',null,.016);dr(g,'M.56-.28L.5-.34M.56-.28L.5-.2',null,.014);dr(g,'M-.56-.22L-.62-.28M-.56-.22L-.62-.16',null,.014)}},
{id:'pot',n:'냄비',slot:'hat',head(g){dr(g,'M-.32-.36L-.3-.6L.3-.6L.32-.36Z','#b9c2cc');dr(g,'M-.42-.5L-.32-.5M.32-.5L.42-.5',null,.022)}},
// 얼굴
{id:'kaiser',n:'카이젤 수염',slot:'face',face:1,head(g){dr(g,'M0 .23C-.1 .18-.22 .23-.3 .12C-.25 .28-.08 .3 0 .27C.08 .3.25 .28.3 .12C.22 .23.1 .18 0 .23Z',INK)}},
{id:'beard',n:'덥수룩 수염',slot:'face',face:1,head(g){dr(g,'M-.3.1C-.3.56.3.56.3.1C.2.3.08.2 0 .22C-.08.2-.2.3-.3.1Z',INK)}},
{id:'goatee',n:'염소 수염',slot:'face',face:1,head(g){dr(g,'M-.07.34L0 .62L.07.34Z',INK)}},
{id:'shades',n:'선글라스',slot:'eye',face:1,head(g){dr(g,'M-.3-.1L-.03-.1L-.05.05L-.27.05ZM.3-.1L.03-.1L.05.05L.27.05Z',INK);dr(g,'M-.03-.07L.03-.07',null,.014)}},
{id:'round',n:'동그란 안경',slot:'eye',face:1,head(g){circ(g,-.16,-.04,.1,null,.014);circ(g,.16,-.04,.1,null,.014);dr(g,'M-.06-.04L.06-.04',null,.014)}},
{id:'heart',n:'하트 안경',slot:'eye',face:1,head(g){for(const x of[-.16,.16])dr(g,`M${x}.06C${x-.18}-.06 ${x-.08}-.17 ${x}-.08C${x+.08}-.17 ${x+.18}-.06 ${x}.06Z`,PINK)}},
{id:'blush',n:'볼터치',slot:'cheek',face:1,head(g){circ(g,-.24,.1,.07,'rgba(255,43,179,.5)',0);circ(g,.24,.1,.07,'rgba(255,43,179,.5)',0)}},
{id:'bandaid',n:'코 반창고',slot:'cheek',face:1,head(g){dr(g,'M-.1.0L.1-.02L.11.05L-.09.07Z',SKIN)}},
{id:'tears',n:'폭포 눈물',slot:'cheek',face:1,head(g){dr(g,'M-.2 0L-.13 0L-.12.5L-.22.5Z','#7fd3ff',.008);dr(g,'M.2 0L.13 0L.12.5L.22.5Z','#7fd3ff',.008)}},
{id:'nosebleed',n:'코피',slot:'cheek',face:1,head(g){dr(g,'M-.02.1C-.04.2-.05.26-.02.3C.02.26.02.2.0.1Z',RED,.006)}},
// 몸
{id:'brief',n:'삼각 팬티',slot:'pants',body(g,a){poly(g,[a.hipL,a.crotchL,a.crotch,a.crotchR,a.hipR,a.waist],PINK)}},
{id:'trunks',n:'줄무늬 트렁크',slot:'pants',body(g,a){const P=[a.waistL,a.thighL,a.innerL,a.crotch,a.innerR,a.thighR,a.waistR];poly(g,P,YEL);line(g,mid(a.waistL,a.waistR,.33),mid(a.thighL,a.innerL,.6),BLU,8);line(g,mid(a.waistL,a.waistR,.67),mid(a.thighR,a.innerR,.6),BLU,8)}},
{id:'loin',n:'호피 팬티',slot:'pants',body(g,a){poly(g,[a.hipL,a.crotchL,a.crotch,a.crotchR,a.hipR,a.waist],'#f0b050');for(let i=0;i<5;i++)dot(g,mid(a.hipL,a.hipR,.15+.17*i),11,INK)}},
{id:'tie',n:'빨간 넥타이',slot:'neck',body(g,a){poly(g,[mid(a.collar,a.chest,.02,-20),mid(a.collar,a.chest,.02,20),mid(a.collar,a.belly,.75,22),mid(a.collar,a.belly,.9),mid(a.collar,a.belly,.75,-22)],RED)}},
{id:'bowtie',n:'나비넥타이',slot:'neck',body(g,a){const c=mid(a.collar,a.chest,.1);poly(g,[c,[c[0]-70,c[1]-28],[c[0]-70,c[1]+28]],BLU);poly(g,[c,[c[0]+70,c[1]-28],[c[0]+70,c[1]+28]],BLU);dot(g,c,14,YEL)}},
{id:'chain',n:'금목걸이',slot:'neck',body(g,a){for(let i=0;i<=8;i++){const t=i/8,p=mid(a.collarL,a.collarR,t);p[1]+=Math.sin(t*Math.PI)*90;dot(g,p,12,YEL)}}},
{id:'hairy',n:'가슴털',slot:'skin',body(g,a){for(let i=0;i<9;i++){const p=mid(a.chestL,a.chestR,.15+.09*i);p[1]+=((i*37)%50)-20;line(g,p,[p[0]+10,p[1]+26],INK,4)}}},
{id:'tattoo',n:'하트 문신',slot:'skin',body(g,a){const c=a.chest;dot(g,[c[0]-18,c[1]],22,RED);dot(g,[c[0]+18,c[1]],22,RED);poly(g,[[c[0]-38,c[1]+6],[c[0]+38,c[1]+6],[c[0],c[1]+48]],RED,false)}},
{id:'navel',n:'배꼽 점',slot:'skin',body(g,a){dot(g,a.belly,9,INK)}},
{id:'socks',n:'발목 줄무늬',slot:'feet',body(g,a){line(g,a.ankleL0,a.ankleL1,RED,10);line(g,a.ankleR0,a.ankleR1,RED,10)}},
{id:'gloves',n:'권투 글러브',slot:'hand',body(g,a){dot(g,a.handL,46,RED,true);dot(g,a.handR,46,RED,true)}},
{id:'bands',n:'땀 밴드',slot:'hand2',body(g,a){line(g,a.wristL0,a.wristL1,YEL,14);line(g,a.wristR0,a.wristR1,YEL,14)}},
];
function poly(g,P,f,st=true){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=f;g.fill();if(st){g.strokeStyle=INK;g.lineWidth=6;g.stroke()}}
function line(g,a,b,col,w){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.stroke()}
function dot(g,p,r,f,st){g.beginPath();g.arc(p[0],p[1],r,0,7);g.fillStyle=f;g.fill();if(st){g.strokeStyle=INK;g.lineWidth=6;g.stroke()}}
function mid(a,b,t,sh=0){return[a[0]+(b[0]-a[0])*t+sh,a[1]+(b[1]-a[1])*t]}

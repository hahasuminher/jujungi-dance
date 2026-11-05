/* 음성: eSpeak NG로 말을 합성한 뒤 문장부호와 목소리 설정에 맞게 변조한다 */
let engine=null;
const SR=22050;
const VOICE_DEFAULT={id:'helium',name:'헬륨 쪼꼬미',pitch:85,rate:135,range:90,speed:1.32,wobble:0,robot:0};
const VOICE_PRESETS=[VOICE_DEFAULT,
 {id:'greasy',name:'느끼한 아저씨',pitch:25,rate:125,range:95,speed:.8,wobble:.5,robot:0},
 {id:'robot',name:'고장난 로봇',pitch:45,rate:140,range:10,speed:1,wobble:.15,robot:.55},
 {id:'grim',name:'저승사자',pitch:5,rate:105,range:15,speed:.72,wobble:.1,robot:.08},
 {id:'grandma',name:'동네 할머니',pitch:62,rate:120,range:99,speed:.96,wobble:.75,robot:0},
 {id:'baby',name:'옹알이 아기',pitch:99,rate:115,range:99,speed:1.55,wobble:.2,robot:0},
 {id:'alien',name:'외계인',pitch:72,rate:150,range:60,speed:1.16,wobble:.35,robot:.82},
 {id:'drunk',name:'취한 아저씨',pitch:32,rate:98,range:90,speed:.84,wobble:.95,robot:0},
 {id:'anchor',name:'뉴스 앵커',pitch:52,rate:175,range:28,speed:1.02,wobble:0,robot:0},
 {id:'mosquito',name:'모기',pitch:99,rate:170,range:35,speed:1.85,wobble:.5,robot:.2}];
async function bootVoice(){
 const data=await (await fetch('vendor/espeak.data')).arrayBuffer();
 const m=await Promise.race([ESPEAK({getPreloadedPackage:()=>data,locateFile:f=>f,print(){},printErr(){}}),new Promise((_,no)=>setTimeout(()=>no(new Error('timeout')),15000))]);
 engine=new m.eSpeakNGWorker();
}
/* 원문을 [글, 문장부호] 구간으로 나눈다 */
function splitSegments(raw){
 const out=[];const re=/([^.!?~…,\n]*)([.!?~…,\n]*)/g;let m;
 while((m=re.exec(raw))&&(m[0].length||re.lastIndex<raw.length)){if(!m[0].length){re.lastIndex++;continue}
  const p=m[2];const f={ex:(p.match(/!/g)||[]).length,q:(p.match(/\?/g)||[]).length,til:(p.match(/~/g)||[]).length,dots:/\.{2,}|…/.test(p),raw:m[1]};
  if(m[1].trim())out.push(f);else if(out.length){const l=out[out.length-1];l.ex+=f.ex;l.q+=f.q;l.til+=f.til;l.dots=l.dots||f.dots}}
 return out}
const clampN=(x,a,b)=>Math.max(a,Math.min(b,x));
function synthSeg(text,seg,v){
 const ex=Math.min(seg.ex,6),pitch=clampN(v.pitch+ex*5-(seg.dots?14:0),0,99),rate=v.rate*(1+.05*ex)*(seg.dots?.82:1);
 engine.set_voice('ko');engine.set_rate(Math.round(rate));engine.set_pitch(Math.round(pitch));engine.set_range(Math.round(clampN(v.range+ex*2,0,99)));
 const ch=[],ev=[];let n=0;engine.synthesize(text,(p,e)=>{if(p&&p.length){ch.push(p);n+=p.length}for(const x of e)ev.push(x)});
 const o=new Float32Array(n);let i=0;for(const a of ch)for(let k=0;k<a.length;k++)o[i++]=a[k]/32768;
 let last=n;while(last>0&&Math.abs(o[last-1])<.002)last--;
 return{pcm:o,len:Math.max(1,last),ev}}
/* 시간에 따라 재생 속도가 변하는 리샘플링: 물음표는 끝이 올라가고 물결은 늘어난다 */
function warp(p,seg,v){
 const{pcm,len}=p,til=Math.min(seg.til,6),q=Math.min(seg.q,5),base=v.speed,wob=v.wobble||0;
 const est=Math.ceil(len/Math.max(.2,base*.4))+SR,o=new Float32Array(est),mapStep=256,map=new Int32Array(Math.ceil(len/mapStep)+2);
 let sp=0,op=0,nextMap=0;
 while(sp<len-1&&op<est-1){
  while(nextMap*mapStep<=sp){map[nextMap++]=op}
  const t=sp/len;let r=base;
  if(q&&t>.62)r*=1+(t-.62)/.38*(.22+.11*q);
  if(til&&t>.5){r*=1+(.14+.035*til)*Math.sin(op/SR*TAU_V*(5.5+.4*til))}
  if(seg.dots)r*=1-.22*t;
  if(wob)r*=1+wob*.09*Math.sin(op/SR*TAU_V*6.5);
  const i=sp|0,e=sp-i;o[op++]=pcm[i]+(pcm[i+1]-pcm[i])*e;sp+=r}
 while(nextMap<map.length)map[nextMap++]=op;
 return{pcm:o.subarray(0,op),toOut:s=>map[Math.min(map.length-1,Math.max(0,Math.floor(s/mapStep)))]}}
const TAU_V=Math.PI*2;
/* 물결표: 끝 부분을 짧은 조각으로 겹쳐 늘이고 소리 크기를 울렁이게 한다 */
function wobbleTail(x,n){const st=Math.floor(x.length*.62),tail=x.length-st,ratio=1.5+.28*n,G=Math.round(SR*.05),hopOut=Math.round(G/4),hopIn=Math.max(1,Math.round(hopOut/ratio)),outLen=Math.round(tail*ratio)+G,o=new Float32Array(st+outLen);o.set(x.subarray(0,st));const w=new Float32Array(outLen);
 for(let s=0,ip=st,op=0;op<outLen-G&&ip<x.length-G;s++,ip+=hopIn,op+=hopOut)for(let i=0;i<G;i++){const h=.5-.5*Math.cos(TAU_V*i/G);o[st+op+i]+=x[ip+i]*h;w[op+i]+=h}
 for(let i=0;i<outLen;i++){if(w[i]>.05)o[st+i]/=w[i];const t=i/SR,e=Math.min(1,(outLen-i)/(SR*.08));o[st+i]*=(.72+.28*Math.sin(TAU_V*(6+.4*n)*t))*e}
 return{pcm:o,map:s=>s<=st?s:st+(s-st)*ratio}}
function jamoEvents(spoken,ev,toOut,offsetMs,charOff,wordBase,total){
 const chars=[...spoken],words=ev.filter(e=>e.type==='word');
 const ms=a=>a/1000*SR;const stops=ev.filter(e=>e.type==='word'||e.type==='end').map(e=>e.audio_position).sort((a,b)=>a-b);const out=[];
 const add=(from,to,start,end,wi)=>{const list=[];for(let i=from;i<to;i++){const d=decompose(chars[i]);if(d)d.forEach(x=>list.push({...x,idx:i+charOff}))}
  const a=toOut(ms(start))/SR*1000,b=toOut(ms(end))/SR*1000;list.forEach((x,k)=>out.push({...x,word:wordBase+wi,ms:offsetMs+a+(b-a)*k/list.length}))};
 if(!words.length){add(0,chars.length,0,total*1000/SR,0);return out}
 words.forEach((w,wi)=>{const from=w.text_position-1,nw=words[wi+1],to=nw?nw.text_position-1:chars.length,start=w.audio_position,after=stops.find(p=>p>start);add(from,to,start,after===undefined?total*1000/SR:after,wi)});
 return out}
/* 전체 문장을 하나의 소리와 타임라인으로 */
function buildSpeech(raw,v,opt={}){
 const segs=splitSegments(raw);const parts=[];let text='',skipped=0,events=[],t=0,wordBase=0;const specials=[];
 for(const seg of segs){const r=toSpoken(seg.raw);skipped+=r.skipped;const spoken=r.spoken.replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();if(!spoken||!/[가-힣]/.test(spoken))continue;
  const p=synthSeg(spoken,seg,v),w=warp(p,seg,v),ex=Math.min(seg.ex,6),gain=.62+.075*ex,drive=1.1+ex*.42;
  const out=new Float32Array(w.pcm.length);let pk=0;for(let i=0;i<out.length;i++)pk=Math.max(pk,Math.abs(w.pcm[i]));const d=drive/(pk||1);
  for(let i=0;i<out.length;i++){let x=Math.tanh(w.pcm[i]*d);if(v.robot)x=x*(1-v.robot)+x*v.robot*Math.sin(TAU_V*72*i/SR);out[i]=x*gain}
  let finalOut=out,mapT=s=>w.toOut(s);if(seg.til){const r=wobbleTail(out,Math.min(seg.til,6));finalOut=r.pcm;mapT=s=>r.map(w.toOut(s))}
  const off=text?[...text].length+1:0;events.push(...jamoEvents(spoken,p.ev,mapT,t,off,wordBase,p.len).map(e=>({...e,ex,q:Math.min(seg.q,5),til:Math.min(seg.til,6),dots:seg.dots})));
  wordBase+=spoken.split(' ').length;text+=(text?' ':'')+spoken;
  {let best=null;for(const[word,name]of Object.entries(SPECIALS)){const re=word==='바이'||word==='빠이'?new RegExp('(^|[\\s,.!?~])'+word+'($|[\\s,.!?~])'):null,hit=re?re.exec(seg.raw):null,i=re?(hit?hit.index:-1):seg.raw.indexOf(word);if(i>=0&&(!best||i<best.i))best={i,word,name}}if(best)specials.push({ms:t,word:best.word,name:best.name})}
  parts.push(finalOut);t+=finalOut.length/SR*1000;const gap=seg.dots?.28:.09;parts.push(new Float32Array(Math.round(gap*SR)));t+=gap*1000}
 const n=parts.reduce((a,p)=>a+p.length,0),pcm=new Float32Array(n);let o=0;for(const p of parts){pcm.set(p,o);o+=p.length}
 events.sort((a,b)=>a.ms-b.ms);let mix=pcm;
 if(specials.length&&!opt.plain){const sp=specials[0];specials.length=1;const beat=Beat.get(SR,16,BGM_OF[sp.name]||'dumchit'),st=Math.round(sp.ms/1000*SR),L=Math.round(16*60/Beat.BPM*SR),len=Math.max(n,st+L+SR/4|0);mix=new Float32Array(len);mix.set(pcm);for(let i=0;i<L;i++){const e=Math.min(1,(L-i)/(SR*.15));mix[st+i]+=beat[i]*.85*e}}
 const m=mix.length;for(let i=0;i<m;i++)mix[i]=Math.tanh(mix[i]*1.05)*.95; // 귀를 보호하는 상한
 return{pcm:mix,events,text,skipped,totalMs:m/SR*1000,specials}}

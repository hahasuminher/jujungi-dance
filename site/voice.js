/* 음성: eSpeak NG로 말을 합성한 뒤 문장부호와 목소리 설정에 맞게 변조한다 */
let engine=null;
const SR=22050;
const VOICE_DEFAULT={id:'helium',name:'헬륨 쪼꼬미',pitch:85,rate:135,range:90,speed:1.32,wobble:0,robot:0};
const VOICE_PRESETS=[VOICE_DEFAULT,
 {id:'greasy',name:'느끼한 아저씨',pitch:25,rate:125,range:95,speed:.8,wobble:.5,robot:0},
 {id:'robot',name:'고장난 로봇',pitch:45,rate:140,range:10,speed:1,wobble:.15,robot:.55}];
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
  if(til&&t>.72){r*=(.62-.05*til)*(1+.16*Math.sin(op/SR*TAU_V*5))}
  if(seg.dots)r*=1-.22*t;
  if(wob)r*=1+wob*.09*Math.sin(op/SR*TAU_V*6.5);
  const i=sp|0,e=sp-i;o[op++]=pcm[i]+(pcm[i+1]-pcm[i])*e;sp+=r}
 while(nextMap<map.length)map[nextMap++]=op;
 return{pcm:o.subarray(0,op),toOut:s=>map[Math.min(map.length-1,Math.max(0,Math.floor(s/mapStep)))]}}
const TAU_V=Math.PI*2;
function jamoEvents(spoken,ev,toOut,offsetMs,charOff,wordBase,total){
 const chars=[...spoken],words=ev.filter(e=>e.type==='word');
 const ms=a=>a/1000*SR;const stops=ev.filter(e=>e.type==='word'||e.type==='end').map(e=>e.audio_position).sort((a,b)=>a-b);const out=[];
 const add=(from,to,start,end,wi)=>{const list=[];for(let i=from;i<to;i++){const d=decompose(chars[i]);if(d)d.forEach(x=>list.push({...x,idx:i+charOff}))}
  const a=toOut(ms(start))/SR*1000,b=toOut(ms(end))/SR*1000;list.forEach((x,k)=>out.push({...x,word:wordBase+wi,ms:offsetMs+a+(b-a)*k/list.length}))};
 if(!words.length){add(0,chars.length,0,total*1000/SR,0);return out}
 words.forEach((w,wi)=>{const from=w.text_position-1,nw=words[wi+1],to=nw?nw.text_position-1:chars.length,start=w.audio_position,after=stops.find(p=>p>start);add(from,to,start,after===undefined?total*1000/SR:after,wi)});
 return out}
/* 전체 문장을 하나의 소리와 타임라인으로 */
function buildSpeech(raw,v){
 const segs=splitSegments(raw);const parts=[];let text='',skipped=0,events=[],t=0,wordBase=0;const specials=[];
 for(const seg of segs){const r=toSpoken(seg.raw);skipped+=r.skipped;const spoken=r.spoken.replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();if(!spoken||!/[가-힣]/.test(spoken))continue;
  const p=synthSeg(spoken,seg,v),w=warp(p,seg,v),ex=Math.min(seg.ex,6),gain=.62+.075*ex,drive=1.1+ex*.42;
  const out=new Float32Array(w.pcm.length);let pk=0;for(let i=0;i<out.length;i++)pk=Math.max(pk,Math.abs(w.pcm[i]));const d=drive/(pk||1);
  for(let i=0;i<out.length;i++){let x=Math.tanh(w.pcm[i]*d);if(v.robot)x=x*(1-v.robot)+x*v.robot*Math.sin(TAU_V*72*i/SR);out[i]=x*gain}
  const off=text?[...text].length+1:0;events.push(...jamoEvents(spoken,p.ev,w.toOut,t,off,wordBase,p.len).map(e=>({...e,ex,q:Math.min(seg.q,5),til:Math.min(seg.til,6),dots:seg.dots})));
  wordBase+=spoken.split(' ').length;text+=(text?' ':'')+spoken;
  for(const[word,name]of Object.entries(SPECIALS))if(seg.raw.includes(word))specials.push({ms:t,word,name});
  parts.push(out);t+=out.length/SR*1000;const gap=seg.dots?.28:.09;parts.push(new Float32Array(Math.round(gap*SR)));t+=gap*1000}
 const n=parts.reduce((a,p)=>a+p.length,0),pcm=new Float32Array(n);let o=0;for(const p of parts){pcm.set(p,o);o+=p.length}
 for(let i=0;i<n;i++)pcm[i]=Math.tanh(pcm[i]*1.05)*.92; // 귀를 보호하는 상한
 events.sort((a,b)=>a.ms-b.ms);return{pcm,events,text,skipped,totalMs:n/SR*1000,specials}}

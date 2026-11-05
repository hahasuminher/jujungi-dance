/* 둠칫 비트: 코드로 합성해서 말소리에 섞는다. 휴대폰에서도 같은 음성 파일로 재생된다 */
const Beat=(()=>{const BPM=118,S=60/BPM/4,NOTES=[55,0,55,0,0,65.4,0,55,73.4,0,0,55,0,49,0,55],MEL={6:440,7:523,14:392,15:330};let cache=null;
 function render(sr,beats){const N=Math.ceil(beats*60/BPM*sr)+sr,x=new Float32Array(N),add=(t,fn,dur,g)=>{const i0=Math.floor(t*sr),n=Math.min(Math.floor(dur*sr),N-i0);for(let i=0;i<n;i++)x[i0+i]+=fn(i/sr)*g};
  let ph=0,lp=0;const kick=(t)=>{const f=48+110*Math.exp(-t*32);ph+=2*Math.PI*f/sr;return Math.sin(ph)*Math.exp(-t*12)},noise=()=>Math.random()*2-1;
  const steps=beats*4;for(let k=0;k<steps;k++){const s=k%16,bar=Math.floor(k/16),t=k*S;
   if(s%4===0){ph=0;add(t,kick,.24,1)}if(s===14&&bar%2){ph=0;add(t,kick,.2,.75)}
   if(s===4||s===12){let y=0,y2=0;add(t,u=>{const n=noise();y+=.42*(n-y);y2=n-y;return(y-y2*.3)*Math.exp(-u*22)*1.6},.16,.75)}
   if(s%2===1){let p=0;add(t,u=>{const n=noise(),h=n-p;p=n;return h*Math.exp(-u*110)},.04,.22)}
   if(NOTES[s]){const f=NOTES[s],d=S*1.5;add(t,u=>(Math.sign(Math.sin(2*Math.PI*f*u))*.55+.45*Math.sin(2*Math.PI*f*u))*Math.min(1,Math.exp(-u*6)*1.4)*Math.min(1,(d-u)*40),d,.42)}
   if(bar%2&&MEL[s]){const f=MEL[s];add(t,u=>Math.sign(Math.sin(2*Math.PI*f*u))*Math.exp(-u*18),.11,.14)}}
  for(let i=0;i<N;i++)x[i]=Math.tanh(x[i]*1.5);return x}
 return{get(sr,beats){if(!cache||cache.b!==beats)cache={b:beats,x:render(sr,beats)};return cache.x},BPM}})();

/* 클럽 EDM: 128BPM 8마디를 합성해 필요한 길이로 반복 */
const EDM=(()=>{const BPM=128,B=60/BPM;let cache=null;
 function bars(sr){const N=Math.round(B*32*sr),x=new Float32Array(N);const CH=[[110,130.8,164.8],[87.3,130.8,174.6],[98,146.8,196],[82.4,123.5,164.8]];let lp=0;
  for(let i=0;i<N;i++){const t=i/sr,b=t/B,bb=b%1,bar=Math.floor(b/4)%4,c=CH[bar],k=48+120*Math.exp(-bb*B*30),ks=Math.sin(2*Math.PI*k*bb*B)*Math.exp(-bb*B*11);
   const off=(b+.5)%1,bf=c[0]/2,bass=(2*((t*bf)%1)-1)*Math.min(1,off*7)*Math.exp(-off*2.2)*.5;
   let saw=0;for(const f of c)for(const d of[.995,1,1.006])saw+=2*((t*f*2*d)%1)-1;saw/=9;const gate=(b*2)%1<.55?1:.12;lp+=.22*(saw*gate-lp);
   const hat=((b*2)%1<.08?1:0)*(Math.random()*2-1)*.14,clap=(Math.floor(b)%2===1&&bb<.12)?(Math.random()*2-1)*Math.exp(-bb*30)*.32:0;
   const sweep=bar===3?Math.sin(2*Math.PI*t*(600+900*((b%4)/4)))*.06*((b%4)/4):0;
   x[i]=Math.tanh(ks*.95+bass+lp*.55+hat+clap+sweep)}return x}
 return{BPM,make(sr,secs){if(!cache)cache=bars(sr);const N=Math.round(secs*sr),o=new Float32Array(N);for(let i=0;i<N;i++)o[i]=cache[i%cache.length]*.72;return o}}})();
/* 박치기 효과음 */
const Sfx=(()=>{const sr=22050,mk=(dur,fn)=>{const n=Math.round(dur*sr),o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=fn(i/sr)*Math.min(1,(dur-i/sr)*40);return o};
 const SND={'퍽!':()=>{let y=0;return mk(.16,t=>{y+=.3*((Math.random()*2-1)-y);return(y*2.4+Math.sin(2*Math.PI*150*t)*.8)*Math.exp(-t*26)})},'쿵!':()=>mk(.34,t=>Math.sin(2*Math.PI*(44+90*Math.exp(-t*20))*t)*Math.exp(-t*9)*1.1),'뽁!':()=>mk(.13,t=>Math.sin(2*Math.PI*(260+1500*t*t*40)*t)*Math.exp(-t*24))};
 const urls={},el=new Audio();el.preload='auto';el.setAttribute('playsinline','');
 return{unlock(){if(!Object.keys(urls).length){for(const k in SND)urls[k]=URL.createObjectURL(wav(SND[k](),sr));try{if(engine){const s=buildSpeech('아야',VOICE_DEFAULT);urls['아야!']=URL.createObjectURL(wav(s.pcm,SR))}}catch(e){}}el.src=urls['쿵!'];el.volume=0;el.play().catch(()=>{})},play(k,v){if(!urls[k])return;el.pause();el.src=urls[k];el.volume=Math.max(0,Math.min(1,v));el.play().catch(()=>{})}}})();

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

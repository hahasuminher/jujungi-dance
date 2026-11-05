/* 둠칫 비트: 전부 코드로 합성 */
const BGM=(()=>{let ac=null,out=null,on=false,timer=null,step=0,next=0;const BPM=118,S=60/BPM/4;
 const NOTES=[55,0,55,0,0,65.4,0,55,73.4,0,0,55,0,49,0,55],MEL={6:440,7:523,14:392,15:330};let noise=null;
 const env=(g,t,a,d)=>{g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.0008,t+d)};
 function kick(t,v){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(158,t);o.frequency.exponentialRampToValueAtTime(48,t+.09);env(g,t,v,.22);o.connect(g).connect(out);o.start(t);o.stop(t+.24)}
 function nz(t,v,d,type,f,q){const s=ac.createBufferSource(),g=ac.createGain(),b=ac.createBiquadFilter();s.buffer=noise;b.type=type;b.frequency.value=f;b.Q.value=q;env(g,t,v,d);s.connect(b).connect(g).connect(out);s.start(t);s.stop(t+d+.02)}
 function tone(t,f,v,d,ty='square'){const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=f;env(g,t,v,d);o.connect(g).connect(out);o.start(t);o.stop(t+d+.02)}
 function sch(){while(next<ac.currentTime+.14){const s=step%16,bar=Math.floor(step/16);
   if(s%4===0)kick(next,.8);if(s===14&&bar%2)kick(next,.55);if(s===4||s===12)nz(next,.34,.13,'bandpass',1800,.8);if(s%2===1)nz(next,.09,.035,'highpass',7000,.5);
   if(NOTES[s])tone(next,NOTES[s],.13,S*1.4);if(bar%2&&MEL[s])tone(next,MEL[s],.035,.1);
   step++;next+=S}}
 return{init(c,dest){ac=c;out=ac.createGain();out.gain.value=.26;out.connect(dest);noise=ac.createBuffer(1,ac.sampleRate*.4,ac.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1},
  start(){if(on||!ac)return;on=true;next=ac.currentTime+.05;timer=setInterval(sch,50)},stop(){on=false;clearInterval(timer)},isOn:()=>on,
  duck(a){if(out)out.gain.setTargetAtTime(a?.1:.26,ac.currentTime,.05)},beatNow(){return ac&&on?step/4:null}}})();

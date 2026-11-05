/* 스페셜 BGM: 장르마다 드럼과 멜로디를 코드로 합성해 말소리에 섞는다. 춤과 맞도록 전부 118BPM */
const STYLES=(()=>{const Nt={A1:55,C2:65.4,D2:73.4,E2:82.4,F2:87.3,G2:98,A2:110,C3:130.8,D3:146.8,E3:164.8,F3:174.6,G3:196,A3:220,B3:246.9,C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,C5:523.3,D5:587.3,E5:659.3,G5:784,Eb3:155.6,Bb2:116.5,Eb4:311.1,Bb3:233.1,Ab3:207.7};
const _=0,{A1,C2,D2,E2,F2,G2,A2,C3,D3,E3,F3,G3,A3,B3,C4,D4,E4,F4,G4,A4,B4,C5,D5,E5,G5,Eb3,Bb2,Eb4,Bb3,Ab3}=Nt;
return{
 dumchit:{kick:[0,4,8,12],clap:[4,12],hat:[1,3,5,7,9,11,13,15],bass:[A1,_,A1,_,_,C2,_,A1,D2,_,_,A1,_,G2/2,_,A1],mel:[_,_,_,_,_,_,A4,C5,_,_,_,_,_,_,G4,E4],wave:'sq',bv:.42,mv:.14},
 disco:{kick:[0,4,8,12],clap:[4,12],hat:[2,6,10,14],open:1,bass:[A1,A2,A1,A2,A1,A2,A1,A2,F2,F2*2,F2,F2*2,G2,G2*2,G2,G2*2],mel:[E5,_,D5,_,C5,_,D5,_,_,E5,_,G5,_,E5,_,D5],wave:'saw',bv:.42,mv:.13},
 trot:{kick:[0,8],clap:[4,12],hat:[2,6,10,14],bass:[A1,_,E2,_,A1,_,E2,_,D2,_,A2,_,E2,_,E2*2,_],mel:[A4,_,C5,D5,E5,_,_,_,D5,C5,A4,_,C5,_,A4,_],wave:'tri',bv:.45,mv:.28,vib:1},
 chip:{kick:[0,6,8,14],clap:[4,12],hat:[0,2,4,6,8,10,12,14],bass:[C2,C2,G2,G2,A1,A1,E2,E2,F2,F2,C2*2,C2*2,G2,G2,G2,G2],mel:[C5,E5,G5,C5,A4,C5,E5,A4,F4,A4,C5,F4,G4,B4,D5,G4],wave:'sq',bv:.32,mv:.17},
 funeral:{kick:[0,12],clap:[],hat:[],bass:[A1,_,_,_,_,_,_,_,F2,_,_,_,E2,_,_,_],mel:[A3,_,_,A3,C4,_,_,_,B3,_,_,A3,A3,_,_,_],wave:'tri',bv:.55,mv:.32,slow:1},
 march:{kick:[0,8],clap:[4,6,12,14],hat:[2,10],bass:[C2,_,G2,_,C2,_,G2,_,F2,_,C2*2,_,G2,_,G2,_],mel:[G4,_,G4,G4,C5,_,E5,_,D5,_,B4,_,C5,_,_,_],wave:'saw',bv:.4,mv:.17},
 lofi:{kick:[0,10],clap:[4,12],hat:[2,6,10,14],soft:1,bass:[D2,_,_,D2,_,_,G2,_,C2,_,_,C2,_,_,A1,_],mel:[F4,_,A4,_,_,C5,_,_,E4,_,G4,_,_,A4,_,_],wave:'tri',bv:.45,mv:.2},
 polka:{kick:[0,4,8,12],clap:[2,6,10,14],hat:[],bass:[C2,_,G2,_,C2,_,G2,_,G2,_,D2,_,G2,_,C2,_],mel:[E5,D5,C5,D5,E5,_,E5,_,D5,C5,B4,C5,D5,_,G4,_],wave:'sq',bv:.42,mv:.15},
 horror:{kick:[0,3],clap:[12],hat:[],bass:[A1,_,_,_,Bb2/2,_,_,_,A1,_,_,_,Eb3/4,_,_,_],mel:[A4,_,Bb3*2,_,A4,_,_,Eb4,_,_,A4,_,Bb3*2,_,_,_],wave:'saw',bv:.5,mv:.14,vib:1}};})();
const BGM_OF={run:'disco',melt:'funeral',love:'lofi',chicken:'polka',lotto:'disco',sink:'horror',zombie:'funeral',bigmouth:'dumchit',headspin:'chip',windmill:'chip',combo:'disco',sixstep:'chip',groove:'dumchit',commute:'funeral',salary:'trot',diet:'polka',exam:'horror',doom:'funeral',jackpot:'disco',moon:'chip',crash:'horror',soju:'trot',coffee:'chip',snack:'trot',sleepy:'lofi',mom:'horror',boss:'march',bday:'polka',bye:'lofi',night:'lofi'};
const Beat=(()=>{const BPM=118,S=60/BPM/4,cache={};
 function render(sr,beats,name){const st=STYLES[name],Nn=Math.ceil(beats*60/BPM*sr)+sr,x=new Float32Array(Nn),add=(t,fn,dur,g)=>{const i0=Math.floor(t*sr),n=Math.min(Math.floor(dur*sr),Nn-i0);for(let i=0;i<n;i++)x[i0+i]+=fn(i/sr)*g};
  const wav1=(f,u,w,vib)=>{const ff=vib?f*(1+.012*Math.sin(2*Math.PI*5.5*u)):f,ph=(u*ff)%1;return w==='sq'?(ph<.5?1:-1):w==='saw'?2*ph-1:1-4*Math.abs(ph-.5)};
  const steps=beats*4,kv=st.soft?.7:1;for(let k=0;k<steps;k++){const s=k%16,bar=Math.floor(k/16),t=k*S;
   if(st.kick.includes(s)){let ph=0;add(t,u=>{ph+=2*Math.PI*(48+110*Math.exp(-u*32))/sr;return Math.sin(ph)*Math.exp(-u*12)},.24,kv)}
   if(st.clap.includes(s)){let y=0;add(t,u=>{const n=Math.random()*2-1;y+=.42*(n-y);return(n-y)*Math.exp(-u*24)*1.1},.15,st.soft?.4:.7)}
   if(st.hat.includes(s)){let p=0;const d=st.open?.12:.04;add(t,u=>{const n=Math.random()*2-1,h=n-p;p=n;return h*Math.exp(-u*(st.open?30:110))},d,.22)}
   const bn=st.bass[s];if(bn){const d=S*(st.slow?3.5:1.5);add(t,u=>(wav1(bn,u,'sq')*.5+Math.sin(2*Math.PI*bn*u)*.5)*Math.min(1,Math.exp(-u*(st.slow?1.5:6))*1.4)*Math.min(1,(d-u)*40),d,st.bv)}
   const mn=st.mel[s];if(mn&&(bar%2||name!=='dumchit')){const d=S*(st.slow?3.5:1.6);add(t,u=>wav1(mn,u,st.wave,st.vib)*Math.exp(-u*(st.slow?1.2:7))*Math.min(1,u*200)*Math.min(1,(d-u)*40),d,st.mv)}}
  for(let i=0;i<Nn;i++)x[i]=Math.tanh(x[i]*1.5);return x}
 return{get(sr,beats,name='dumchit'){const k=name+beats;if(!cache[k])cache[k]=render(sr,beats,name);return cache[k]},BPM}})();
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

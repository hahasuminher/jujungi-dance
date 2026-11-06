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
const BGM_OF={poop:'polka',fart:'polka',sorry:'lofi',huh:'horror',shock:'disco',yar:'chip',fri:'disco',lazy:'lofi',congrats:'polka',run:'disco',melt:'funeral',love:'lofi',chicken:'polka',lotto:'disco',sink:'horror',zombie:'funeral',bigmouth:'dumchit',headspin:'chip',windmill:'chip',combo:'disco',sixstep:'chip',groove:'dumchit',commute:'funeral',salary:'trot',diet:'polka',exam:'horror',doom:'funeral',jackpot:'disco',moon:'chip',crash:'horror',soju:'trot',coffee:'chip',snack:'trot',sleepy:'lofi',mom:'horror',boss:'march',bday:'polka',bye:'lofi',night:'lofi'};
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
/* 클럽 음악: 테마마다 32박 루프를 합성해 필요한 길이로 반복 */
const EDM=(()=>{const BPMS={edm:128,hiphop:88,disco:118,trot:126},cache={},TAU=Math.PI*2,mf=m=>440*2**((m-69)/12);
 function edmBars(sr){const B=60/128;const N=Math.round(B*32*sr),x=new Float32Array(N);const CH=[[110,130.8,164.8],[87.3,130.8,174.6],[98,146.8,196],[82.4,123.5,164.8]];let lp=0;
  for(let i=0;i<N;i++){const t=i/sr,b=t/B,bb=b%1,bar=Math.floor(b/4)%4,c=CH[bar],k=48+120*Math.exp(-bb*B*30),ks=Math.sin(2*Math.PI*k*bb*B)*Math.exp(-bb*B*11);
   const off=(b+.5)%1,bf=c[0]/2,bass=(2*((t*bf)%1)-1)*Math.min(1,off*7)*Math.exp(-off*2.2)*.5;
   let saw=0;for(const f of c)for(const d of[.995,1,1.006])saw+=2*((t*f*2*d)%1)-1;saw/=9;const gate=(b*2)%1<.55?1:.12;lp+=.22*(saw*gate-lp);
   const hat=((b*2)%1<.08?1:0)*(Math.random()*2-1)*.14,clap=(Math.floor(b)%2===1&&bb<.12)?(Math.random()*2-1)*Math.exp(-bb*30)*.32:0;
   const sweep=bar===3?Math.sin(2*Math.PI*t*(600+900*((b%4)/4)))*.06*((b%4)/4):0;
   x[i]=Math.tanh(ks*.95+bass+lp*.55+hat+clap+sweep)}return x}
 function kit(sr,bpm,beats=32){const B=60/bpm,N=Math.round(B*beats*sr),x=new Float32Array(N),add=(at,dur,fn)=>{const i0=Math.round(at*sr),n=Math.round(dur*sr);for(let i=0;i<n;i++)x[(i0+i)%N]+=fn(i/sr)*Math.min(1,(dur-i/sr)*60)};
  return{B,N,x,add,kick:(at,f=48,g=.95)=>add(at,.3,t=>Math.sin(TAU*(f*t+(130/26)*(1-Math.exp(-t*26))))*Math.exp(-t*12)*g),
   snare:(at,g=.42)=>add(at,.2,t=>((Math.random()*2-1)*.8+Math.sin(TAU*190*t)*.6)*Math.exp(-t*17)*g),
   hat:(at,g=.13,d=70)=>{let l=0;add(at,.1+14/d,t=>{const r=Math.random()*2-1,h=r-l;l=r;return h*Math.exp(-t*d)*g})},
   tone:(at,dur,f,g,fn)=>add(at,dur,t=>fn(t,f)*g),finish(){for(let i=0;i<N;i++)x[i]=Math.tanh(x[i]*1.05);return x}}}
 function hiphopBars(sr){const k=kit(sr,88),{B}=k,sw=s=>(s%2?s+.3:s)*B/4,CH=[[57,60,64],[53,57,60],[55,59,62],[52,55,59]],BASS=[33,29,31,28];
  for(let bar=0;bar<8;bar++){const o=bar*16,ch=CH[bar%4],r=BASS[bar%4];for(const st of[0,7,10])k.kick(sw(o+st),46);for(const st of[4,12])k.snare(sw(o+st),.5);for(let st=0;st<16;st+=2)k.hat(sw(o+st),st%4===2?.16:.09,st%8===6?22:80);
   k.tone(sw(o),B*1.6,mf(r),.62,(t,f)=>Math.sin(TAU*f*t)*Math.exp(-t*1.9));k.tone(sw(o+10),B*.9,mf(r),.5,(t,f)=>Math.sin(TAU*f*t)*Math.exp(-t*3));
   for(const st of[0,3,6])for(const n of ch)k.tone(sw(o+st),.32,mf(n),.1,(t,f)=>(Math.sin(TAU*f*t)+.4*Math.sin(TAU*2*f*t)+.2*Math.sin(TAU*3.01*f*t))*Math.exp(-t*9));
   if(bar%2)for(const[st,n]of[[8,76],[11,79],[14,81]])k.tone(sw(o+st),.3,mf(n),.1,(t,f)=>Math.sin(TAU*f*t)*Math.exp(-t*12))}
  return k.finish()}
 function discoBars(sr){const k=kit(sr,118),{B}=k,CH=[[62,65,69,72],[55,59,62,65],[60,64,67,71],[57,60,64,67]],BASS=[38,31,36,33];
  for(let bar=0;bar<8;bar++){const o=bar*4,ch=CH[bar%4],r=BASS[bar%4];for(let b=0;b<4;b++){k.kick((o+b)*B,52,.82);k.hat((o+b+.5)*B,.17,16);k.hat((o+b+.25)*B,.06);k.hat((o+b+.75)*B,.06);if(b%2)k.snare((o+b)*B,.34)}
   for(let e=0;e<8;e++)k.tone((o+e/2)*B,B*.42,mf(r+(e%2?12:0)),.3,(t,f)=>(2*((t*f)%1)-1)*.55*Math.exp(-t*6));
   for(const st of[1.5,3,6.5,10,13.5])for(const n of ch)k.tone((o+st/4)*B,.13,mf(n+12),.055,(t,f)=>(2*((t*f)%1)-1)*Math.exp(-t*16));
   for(const n of ch)k.tone(o*B,B*4,mf(n),.03,(t,f)=>(Math.sin(TAU*f*1.004*t)+Math.sin(TAU*f*.996*t))*Math.min(1,t*2))}
  return k.finish()}
 function trotBars(sr){const k=kit(sr,126),{B}=k,CH=[[57,60,64],[62,65,69],[52,56,59],[57,60,64]],BASS=[[33,40],[38,45],[28,35],[33,40]],M=[[0,69,1],[1,72,.5],[1.5,74,.5],[2,76,1.5],[3.5,74,.5],[4,72,1],[5,74,.5],[5.5,72,.5],[6,69,2],[8,74,1],[9,77,.5],[9.5,76,.5],[10,74,1.5],[11.5,72,.5],[12,71,1],[13,72,.5],[13.5,74,.5],[14,76,2],[16,76,.5],[16.5,79,.5],[17,81,1],[18,79,.5],[18.5,76,.5],[19,74,1],[20,72,1],[21,74,.5],[21.5,76,.5],[22,74,2],[24,76,1],[25,74,.5],[25.5,72,.5],[26,71,1.5],[27.5,72,.5],[28,69,3]],org=(t,f)=>{const v=1+.006*Math.sin(TAU*5.6*t),p=t*f*v;return(2*(p%1)-1)*.45+(((p*2)%1)<.5?.3:-.3)};
  for(let bar=0;bar<8;bar++){const o=bar*4,ch=CH[bar%4],b=BASS[bar%4];k.kick(o*B,58,.85);k.kick((o+2)*B,58,.78);k.snare((o+1)*B,.3);k.snare((o+3)*B,.34);for(let e=0;e<8;e++)k.hat((o+e/2)*B,e%2?.11:.05,60);
   k.tone(o*B,B*.8,mf(b[0]),.4,(t,f)=>Math.sin(TAU*f*t)*Math.exp(-t*3));k.tone((o+2)*B,B*.8,mf(b[1]),.36,(t,f)=>Math.sin(TAU*f*t)*Math.exp(-t*3));
   for(const st of[1,3])for(const n of ch)k.tone((o+st)*B,.17,mf(n),.075,org)}
  for(const[st,n,l]of M)k.tone(st*B,l*B*.92,mf(n),.26,org);
  return k.finish()}
 const CHORD={C:[60,64,67],F:[60,65,69],G:[59,62,67],Am:[60,64,69],Dm:[62,65,69],E:[59,64,68],D:[62,66,69]},org=(t,f)=>{const v=1+.005*Math.sin(TAU*5.6*t),p=t*f*v;return(2*(p%1)-1)*.42+(((p*2)%1)<.5?.26:-.26)};
 function band(sr,S,beats,lead,total){const k=kit(sr,S.bpm,beats+8),{B}=k,o=new Float32Array(Math.round(total*sr)),ch=S.ch.split(' '),L=lead/B;
  for(let i=0;i<4;i++){k.hat((L-4+i)*B>0?(L-4+i)*B:0,.14,40)}
  for(let b=0;b<beats;b++){const bar=Math.floor(b/S.bar),c=ch[bar%ch.length],pos=(L+b)*B,st=b%S.bar,cd=CHORD[c]||CHORD.C,root=cd[0]-24+(c==='Am'?9:c==='F'?5:c==='G'?-1:c==='Dm'?0:0);
   if(st%2===0){k.kick(pos,56,.7);k.tone(pos,B*.8,mf(root+(st?7:0)),.3,(t,f)=>Math.sin(TAU*f*t)*Math.exp(-t*3))}else{k.snare(pos,.22);for(const n of cd)k.tone(pos,.16,mf(n),.05,org)}k.hat(pos+B/2,.08,60)}
  for(let i=0;i<o.length&&i<k.x.length;i++)o[i]=k.x[i]*.6;return o}
 const MK={edm:edmBars,hiphop:hiphopBars,disco:discoBars,trot:trotBars};
 return{band,bpm:t=>BPMS[t]||128,make(sr,secs,t='edm'){if(!MK[t])t='edm';const c=cache[t]||(cache[t]=MK[t](sr)),N=Math.round(secs*sr),o=new Float32Array(N);for(let i=0;i<N;i++)o[i]=c[i%c.length]*.72;return o}}})();
/* 박치기 효과음 */
const Sfx=(()=>{const sr=22050,mk=(dur,fn)=>{const n=Math.round(dur*sr),o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=fn(i/sr)*Math.min(1,(dur-i/sr)*40);return o};
 const SND={'뿡!':()=>{let p=0;return mk(.55,t=>{p+=(92+34*Math.sin(t*38)-55*t)/sr;const w=(p%1)<.5?1:-1;return w*.75*Math.exp(-t*2.4)})},'뿌직!':()=>{let y=0;return mk(.42,t=>{y+=.3*((Math.random()*2-1)-y);return(y*2.4+Math.sin(2*Math.PI*(70+90*t)*t)*.5)*(Math.sin(t*70)>-.2?1:.2)*Math.exp(-t*3)})},'뿅!':()=>{let p=0;return mk(.28,t=>{p+=(t<.1?900+6200*t:1520+2400*(t-.1))/sr;const v=Math.sin(2*Math.PI*p);return(v>0?.8:-.8)*.55*Math.exp(-t*7)+Math.sin(2*Math.PI*p*2)*.25*Math.exp(-t*9)})},'깡!':()=>{let y=0;return mk(.55,t=>{y+=.5*((Math.random()*2-1)-y);return y*2.2*Math.exp(-t*70)+(Math.sin(2*Math.PI*1760*t)*.5+Math.sin(2*Math.PI*2640*t)*.35+Math.sin(2*Math.PI*3970*t)*.2)*Math.exp(-t*9)})},'빡!':()=>{let y=0;return mk(.14,t=>{y+=.6*((Math.random()*2-1)-y);return(y*3+Math.sin(2*Math.PI*620*t)*.7)*Math.exp(-t*34)})},'삐융!':()=>{let p=0;return mk(.7,t=>{p+=(2100-1500*t/.7+60*Math.sin(t*60))/sr;return Math.sin(2*Math.PI*p)*.75*Math.min(1,t*30)})},'퍽!':()=>{let y=0;return mk(.16,t=>{y+=.3*((Math.random()*2-1)-y);return(y*2.4+Math.sin(2*Math.PI*150*t)*.8)*Math.exp(-t*26)})},'쿵!':()=>mk(.34,t=>Math.sin(2*Math.PI*(44+90*Math.exp(-t*20))*t)*Math.exp(-t*9)*1.1),'뽁!':()=>mk(.13,t=>Math.sin(2*Math.PI*(260+1500*t*t*40)*t)*Math.exp(-t*24))};
 const urls={},el=new Audio();el.preload='auto';el.setAttribute('playsinline','');
 return{unlock(){if(!Object.keys(urls).length){for(const k in SND)urls[k]=URL.createObjectURL(wav(SND[k](),sr));try{if(engine){const s=buildSpeech('아야',VOICE_DEFAULT);urls['아야!']=URL.createObjectURL(wav(s.pcm,SR))}}catch(e){}}el.src=SILENT;el.play().catch(()=>{})},play(k,v){if(!urls[k])return;el.pause();el.src=urls[k];el.volume=Math.max(0,Math.min(1,v));el.play().catch(()=>{})}}})();

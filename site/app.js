/* 화면 연결 */
const $=id=>document.getElementById(id),store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
let voice={...VOICE_DEFAULT,...store.get('jd.voice',{})},seed=(Math.random()*2**31)|0,found=new Set(store.get('jd.found',[]));
const cv=$('cv'),g=cv.getContext('2d');let W=0,Ht=0,dpr=1;
function size(){const r=cv.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;Ht=r.height;cv.width=W*dpr;cv.height=Ht*dpr}
new ResizeObserver(size).observe(cv);size();
let ac=null,src=null,play=null,events=[],evI=0,specials=[],spI=0,subText='',subI=-1,tick=-1,burstHue=0,lastWord=-1,lastBurst=0,burst=0,last=performance.now();
const player=new Audio();player.preload='auto';player.setAttribute('playsinline','');let wavUrl=null;
function audio(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();BGM.init(ac,ac.destination)}if(ac.state==='suspended')ac.resume();const o=ac.createBufferSource();o.buffer=ac.createBuffer(1,1,ac.sampleRate);o.connect(ac.destination);o.start()}
function wav(pcm,sr){const n=pcm.length,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);for(let i=0;i<n;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,pcm[i]))*32767,true);return new Blob([b],{type:'audio/wav'})}
function render(now){g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#fff';g.fillRect(0,0,W,Ht);const S=Math.min(Ht*.78/1790,W*.8/1340),ox=W/2,oy=Ht*.54;
 if(burst>.05){const R0=Math.max(W,Ht)*.42*burst,n=13,rot=calm?0:Math.floor(now/110)*.13;g.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,r=R0*(i%2?.62:1);i?g.lineTo(ox+Math.cos(a)*r,oy+Math.sin(a)*r):g.moveTo(ox+Math.cos(a)*r,oy+Math.sin(a)*r)}g.closePath();g.fillStyle=burstHue?'#ff2bb3':'#f4ff1f';g.fill()}
 Dance.render(g,W,Ht,S,ox,oy,tick,calm,burstHue)}
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;
 if(play){const ms=play.clock();while(evI<events.length&&events[evI].ms<=ms)fire(events[evI++]);while(spI<specials.length&&specials[spI].ms<=ms){const sp=specials[spI++];if(Dance.big(sp.name)){BGM.burst(8);BGM.duck(true)}if(!found.has(sp.word)){found.add(sp.word);store.set('jd.found',[...found]);showFound()}}if(ms>=play.total)finish()}
 Dance.update(dt,now,calm);burst+=(((play||Dance.isBig())?1:0)-burst)*.14;
 const q=Math.floor(now/83);if(!Dance.isBig()||q!==tick){tick=q;render(now)}requestAnimationFrame(loop)}
function fire(e){const j=$('jamo');j.textContent=e.j;if(!calm)j.style.transform=`rotate(${(Math.random()*26-13).toFixed(1)}deg) scale(${(.9+Math.random()*.25+e.ex*.05).toFixed(2)})`;Dance.event(e);
 if(e.idx!==subI){subI=e.idx;drawSub()}const t=performance.now();if(e.word!==lastWord&&t-lastBurst>340){lastBurst=t;lastWord=e.word;burstHue=1-burstHue}}
function drawSub(){const el=$('sub'),a=[...subText];if(!a.length){el.textContent='';return}const st=Math.max(0,subI-34),en=Math.min(a.length,st+60),h=document.createElement('b');h.textContent=a[subI]||'';const t=document.createElement('span');t.className='t';t.append(a.slice(st,Math.max(st,subI)).join(''),h,a.slice(subI+1,en).join(''));el.replaceChildren(t)}
function stopAudio(){player.onended=null;player.pause();if('speechSynthesis'in window)speechSynthesis.cancel();play=null;events=[];evI=0;specials=[];spI=0}
function finish(){stopAudio();Dance.relax();BGM.duck(false);$('jamo').textContent='';subI=-1;$('sub').textContent='';setBtn(false)}
function setBtn(on){const b=$('go');b.dataset.on=on?'1':'0';b.textContent=on?'닥쳐':'주둥이 털기'}
function speak(){if(play){finish();Dance.stop();BGM.stop();return}if(Dance.isBig()){Dance.stop();BGM.stop()}const msg=$('msg');msg.textContent='';msg.className='';audio();
 const raw=$('say').value;const s=engine?buildSpeech(raw,voice):null;
 if(engine&&(!s||!s.text)){msg.textContent='읽을 글자가 없어요. 한글, 영어, 숫자를 넣어 주세요.';msg.className='err';return}
 if(s&&s.skipped)msg.textContent=`읽을 수 없는 글자 ${s.skipped}개는 건너뛰었어요.`;
 if(engine){subText=s.text;events=s.events;evI=0;specials=s.specials;spI=0;if(wavUrl)URL.revokeObjectURL(wavUrl);wavUrl=URL.createObjectURL(wav(s.pcm,SR));player.src=wavUrl;player.onended=finish;const pr=player.play();if(pr)pr.catch(e=>{console.warn(e);msg.textContent='소리를 재생하지 못했어요. 기기 음량을 확인하고 다시 눌러 주세요.';msg.className='err'});play={clock:()=>player.currentTime*1000,total:s.totalMs+300}}
 else{const{spoken}=toSpoken(raw);if(!spoken){msg.textContent='읽을 글자가 없어요.';msg.className='err';return}subText=spoken;const chars=[...spoken],list=[];chars.forEach((ch,i)=>{const d=decompose(ch);if(d)d.forEach((x,k)=>list.push({...x,idx:i,word:0,ex:0,q:0,til:0,dots:false,ms:i*190+k*60}))});events=list;evI=0;const t0=performance.now();play={clock:()=>performance.now()-t0,total:chars.length*190};if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance(spoken);u.lang='ko-KR';u.pitch=2;u.rate=1.25;speechSynthesis.speak(u)}}
 subI=-1;lastWord=-1;drawSub();BGM.duck(true);setBtn(true)}
/* 목소리 */
const SL=[['pitch','높이',0,99,1],['rate','말 빠르기',80,300,1],['range','억양 폭',0,99,1],['speed','다람쥐 정도',.6,1.9,.01],['wobble','떨림',0,1,.01],['robot','로봇 정도',0,.9,.01]];
function drawVoice(){$('presets').replaceChildren(...[...VOICE_PRESETS,...store.get('jd.custom',[])].map(p=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=p.name;b.setAttribute('aria-pressed',p.id===voice.id);b.onclick=()=>{voice={...p};store.set('jd.voice',voice);drawVoice()};return b}));
 $('sliders').replaceChildren(...SL.map(([k,n,a,b,st])=>{const l=document.createElement('label');l.textContent=n;const i=document.createElement('input');i.type='range';i.id='v-'+k;i.min=a;i.max=b;i.step=st;i.value=voice[k]??0;i.oninput=()=>{voice={...voice,[k]:+i.value,id:'custom',name:'내 목소리'};store.set('jd.voice',voice)};l.append(i);return l}))}
$('voiceTest').onclick=()=>{if(play)finish();const old=$('say').value;$('say').value='안녕하세요!! 제 목소리 어때요?';speak();$('say').value=old};
$('voiceSave').onclick=()=>{const list=store.get('jd.custom',[]),id='c'+Date.now();const v={...voice,id,name:`내 목소리 ${list.length+1}`};list.push(v);store.set('jd.custom',list.slice(-6));voice=v;store.set('jd.voice',v);drawVoice();$('msg').textContent='목소리를 저장했어요.'};
/* 공유 */
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const dec=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))));
$('share').onclick=async()=>{const code=enc({t:$('say').value.slice(0,300),v:voice,s:seed}),url=location.href.split('#')[0]+'#d='+code;try{await navigator.clipboard.writeText(url);$('msg').textContent='링크를 복사했어요. 친구에게 보내세요.'}catch(e){$('msg').textContent=url}};
function fromLink(){const m=location.hash.match(/^#d=(.+)/);if(!m)return;try{const d=dec(m[1]);if(typeof d.t==='string')$('say').value=d.t.slice(0,300);if(d.v&&typeof d.v==='object')for(const[k]of SL)if(typeof d.v[k]==='number')voice[k]=clampN(d.v[k],SL.find(x=>x[0]===k)[2],SL.find(x=>x[0]===k)[3]);voice.id='shared';voice.name='친구 목소리';if(Number.isFinite(d.s))seed=d.s|0;$('msg').textContent='친구의 춤이 도착했어요. 주둥이 털기를 누르세요.'}catch(e){$('msg').textContent='공유 링크를 읽지 못했어요.'}}
function showFound(){const n=Object.keys(SPECIALS).length;$('found').textContent=found.size?`숨은 단어 ${n}개 중 ${found.size}개 발견`:`숨은 단어가 ${n}개 있습니다. 찾아보세요.`}
$('f').addEventListener('submit',e=>{e.preventDefault();speak()});
$('say').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('f').requestSubmit()}});
fromLink();Dance.reseed(seed);drawVoice();showFound();
(async()=>{await Promise.all(['A','B','C','D','E','F'].map(k=>new Promise(r=>{const i=new Image();i.onload=()=>{IMG[k]=i;r()};i.onerror=r;i.src=`assets/${k}.png`})));
 try{await bootVoice()}catch(e){console.warn(e);$('msg').textContent='웃긴 목소리를 불러오지 못해서 기기 기본 목소리로 말합니다.';$('msg').className='err'}
 $('go').disabled=false;$('go').textContent='주둥이 털기'})();
requestAnimationFrame(loop);

/* 광장: 접속, 외침 대기열, 군중 그리기 */
const Plaza=(()=>{let ws=null,on=false,me=0,room=0,roster=[],queue=[],busy=false,beep=true,muted=new Set(),speaking=0,log=[],retry=0;
 const $p=id=>document.getElementById(id),say=(t,err)=>{const m=$p('msg');m.textContent=t;m.className=err?'err':''};
 function paint(){$p('enter').textContent=on?'광장 나가기':'광장 입장';$p('enter').dataset.on=on?'1':'0';$p('plazaBar').hidden=!on;$p('roomInfo').textContent=on?`${room}광장 · ${roster.length}명 · 나는 ${me}번 아저씨`:'';$p('beep').textContent=beep?'욕 삐 처리 켬':'욕 삐 처리 끔';$p('beep').setAttribute('aria-pressed',beep);
  $p('log').replaceChildren(...log.slice(-6).reverse().map(l=>{const li=document.createElement('li'),t=document.createElement('span');t.textContent=`${l.no}번: ${beep?l.masked:l.text}`;li.append(t);if(l.no!==me){const a=document.createElement('button');a.type='button';a.textContent=muted.has(l.no)?'음소거 해제':'음소거';a.onclick=()=>{muted.has(l.no)?muted.delete(l.no):muted.add(l.no);paint()};const r=document.createElement('button');r.type='button';r.textContent='신고';r.onclick=()=>{send({type:'report',no:l.no})};li.append(a,r)}return li}))}
 const send=o=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
 async function enter(){if(on)return leave();if(!$p('rules').open){$p('rules').open=true;$p('rules').scrollIntoView({block:'nearest'});return}unlockAudio();say('광장에 들어가는 중이에요.');try{const r=await fetch('/api/room');const j=await r.json();if(!j.room)return say('광장이 가득 찼어요. 잠시 뒤에 다시 와 주세요.',true);connect(j.room)}catch(e){say('광장에 연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.',true)}}
 function connect(r){room=r;ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws?room=${r}`);ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
   if(m.type==='hello'){on=true;retry=0;me=m.no;room=+m.room;roster=m.roster;say('광장에 들어왔어요. 외치면 다 같이 듣습니다.');$p('rules').open=false;paint();ping()}
   else if(m.type==='full'){say('자리가 찼어요. 다른 광장을 찾는 중이에요.');on=false;ws=null;setTimeout(enter2,300)}
   else if(m.type==='roster'){roster=m.roster;paint()}
   else if(m.type==='denied')say(m.why,true);else if(m.type==='notice')say(m.text);
   else if(m.type==='shout'){log.push(m);if(log.length>30)log.shift();paint();if(!muted.has(m.no)){queue.push(m);if(queue.length>5)queue.shift();next()}}};
  ws.onclose=()=>{if(on){on=false;roster=[];queue=[];paint();say('광장 연결이 끊겼어요. 다시 입장해 주세요.',true)}}}
 async function enter2(){try{const j=await (await fetch('/api/room')).json();if(j.room)connect(j.room)}catch(e){}}
 let pt=null;function ping(){clearInterval(pt);pt=setInterval(()=>{if(ws&&ws.readyState===1)ws.send('ping')},25000)}
 function leave(){on=false;clearInterval(pt);if(ws){ws.onclose=null;ws.close();ws=null}roster=[];queue=[];log=[];busy=false;speaking=0;paint();say('광장에서 나왔어요.')}
 function next(){if(busy||!queue.length)return;const m=queue.shift();busy=true;speaking=m.no;const raw=beep?m.masked.replace(/★+/g,'삐'):m.text;if(!App.speakText(raw,m.voice,`${m.no}번 아저씨`)){busy=false;speaking=0;next()}}
 return{isOn:()=>on,shout(text,voice){if(!text.trim())return say('외칠 말을 넣어 주세요.',true);send({type:'shout',text:text.slice(0,120),voice});},done(){busy=false;speaking=0;setTimeout(next,450)},
  crowd(g,W,Ht,S,tick,dance){if(!on)return;const n=Math.min(30,roster.length),rows=[[.09,.86],[.91,.86],[.05,.62],[.95,.62],[.17,.93],[.83,.93],[.28,.97],[.72,.97],[.12,.42],[.88,.42],[.38,.99],[.62,.99],[.2,.75],[.8,.75],[.03,.3],[.97,.3],[.25,.55],[.75,.55],[.14,.2],[.86,.2],[.5,.99],[.33,.8],[.67,.8],[.06,.98],[.94,.98],[.22,.3],[.78,.3],[.42,.85],[.58,.85],[.5,.12]],sc=Math.min(Ht,W)*.2/1790;
   for(let i=0;i<n;i++){const[x,y]=rows[i],no=roster[i];dance(g,x*W,y*Ht,sc,no===speaking);g.font='700 13px "Gaegu",sans-serif';g.textAlign='center';g.fillStyle=no===me?'#ff2bb3':'#0d0d0d';g.fillText(String(no),x*W,y*Ht-Ht*.12)}},
  init(){$p('enter').onclick=enter;$p('beep').onclick=()=>{beep=!beep;paint()};$p('volume').oninput=e=>App.setVolume(+e.target.value);paint()}}})();

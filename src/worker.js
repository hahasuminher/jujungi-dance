/* 주둥이 댄스 광장 서버: 방마다 최대 30명 */
import {DurableObject} from 'cloudflare:workers';
import {check} from './filter.js';
const MAX=30,MAX_ROOMS=40,BAN_MS=30*60*1000,REPORTS=3,WORLD=1400,MIC={x:300,y:1150,r:120},REACT=['ㅋㅋㅋ','박수','야유','하트'],CLUB_MS=60000,CLUB_COOL=3600*1000;
const num=(v,a,b,d)=>typeof v==='number'&&isFinite(v)?Math.max(a,Math.min(b,v)):d;
const cleanVoice=v=>({pitch:num(v?.pitch,0,99,85),rate:num(v?.rate,80,300,135),range:num(v?.range,0,99,90),speed:num(v?.speed,.6,1.9,1.32),wobble:num(v?.wobble,0,1,0),robot:num(v?.robot,0,.9,0)});
export class Room extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.bananas=[];this.recent=[];ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'))}
 peers(){return this.ctx.getWebSockets()}
 roster(gone){return this.peers().map(w=>w===gone?null:w.deserializeAttachment()).filter(a=>a&&a.no).map(a=>({no:a.no,x:a.x,y:a.y})).sort((a,b)=>a.no-b.no)}
 send(w,o){try{w.send(JSON.stringify(o))}catch(e){}}
 others(ws,o){const s=JSON.stringify(o);for(const w of this.peers())if(w!==ws)try{w.send(s)}catch(e){}}
 all(o){const s=JSON.stringify(o);for(const w of this.peers())try{w.send(s)}catch(e){}}
 async fetch(req){const u=new URL(req.url);if(u.pathname.endsWith('/count'))return Response.json({n:this.peers().length});
  if(req.headers.get('upgrade')!=='websocket')return new Response('websocket only',{status:426});
  const pair=new WebSocketPair(),[c,s]=[pair[0],pair[1]];const list=this.roster();
  this.ctx.acceptWebSocket(s);if(list.length>=MAX){this.send(s,{type:'full'});s.close(4001,'full');return new Response(null,{status:101,webSocket:c})}
  const key=await hashIp(req.headers.get('cf-connecting-ip')||'x',this.env),ban=(await this.ctx.storage.get('b:'+key))||0;if(ban>Date.now()){this.send(s,{type:'banned',why:`신고가 누적되어 ${Math.ceil((ban-Date.now())/60000)}분간 입장할 수 없어요.`});s.close(4003,'banned');return new Response(null,{status:101,webSocket:c})}let no=1;const used=list.map(p=>p.no);while(used.includes(no))no++;const x=300+Math.random()*800,y=350+Math.random()*600;s.serializeAttachment({no,key,x,y,times:[],mv:0,bp:0,rc:0});
  if(!this.bananas.length)for(let i=0;i<4;i++)this.bananas.push({id:crypto.randomUUID().slice(0,6),x:150+Math.random()*1100,y:200+Math.random()*1000});const cl=await this.ctx.storage.get('club'),last=(await this.ctx.storage.get('c:'+key))||0;this.send(s,{type:'hello',no,room:u.searchParams.get('room')||'1',roster:this.roster(),mic:MIC,world:WORLD,bananas:this.bananas,clubWait:Math.max(0,CLUB_COOL-(Date.now()-last)),club:cl&&cl.until>Date.now()?{...cl,left:cl.until-Date.now()}:null});this.all({type:'roster',roster:this.roster()});return new Response(null,{status:101,webSocket:c})}
 async webSocketMessage(ws,msg){if(typeof msg!=='string'||msg.length>1500)return;let m;try{m=JSON.parse(msg)}catch(e){return}const a=ws.deserializeAttachment();if(!a)return;const now=Date.now();
  if(m.type==='shout'){
   const t=(a.times||[]).filter(x=>now-x<60000);if(t.length&&now-t[t.length-1]<2500)return this.send(ws,{type:'denied',why:'조금만 천천히 외쳐 주세요.'});if(t.length>=10)return this.send(ws,{type:'denied',why:'1분에 10번까지만 외칠 수 있어요.'});
   const text=String(m.text||'').slice(0,120).trim();if(!text)return;const r=check(text);if(!r.ok)return this.send(ws,{type:'denied',why:r.why});t.push(now);a.times=t;ws.serializeAttachment(a);
   const mic=Math.hypot(a.x-MIC.x,a.y-MIC.y)<=MIC.r;const key=r.masked.replace(/[\s.,!?~]/g,'');this.recent=this.recent.filter(x=>now-x.t<10000);this.recent.push({t:now,key,no:a.no});const same=new Set(this.recent.filter(x=>x.key===key).map(x=>x.no));if(same.size>=2&&key.length>=2){this.recent=this.recent.filter(x=>x.key!==key);this.all({type:'combo',word:r.masked.slice(0,12),n:same.size})}this.all({type:'shout',id:crypto.randomUUID().slice(0,8),no:a.no,text:mic?r.masked:r.text,masked:r.masked,mic,voice:cleanVoice(m.voice)})}
  else if(m.type==='move'){if(now-(a.mv||0)<300)return;a.mv=now;a.x=num(m.x,0,WORLD,a.x);a.y=num(m.y,0,WORLD,a.y);ws.serializeAttachment(a);const s=JSON.stringify({type:'pos',no:a.no,x:a.x,y:a.y});for(const w of this.peers())if(w!==ws)try{w.send(s)}catch(e){}}
  else if(m.type==='pose'){if(!['sit','lie','stand'].includes(m.k))return;this.others(ws,{type:'pose',no:a.no,k:m.k})}
  else if(m.type==='link'){if(!['train','ride','none'].includes(m.k))return;a.link=typeof m.to==='number'?m.to:0;a.linkK=m.k;ws.serializeAttachment(a);this.all({type:'link',no:a.no,to:a.link,k:m.k})}
  else if(m.type==='jump'){if(now-(a.jp||0)<700)return;a.jp=now;ws.serializeAttachment(a);this.others(ws,{type:'jump',no:a.no})}
  else if(m.type==='banana'){if(now-(a.bn||0)<8000)return this.send(ws,{type:'denied',why:'바나나는 8초에 한 번만 놓을 수 있어요.'});a.bn=now;ws.serializeAttachment(a);const b={id:crypto.randomUUID().slice(0,6),x:a.x,y:a.y};this.bananas.push(b);if(this.bananas.length>10)this.bananas.shift();this.all({type:'bananas',list:this.bananas})}
  else if(m.type==='slip'){const i=this.bananas.findIndex(b=>b.id===m.id);if(i<0)return;this.bananas.splice(i,1);this.all({type:'slip',no:a.no,list:this.bananas})}
  else if(m.type==='club'){const last=(await this.ctx.storage.get('c:'+a.key))||0,wait=CLUB_COOL-(now-last);if(wait>0)return this.send(ws,{type:'denied',why:`클럽은 ${Math.ceil(wait/60000)}분 뒤에 열 수 있어요.`});const cur=await this.ctx.storage.get('club');if(cur&&cur.until>now)return this.send(ws,{type:'denied',why:'이미 클럽이 열려 있어요.'});const text=String(m.text||'').slice(0,30).trim();if(!text)return;const r=check(text);if(!r.ok||r.masked!==r.text)return this.send(ws,{type:'denied',why:'클럽 문구에는 비속어를 쓸 수 없어요.'});const c={id:crypto.randomUUID().slice(0,8),host:a.no,phrase:r.text,voice:cleanVoice(m.voice),until:now+CLUB_MS};await this.ctx.storage.put('club',c);await this.ctx.storage.put('c:'+a.key,now);this.send(ws,{type:'clubWait',ms:CLUB_COOL});this.all({type:'club',...c,left:CLUB_MS})}
  else if(m.type==='clubIn'){a.club=!!m.on;ws.serializeAttachment(a);const list=this.peers().map(w=>w.deserializeAttachment()).filter(x=>x&&x.club).map(x=>x.no);this.all({type:'clubMembers',list})}
  else if(m.type==='bump'){if(now-(a.bp||0)<400)return;const t=this.peers().find(w=>w.deserializeAttachment()?.no===m.no);if(!t)return;const ta=t.deserializeAttachment();if(Math.hypot(a.x-ta.x,a.y-ta.y)>260)return;a.bp=now;ws.serializeAttachment(a);this.all({type:'bump',a:a.no,b:m.no,p:num(m.p,0,1,.3)})}
  else if(m.type==='react'){if(now-(a.rc||0)<400||!REACT.includes(m.k))return;a.rc=now;ws.serializeAttachment(a);this.all({type:'react',no:a.no,k:m.k})}
  else if(m.type==='report'){const target=this.peers().find(x=>x.deserializeAttachment()?.no===m.no);if(!target)return;const ta=target.deserializeAttachment();if(ta.key===a.key)return;const k='r:'+ta.key,list=((await this.ctx.storage.get(k))||[]).filter(x=>now-x.t<BAN_MS);if(!list.some(x=>x.key===a.key))list.push({key:a.key,t:now});await this.ctx.storage.put(k,list);this.send(ws,{type:'notice',text:`주둥이 ${m.no}을 신고했어요.`});if(new Set(list.map(x=>x.key)).size>=REPORTS){await this.ctx.storage.put('b:'+ta.key,now+BAN_MS);await this.ctx.storage.delete(k);for(const x of this.peers()){if(x.deserializeAttachment()?.key===ta.key){this.send(x,{type:'banned',why:'신고가 누적되어 30분간 입장할 수 없어요.'});x.close(4003,'banned')}}this.all({type:'roster',roster:this.roster().filter(p=>p.no!==ta.no)})}}
  else if(m.type==='dropRider'){for(const x of this.peers()){const q=x.deserializeAttachment();if(q&&q.link===a.no&&q.linkK==='ride'){q.link=0;q.linkK='none';x.serializeAttachment(q);this.all({type:'link',no:q.no,to:0,k:'none'})}}}}
 async webSocketClose(ws){try{ws.close()}catch(e){}this.all({type:'roster',roster:this.roster(ws)})}
 async webSocketError(ws){this.all({type:'roster',roster:this.roster(ws)})}
}
async function hashIp(ip,env){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+(env.SALT||'jujungi')));return[...new Uint8Array(d)].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('')}
export default{async fetch(req,env){const u=new URL(req.url);
  if(u.pathname==='/api/room'){for(let i=1;i<=MAX_ROOMS;i++){const st=env.ROOM.get(env.ROOM.idFromName('room-'+i)),r=await st.fetch('https://room/count');const{n}=await r.json();if(n<MAX)return Response.json({room:i,n})}return Response.json({room:0},{status:503})}
  if(u.pathname==='/ws'){const room=Math.max(1,Math.min(MAX_ROOMS,parseInt(u.searchParams.get('room'))||1));const o=req.headers.get('origin');if(o&&new URL(o).host!==u.host)return new Response('forbidden',{status:403});return env.ROOM.get(env.ROOM.idFromName('room-'+room)).fetch(req)}
  return env.ASSETS.fetch(req)}};

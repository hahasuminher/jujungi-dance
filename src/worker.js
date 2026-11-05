/* 주둥이 댄스 광장 서버: 방마다 최대 30명 */
import {DurableObject} from 'cloudflare:workers';
import {check} from './filter.js';
const MAX=30,MAX_ROOMS=40,MUTE_MS=10*60*1000,REPORTS=3,WORLD=1400,MIC={x:300,y:1150,r:120},REACT=['ㅋㅋㅋ','박수','야유','하트'];
const num=(v,a,b,d)=>typeof v==='number'&&isFinite(v)?Math.max(a,Math.min(b,v)):d;
const cleanVoice=v=>({pitch:num(v?.pitch,0,99,85),rate:num(v?.rate,80,300,135),range:num(v?.range,0,99,90),speed:num(v?.speed,.6,1.9,1.32),wobble:num(v?.wobble,0,1,0),robot:num(v?.robot,0,.9,0)});
export class Room extends DurableObject{
 constructor(ctx,env){super(ctx,env);this.mutes=new Map();this.reports=new Map();ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'))}
 peers(){return this.ctx.getWebSockets()}
 roster(gone){return this.peers().map(w=>w===gone?null:w.deserializeAttachment()).filter(a=>a&&a.no).map(a=>({no:a.no,x:a.x,y:a.y})).sort((a,b)=>a.no-b.no)}
 send(w,o){try{w.send(JSON.stringify(o))}catch(e){}}
 all(o){const s=JSON.stringify(o);for(const w of this.peers())try{w.send(s)}catch(e){}}
 async fetch(req){const u=new URL(req.url);if(u.pathname.endsWith('/count'))return Response.json({n:this.peers().length});
  if(req.headers.get('upgrade')!=='websocket')return new Response('websocket only',{status:426});
  const pair=new WebSocketPair(),[c,s]=[pair[0],pair[1]];const list=this.roster();
  this.ctx.acceptWebSocket(s);if(list.length>=MAX){this.send(s,{type:'full'});s.close(4001,'full');return new Response(null,{status:101,webSocket:c})}
  let no=1;const used=list.map(p=>p.no);while(used.includes(no))no++;const key=await hashIp(req.headers.get('cf-connecting-ip')||'x',this.env),x=300+Math.random()*800,y=350+Math.random()*600;s.serializeAttachment({no,key,x,y,times:[],mv:0,bp:0,rc:0});
  this.send(s,{type:'hello',no,room:u.searchParams.get('room')||'1',roster:this.roster(),mic:MIC,world:WORLD});this.all({type:'roster',roster:this.roster()});return new Response(null,{status:101,webSocket:c})}
 async webSocketMessage(ws,msg){if(typeof msg!=='string'||msg.length>1500)return;let m;try{m=JSON.parse(msg)}catch(e){return}const a=ws.deserializeAttachment();if(!a)return;const now=Date.now();
  if(m.type==='shout'){const until=this.mutes.get(a.key)||0;if(until>now)return this.send(ws,{type:'denied',why:`신고가 쌓여서 ${Math.ceil((until-now)/60000)}분 동안 외칠 수 없어요.`});
   const t=(a.times||[]).filter(x=>now-x<60000);if(t.length&&now-t[t.length-1]<2500)return this.send(ws,{type:'denied',why:'조금만 천천히 외쳐 주세요.'});if(t.length>=10)return this.send(ws,{type:'denied',why:'1분에 10번까지만 외칠 수 있어요.'});
   const text=String(m.text||'').slice(0,120).trim();if(!text)return;const r=check(text);if(!r.ok)return this.send(ws,{type:'denied',why:r.why});t.push(now);a.times=t;ws.serializeAttachment(a);
   const mic=Math.hypot(a.x-MIC.x,a.y-MIC.y)<=MIC.r;this.all({type:'shout',id:crypto.randomUUID().slice(0,8),no:a.no,text:mic?r.masked:r.text,masked:r.masked,mic,voice:cleanVoice(m.voice)})}
  else if(m.type==='move'){if(now-(a.mv||0)<300)return;a.mv=now;a.x=num(m.x,0,WORLD,a.x);a.y=num(m.y,0,WORLD,a.y);ws.serializeAttachment(a);const s=JSON.stringify({type:'pos',no:a.no,x:a.x,y:a.y});for(const w of this.peers())if(w!==ws)try{w.send(s)}catch(e){}}
  else if(m.type==='bump'){if(now-(a.bp||0)<800)return;const t=this.peers().find(w=>w.deserializeAttachment()?.no===m.no);if(!t)return;const ta=t.deserializeAttachment();if(Math.hypot(a.x-ta.x,a.y-ta.y)>220)return;a.bp=now;ws.serializeAttachment(a);this.all({type:'bump',a:a.no,b:m.no})}
  else if(m.type==='react'){if(now-(a.rc||0)<400||!REACT.includes(m.k))return;a.rc=now;ws.serializeAttachment(a);this.all({type:'react',no:a.no,k:m.k})}
  else if(m.type==='report'){const target=this.peers().find(w=>w.deserializeAttachment()?.no===m.no);if(!target)return;const ta=target.deserializeAttachment();if(ta.key===a.key)return;const set=this.reports.get(ta.key)||new Set();set.add(a.key);this.reports.set(ta.key,set);this.send(ws,{type:'notice',text:`${m.no}번 아저씨를 신고했어요.`});if(set.size>=REPORTS){this.mutes.set(ta.key,now+MUTE_MS);this.reports.delete(ta.key);this.send(target,{type:'denied',why:'신고가 쌓여서 10분 동안 외칠 수 없어요.'})}}}
 async webSocketClose(ws){try{ws.close()}catch(e){}this.all({type:'roster',roster:this.roster(ws)})}
 async webSocketError(ws){this.all({type:'roster',roster:this.roster(ws)})}
}
async function hashIp(ip,env){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+(env.SALT||'jujungi')));return[...new Uint8Array(d)].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('')}
export default{async fetch(req,env){const u=new URL(req.url);
  if(u.pathname==='/api/room'){for(let i=1;i<=MAX_ROOMS;i++){const st=env.ROOM.get(env.ROOM.idFromName('room-'+i)),r=await st.fetch('https://room/count');const{n}=await r.json();if(n<MAX)return Response.json({room:i,n})}return Response.json({room:0},{status:503})}
  if(u.pathname==='/ws'){const room=Math.max(1,Math.min(MAX_ROOMS,parseInt(u.searchParams.get('room'))||1));const o=req.headers.get('origin');if(o&&new URL(o).host!==u.host)return new Response('forbidden',{status:403});return env.ROOM.get(env.ROOM.idFromName('room-'+room)).fetch(req)}
  return env.ASSETS.fetch(req)}};

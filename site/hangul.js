/* ---------- 한글 ---------- */
const CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'.split('');
const JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'.split('');
const JONG=['','ㄱ','ㄲ','ㄱㅅ','ㄴ','ㄴㅈ','ㄴㅎ','ㄷ','ㄹ','ㄹㄱ','ㄹㅁ','ㄹㅂ','ㄹㅅ','ㄹㅌ','ㄹㅍ','ㄹㅎ','ㅁ','ㅂ','ㅂㅅ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JAMO_COMPAT={'ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
const syl=(c,v,f)=>String.fromCharCode(0xAC00+c*588+v*28+f);
function decompose(ch){
  const k=ch.charCodeAt(0)-0xAC00;
  if(k<0||k>11171)return null;
  const c=Math.floor(k/588),v=Math.floor(k%588/28),f=k%28;
  const out=[{j:CHO[c],kind:'c'},{j:JUNG[v],kind:'v'}];
  for(const x of JONG[f])out.push({j:x,kind:'f'});
  return out;
}
function jamoWord(s){ // ㅋㅋㅋ, ㅠㅠ 같은 낱자 읽기
  let o='';
  for(const ch of s){
    const v=JUNG.indexOf(ch);
    if(v>=0){o+=syl(11,v,0);continue}
    if(ch==='ㅇ'){o+='응';continue}
    const first=(JAMO_COMPAT[ch]||ch)[0],c=CHO.indexOf(first);
    if(c>=0)o+=syl(c,18,0);
  }
  return o;
}
const DIG=['영','일','이','삼','사','오','육','칠','팔','구'];
function sino(s){
  s=s.replace(/^0+(?=\d)/,'');
  if(s.length>16)return[...s].map(d=>DIG[d]).join('');
  if(s==='0')return'영';
  const U=['','만','억','조'],P=['','십','백','천'];let o='',g=0;
  for(let i=s.length;i>0;i-=4,g++){
    const part=s.slice(Math.max(0,i-4),i);let t='';
    [...part].reverse().forEach((d,k)=>{if(d!=='0')t=((d==='1'&&k>0)?'':DIG[d])+P[k]+t});
    if(t)o=t+U[g]+' '+o;
  }
  return o.trim().replace(/^일만/,'만');
}
function number(s){
  s=s.replace(/,/g,'');
  const[a,b]=s.split('.');
  return sino(a)+(b?'점'+[...b].map(d=>DIG[d]).join(''):'');
}

/* ---------- 영어 → 한글 발음 ---------- */
const LETTER={A:'에이',B:'비',C:'씨',D:'디',E:'이',F:'에프',G:'지',H:'에이치',I:'아이',J:'제이',K:'케이',L:'엘',M:'엠',N:'엔',O:'오',P:'피',Q:'큐',R:'알',S:'에스',T:'티',U:'유',V:'브이',W:'더블유',X:'엑스',Y:'와이',Z:'지'};
const EN={hello:'헬로',hi:'하이',hey:'헤이',what:'왓',the:'더',a:'어',i:'아이',you:'유',fuck:'퍽',fucking:'퍼킹',shit:'쉿',bitch:'비치',damn:'댐',ok:'오케이',okay:'오케이',love:'러브',pizza:'피자',wow:'와우',yes:'예스',no:'노',sorry:'쏘리',god:'갓',oh:'오',omg:'오마이갓',lol:'롤',thank:'땡크',thanks:'땡스',wtf:'더블유티에프'};
const VOW={'ə':'ㅓ','ʌ':'ㅓ','ɐ':'ㅏ','a':'ㅐ','ɑ':'ㅏ','ɒ':'ㅗ','ɔ':'ㅗ','ɛ':'ㅔ','e':'ㅔ','ɪ':'ㅣ','i':'ㅣ','u':'ㅜ','ʊ':'ㅜ','ɜ':'ㅓ','o':'ㅗ','ɚ':'ㅓ','ᵻ':'ㅣ','æ':'ㅐ'};
const DIPH={'əʊ':['ㅗ'],'oʊ':['ㅗ'],'eɪ':['ㅔ','ㅣ'],'aɪ':['ㅏ','ㅣ'],'aʊ':['ㅏ','ㅜ'],'ɔɪ':['ㅗ','ㅣ'],'ɪə':['ㅣ','ㅓ'],'eə':['ㅔ','ㅓ'],'ɛə':['ㅔ','ㅓ'],'ʊə':['ㅜ','ㅓ']};
const ONS={p:'ㅍ',b:'ㅂ',t:'ㅌ',d:'ㄷ',k:'ㅋ','ɡ':'ㄱ',g:'ㄱ',f:'ㅍ',v:'ㅂ','θ':'ㄸ','ð':'ㄷ',s:'ㅅ',z:'ㅈ','ʃ':'ㅅ','ʒ':'ㅈ','tʃ':'ㅊ','dʒ':'ㅈ',h:'ㅎ',m:'ㅁ',n:'ㄴ','ŋ':'ㅇ',l:'ㄹ','ɹ':'ㄹ',r:'ㄹ','ɾ':'ㄹ',ts:'ㅊ',dz:'ㅈ','ʔ':''};
const CODA={p:'ㅂ',k:'ㄱ',t:'ㅅ',m:'ㅁ',n:'ㄴ','ŋ':'ㅇ',l:'ㄹ'};
const GLIDE_J={'ㅏ':'ㅑ','ㅐ':'ㅒ','ㅓ':'ㅕ','ㅔ':'ㅖ','ㅗ':'ㅛ','ㅜ':'ㅠ','ㅣ':'ㅣ'};
const GLIDE_W={'ㅏ':'ㅘ','ㅐ':'ㅙ','ㅓ':'ㅝ','ㅔ':'ㅞ','ㅗ':'ㅝ','ㅜ':'ㅜ','ㅣ':'ㅟ'};
function ipa2ko(ids,word=''){
  let P=[];
  for(let id of ids){
    id=id.replace(/[ˈˌː.\-'_|!%=]/g,'').trim();
    if(!id)continue;
    if(id==='əl'){P.push('V:ㅡ','l');continue}
    if(id==='ən'){P.push('V:ㅡ','n');continue}
    if(id==='əm'){P.push('V:ㅡ','m');continue}
    if(DIPH[id]){DIPH[id].forEach(v=>P.push('V:'+v));continue}
    if(VOW[id]){P.push('V:'+VOW[id]);continue}
    P.push(id);
  }
  const lastV=P.reduce((a,x,i)=>x==='V:ㅓ'?i:a,-1);
  if(/a$/.test(word)&&lastV===P.length-1&&lastV>=0)P[lastV]='V:ㅏ'; // 피자, 바나나처럼 끝 모음
  const fin=(s)=>JONG.indexOf(s);
  let out=[],on='ㅇ',glide='';
  const push=(c,v,ep)=>out.push({c:CHO.indexOf(c),v:typeof v==='number'?v:JUNG.indexOf(v),f:0,ep:!!ep});
  for(let i=0;i<P.length;i++){
    const x=P[i],nx=P[i+1]||'';
    if(x[0]==='V'){
      let v=x.slice(2);
      if(glide==='j')v=GLIDE_J[v]||v;
      if(glide==='w')v=GLIDE_W[v]||v;
      if(glide==='sh')v=GLIDE_J[v]||v;
      push(on,v);on='ㅇ';glide='';continue;
    }
    if(x==='j'){glide='j';continue}
    if(x==='w'){glide='w';continue}
    const nextV=nx[0]==='V'||nx==='j'||nx==='w';
    if(!nextV&&CODA[x]&&out.length&&!out[out.length-1].f&&!out[out.length-1].ep&&on==='ㅇ'&&!glide){
      out[out.length-1].f=fin(CODA[x]);continue;
    }
    if(x==='l'&&nextV&&out.length&&!out[out.length-1].f&&on==='ㅇ'){out[out.length-1].f=fin('ㄹ')}
    if(nextV){on=ONS[x]??'ㅇ';if(x==='ʃ'&&nx!=='j')glide='sh';if(on==='')on='ㅇ';continue}
    if(on!=='ㅇ'){push(on,'ㅡ',1);on='ㅇ'}
    const o=ONS[x];
    if(o&&x!=='ŋ')push(o,x==='ʃ'||x==='tʃ'||x==='dʒ'?'ㅣ':'ㅡ',1);
  }
  if(on!=='ㅇ')push(on,'ㅡ');
  return out.map(s=>syl(s.c,s.v<0?18:s.v,s.f)).join('');
}
const enCache={};
function en2ko(w){
  const lo=w.toLowerCase().replace(/'/g,'');
  if(EN[lo])return EN[lo];
  if(/^[A-Z]{2,6}$/.test(w)&&!/[AEIOU]/.test(w.slice(1,-1)+'')||(/^[A-Z]{2,4}$/.test(w)))return[...w].map(c=>LETTER[c]).join('');
  if(enCache[lo])return enCache[lo];
  if(!engine)return[...w.toUpperCase()].map(c=>LETTER[c]||'').join('');
  engine.set_voice('en');
  const ids=[];
  engine.synthesize(lo,(s,e)=>{for(const x of e)if(x.type==='phoneme')ids.push(x.id)});
  return enCache[lo]=ipa2ko(ids,lo)||[...w.toUpperCase()].map(c=>LETTER[c]||'').join('');
}
function toSpoken(text){
  let o='',skipped=0;
  for(const t of text.match(/[가-힣]+|[ㄱ-ㅎㅏ-ㅣ]+|[A-Za-z][A-Za-z']*|\d[\d,]*(?:\.\d+)?|[.,!?]+|[~…]+|\s+|[\s\S]/gu)||[]){
    if(/^[가-힣]/.test(t))o+=t;
    else if(/^[ㄱ-ㅎㅏ-ㅣ]/.test(t))o+=jamoWord(t);
    else if(/^[A-Za-z]/.test(t))o+=(/[가-힣]$/.test(o)?' ':'')+en2ko(t)+' ';
    else if(/^\d/.test(t))o+=number(t)+' ';
    else if(/^[.,!?]/.test(t))o+=t[0]+' ';
    else if(/^[~…]/.test(t))o+=', ';
    else if(/^\s/.test(t))o+=' ';
    else if(/\p{L}/u.test(t))skipped++;
    else o+=' ';
  }
  return{spoken:o.replace(/\s+/g,' ').trim(),skipped};
}


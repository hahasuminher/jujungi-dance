(async()=>{const J=u=>fetch(u).then(r=>r.json());
 const[char,poses,heads]=await Promise.all([J('data/char.json'),J('data/poses.json'),J('data/heads.json')]);
 window.CHAR=char;window.POSES=poses;window.HEADS=heads;
 for(const f of['vendor/espeak-ng.js','hangul.js','rig.js','voice.js','bgm.js','outfit.js','dance.js','app.js'])await new Promise((ok,no)=>{const s=document.createElement('script');s.src=f;s.onload=ok;s.onerror=()=>no(new Error(f));document.body.append(s)})
})().catch(e=>{console.error(e);document.getElementById('msg').textContent='불러오지 못했습니다. 새로고침해 주세요.'});

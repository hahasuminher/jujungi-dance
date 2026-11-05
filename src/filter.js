/* 광장 금칙어 검사. 욕설은 ★로 가린 문장을 함께 보내고, 듣는 사람이 삐 처리를 고른다 */
const SWEAR=['씨발','시발','씨팔','시팔','쓰발','ㅅㅂ','ㅆㅂ','존나','졸라','ㅈㄴ','좆','개새끼','새끼','병신','ㅄ','ㅂㅅ','지랄','ㅈㄹ','미친놈','미친년','꺼져','닥쳐','fuck','shit','bitch'];
const BLOCK=['섹스','쎅스','보지','자지','잠지','성기','자위','딸딸이','야동','강간','성폭행','따먹','꼴린다','젖꼭지','fuck you up','porn','sex',
 '장애인새끼','애자','한남','김치녀','맘충','틀딱','급식충','짱깨','쪽바리','흑형','깜둥이','nigger','faggot','죽여버린다','자살해'];
const PII=[/01[016789][- .]?\d{3,4}[- .]?\d{4}/,/\d{6}[- ]?[1-4]\d{6}/,/[\w.+-]+@[\w-]+\.[\w.]+/,/https?:\/\//i,/www\./i,/\d+동\s*\d+호/,/[가-힣]+(시|구|군)\s*[가-힣]+(로|길)\s*\d+/];
const squash=s=>s.toLowerCase().replace(/[\s\d.,!?~\-_*^'"`()\[\]{}<>…·]/g,'');
export function check(text){const t=text.normalize('NFC'),q=squash(t);
 for(const r of PII)if(r.test(t))return{ok:false,why:'개인정보나 링크는 광장에서 외칠 수 없어요.'};
 for(const w of BLOCK)if(q.includes(w))return{ok:false,why:'광장에서 쓸 수 없는 말이 들어 있어요.'};
 let masked=t;for(const w of SWEAR){const re=new RegExp(w.split('').map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[\\s.,!?~\\-_*]*'),'gi');masked=masked.replace(re,m=>'★'.repeat(Math.max(2,[...m.replace(/\s/g,'')].length)))}
 return{ok:true,text:t,masked}}

/* 음성 합성을 화면과 분리해, 외치는 동안 움직임이 멈추지 않게 한다 */
self.window=self;self.Audio=class{setAttribute(){}};
importScripts('vendor/espeak-ng.js','hangul.js','bgm.js','voice.js','sing.js');
let ready=false;
self.onmessage=e=>{const d=e.data;
 if(d.init){self.SPECIALS=d.init;bootVoice().then(()=>{ready=true;postMessage({ready:true})},x=>postMessage({fail:String(x)}));return}
 if(!ready)return postMessage({id:d.id,fail:'not ready'});
 try{const s=d.sing?singSong(d.sing.raw,d.sing.id,{...VOICE_DEFAULT,...d.sing.v},d.sing.orig):buildSpeech(d.raw,{...VOICE_DEFAULT,...d.v},{plain:d.plain});postMessage({id:d.id,s},s.pcm?[s.pcm.buffer]:[])}catch(x){postMessage({id:d.id,fail:String(x)})}};

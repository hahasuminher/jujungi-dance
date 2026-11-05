"""@echogarden/espeak-ng-emscripten 패키지를 브라우저용으로 줄인다.
사용: python3 tools/build_engine.py <패키지 폴더> site/vendor"""
import re,sys
root,out=sys.argv[1],sys.argv[2]
js=open(root+'/espeak-ng.js',encoding='utf8').read()
data=open(root+'/espeak-ng.data','rb').read()
m=re.search(r'loadPackage\(\{files:\[(.*?)\],remote_package_size:(\d+)\}\)',js,re.S)
KEEP=('ko_dict','en_dict','phondata','phonindex','phontab','intonations','lang/ko','lang/gmw/en','voices/!v/f1')
blob=b'';L=[]
for n,a,b in re.findall(r'\{filename:"([^"]+)",start:(\d+),end:(\d+)\}',m.group(1)):
    if n.replace('/usr/share/espeak-ng-data/','') in KEEP:
        s=len(blob);blob+=data[int(a):int(b)];L.append('{filename:"%s",start:%d,end:%d}'%(n,s,len(blob)))
js=js[:m.start()]+'loadPackage({files:[%s],remote_package_size:%d})'%(','.join(L),len(blob))+js[m.end():]
js=js.replace('import.meta.url','location.href').replace('export default Module;','window.ESPEAK=Module;')
js=js.replace('await import("module")','({createRequire(){}})')
open(out+'/espeak-ng.js','w',encoding='utf8').write(js)
open(out+'/espeak.data','wb').write(blob)
print(len(js),len(blob))

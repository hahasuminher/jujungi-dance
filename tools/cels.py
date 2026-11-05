import cv2,numpy as np,base64,json
from scipy import ndimage as ndi
A='/mnt/user-data/attachments/1302e558-f07c-5dae-8458-c8a97f774dbf/'
src={'A':'f1820684-image.jpg','F':'b46b932a-image.jpg','B':'2a4c8849-image.jpg','C':'58dbee8d-image.jpg','D':'60021901-image.jpg','E':'c9493462-image.jpg'}
out={}
for k,f in src.items():
    g=cv2.imread(A+f,0)
    ink=(g<170)
    fr,c=ndi.label(~ink)
    bg=fr==fr[0,0]
    if k=='F':
        sz=ndi.sum(~ink,fr,range(1,c+1));o=np.argsort(sz)[::-1]
        # 팔과 몸 사이 삼각형은 뚫린 공간
        hole=[i+1 for i in o[1:8] if abs(ndi.center_of_mass(fr==i+1)[1]-966)<130 and abs(ndi.center_of_mass(fr==i+1)[0]-929)<130];print('hole',hole,[int(sz[h-1]) for h in hole]);bg|=np.isin(fr,hole)
    bg=cv2.erode(bg.astype(np.uint8),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(3,3))).astype(bool)
    bgv=cv2.GaussianBlur((~bg).astype(np.float32)*255,(3,3),0)
    a=np.maximum(bgv,0).astype(np.uint8)
    rgba=np.dstack([g,g,g,a])
    ys,xs=np.where(~bg)
    print(k,xs.min(),xs.max(),ys.min(),ys.max())
    ok,b=cv2.imencode('.png',cv2.resize(rgba,(1181,1181),interpolation=cv2.INTER_AREA))
    out[k]='data:image/png;base64,'+base64.b64encode(b.tobytes()).decode()
    print(len(b)//1024,'KB')
json.dump(out,open('/tmp/claude-0/-home-claude/1302e558-f07c-5dae-8458-c8a97f774dbf/scratchpad/build/d4/cels.json','w'))

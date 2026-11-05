import cv2, numpy as np, json
from scipy import ndimage as ndi
img=cv2.imread('/mnt/user-data/attachments/1302e558-f07c-5dae-8458-c8a97f774dbf/f1820684-image.jpg',0)
ink=(img<140).astype(np.uint8)
free,k=ndi.label(ink==0)
def region(pt_label_size):
    pass
sizes=ndi.sum(ink==0,free,range(1,k+1)); order=np.argsort(sizes)[::-1]
bodyL,headL=order[1]+1,order[2]+1
ker=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7))
def loop(lbl):
    m=(free==lbl).astype(np.uint8)
    # fill holes (face features) then dilate to the middle of the ink line
    m=ndi.binary_fill_holes(m).astype(np.uint8)
    m=cv2.dilate(m,ker)
    c,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    c=max(c,key=len)[:,0,:].astype(float)
    return c
def resample(c,step):
    d=np.r_[0,np.cumsum(np.hypot(*np.diff(np.r_[c,c[:1]],axis=0).T))]
    n=int(d[-1]/step); s=np.linspace(0,d[-1],n,endpoint=False)
    cc=np.r_[c,c[:1]]
    x=np.interp(s,d,cc[:,0]);y=np.interp(s,d,cc[:,1])
    # very light smoothing keeps the hand wobble, drops pixel stairs
    def sm(a): return ndi.gaussian_filter1d(a,1.0,mode='wrap')
    return np.c_[sm(x),sm(y)]
body=resample(loop(bodyL),9); head=resample(loop(headL),9)
print(len(body),len(head))
# landmarks
b=body
cx=(b[:,0].min()+b[:,0].max())/2
i_hL=int(np.argmin(b[:,0])); i_hR=int(np.argmax(b[:,0]))
left=b[:,0]<cx; 
i_fL=int(np.where(left)[0][np.argmax(b[left,1])]); i_fR=int(np.where(~left)[0][np.argmax(b[~left,1])])
ci=cv2.UMat if False else None
pts=b.astype(np.int32).reshape(-1,1,2)
hull=cv2.convexHull(pts,returnPoints=False); hull=np.sort(hull,axis=0)[::-1]
de=cv2.convexityDefects(pts,hull).reshape(-1,4)
de=de[np.argsort(de[:,3])[::-1]][:6]
print([ (tuple(b[d[2]].round()),int(d[3]/256)) for d in de])
mid=b[:,1].mean()
cand=[d[2] for d in de]
# crotch: deepest with y greater than hands
crotch=[i for i in cand if b[i,1]>b[i_hL,1]+50][0]
pitL=[i for i in cand if b[i,1]<b[i_hL,1] and b[i,0]<cx][0]
pitR=[i for i in cand if b[i,1]<b[i_hL,1] and b[i,0]>cx][0]
print(dict(hL=b[i_hL],hR=b[i_hR],fL=b[i_fL],fR=b[i_fR],cr=b[crotch],pL=b[pitL],pR=b[pitR]))
# features
lab,n=ndi.label(ink,structure=np.ones((3,3)))
feats=[]
for l in range(1,n+1):
    m=(lab==l).astype(np.uint8)
    if m.sum()<100 or m.sum()>50000: continue
    c,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE)
    c=max(c,key=len)[:,0,:]
    c2=cv2.approxPolyDP(c.astype(np.int32),0.8,True)[:,0,:]
    ys,xs=np.where(m); feats.append(dict(cx=float(xs.mean()),cy=float(ys.mean()),a=int(m.sum()),pts=c2.tolist()))
for f in feats: print(round(f['cx']),round(f['cy']),f['a'],len(f['pts']))
json.dump(dict(body=b.round(1).tolist(),head=head.round(1).tolist(),feats=feats,
  lm=dict(hL=i_hL,hR=i_hR,fL=i_fL,fR=i_fR,cr=int(crotch),pL=int(pitL),pR=int(pitR))),open('trace.json','w'))

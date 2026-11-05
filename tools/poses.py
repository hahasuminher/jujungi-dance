import cv2,numpy as np,json
from scipy import ndimage as ndi
A='/mnt/user-data/attachments/1302e558-f07c-5dae-8458-c8a97f774dbf/'
src={'A':'f1820684-image.jpg','F':'b46b932a-image.jpg','B':'2a4c8849-image.jpg','C':'58dbee8d-image.jpg','D':'60021901-image.jpg','E':'c9493462-image.jpg'}
K=1.2226
t=json.load(open('../trace.json'));Ab=np.array(t['body']);lm=t['lm']
pa=lambda n:(Ab[lm[n]]).tolist()
disp=lambda x,y:[x*K,y*K]
LM={
 'A':[disp(965,620),pa('hL'),pa('pL'),pa('fL'),pa('cr'),pa('fR'),pa('pR'),pa('hR')],
 'C':[disp(975,590),pa('hL'),pa('pL'),pa('fL'),pa('cr'),pa('fR'),pa('pR'),pa('hR')],
 'D':[disp(965,440),pa('hL'),pa('pL'),pa('fL'),pa('cr'),pa('fR'),pa('pR'),pa('hR')],
 'B':[disp(965,1160),disp(660,725),disp(840,1210),disp(800,1675),disp(965,1530),disp(1125,1675),disp(1092,1210),disp(1267,725)],
 'E':[disp(960,610),disp(868,900),disp(880,1100),disp(945,1660),disp(962,1688),disp(985,1660),disp(1050,1100),disp(1062,900)],
 'F':[disp(690,1060),disp(1115,1660),disp(1092,1010),disp(1130,440),disp(998,620),disp(1020,205),disp(865,700),disp(640,700)],
}
SEG=[70,50,90,60,60,90,50,70];M=sum(SEG)
ker=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(7,7))
def regions(g):
    ink=(g<140);fr,c=ndi.label(~ink);sz=ndi.sum(~ink,fr,range(1,c+1));o=np.argsort(sz)[::-1];return ink,fr,o,sz
def loop(fr,lbl,fill=True):
    m=(fr==lbl).astype(np.uint8)
    if fill:m=ndi.binary_fill_holes(m).astype(np.uint8)
    m=cv2.dilate(m,ker)
    c,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);return max(c,key=len)[:,0,:].astype(float)
def resamp(pts,n):
    d=np.r_[0,np.cumsum(np.hypot(*np.diff(pts,axis=0).T))]
    s=np.linspace(0,d[-1],n,endpoint=False);return np.c_[np.interp(s,d,pts[:,0]),np.interp(s,d,pts[:,1])]
def seq(c,L):
    idx=[int(np.argmin(np.hypot(*(c-np.array(p)).T))) for p in L]
    errs=[float(np.min(np.hypot(*(c-np.array(p)).T))) for p in L]
    return idx,errs
out={};par={}
for k,f in src.items():
    g=cv2.imread(A+f,0);ink,fr,o,sz=regions(g)
    a,b=o[1]+1,o[2]+1
    ya,yb=[ndi.center_of_mass(fr==q)[0] for q in(a,b)]
    # 머리 영역은 약 13만 픽셀
    head=a if abs(sz[a-1]-125000)<abs(sz[b-1]-125000) else b;body=b if head==a else a
    if k=='F':
        spike=o[3]+1
        print('F regions',[(int(sz[o[i]]),[int(v) for v in ndi.center_of_mass(fr==o[i]+1)]) for i in range(1,6)])
        u=((fr==body)|(fr==spike)|ndi.binary_fill_holes(fr==head)).astype(np.uint8)
        u=cv2.dilate(u,ker);u=cv2.morphologyEx(u,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
        cs,_=cv2.findContours(u,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);c=max(cs,key=len)[:,0,:].astype(float)
    else:c=loop(fr,body)
    for rev in(False,True):
        cc=c[::-1] if rev else c
        idx,err=seq(cc,LM[k]);base=idx[0];off=[(i-base)%len(cc) for i in idx]
        if all(off[i]<off[i+1] for i in range(len(off)-1)):break
    else: print(k,'ORDER FAIL',off,[round(e) for e in err]);continue
    print(k,'ok',[round(e) for e in err],off[-1],len(cc))
    cc=np.roll(cc,-base,axis=0);off2=off+[len(cc)]
    arr=[];cl=np.r_[cc,cc[:1]]
    for i in range(8):arr.append(resamp(cl[off2[i]:off2[i+1]+1],SEG[i]))
    pts=np.vstack(arr)
    pts=ndi.gaussian_filter1d(pts,1.0,axis=0,mode='wrap')
    out[k]=pts.round(1).flatten().tolist()
    # 머리 위치와 각도
    q=(fr==head);hm=ndi.binary_fill_holes(q);cy,cx=ndi.center_of_mass(hm)
    lab,n=ndi.label(ink&hm,structure=np.ones((3,3)));comps=[(ndi.sum(lab==l),*ndi.center_of_mass(lab==l)) for l in range(1,n+1)]
    comps=[x for x in comps if 200<x[0]<3000];comps.sort()
    par[k]=dict(x=cx,y=cy,area=float(hm.sum()),comps=len(comps))
    if k!='E' and len(comps)>=3:
        e1,e2,lip=comps[0],comps[1],comps[2]
        mx,my=(e1[2]+e2[2])/2,(e1[1]+e2[1])/2
        par[k]['ang']=float(np.arctan2(-(lip[2]-mx),(lip[1]-my)))
    else:par[k]['ang']=0.0
print(par)
a=np.array(t['body']);d=np.r_[0,np.cumsum(np.hypot(*np.diff(np.r_[a,a[:1]],axis=0).T))]
# A 포즈의 M점이 원본 윤곽의 어느 위치인지(뼈대 포즈 변환용)
idx,_=seq(a,LM['A'])
json.dump(dict(poses=out,par=par,seg=SEG,M=M,aIdx=idx),open('poses.json','w'),separators=(',',':'))

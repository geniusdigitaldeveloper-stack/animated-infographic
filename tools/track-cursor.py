import subprocess, json, sys, numpy as np, cv2
src=sys.argv[1]; out=sys.argv[2]
W,H,FPS=1280,720,25
cmd=["ffmpeg","-v","error","-i",src,"-vf",f"fps={FPS},scale={W}:{H}","-f","rawvideo","-pix_fmt","bgr24","-"]
p=subprocess.Popen(cmd,stdout=subprocess.PIPE)
last=None; fs=W*H*3; i=0; track=[]; prev=None; diffs=[]
while True:
    b=p.stdout.read(fs)
    if len(b)<fs: break
    im=np.frombuffer(b,np.uint8).reshape(H,W,3)
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    m=cv2.inRange(hsv,(28,150,170),(48,255,255))
    m[H-60:,:]=0  # ignore taskbar icons
    n,lab,st,cen=cv2.connectedComponentsWithStats(m,connectivity=8)
    best=None
    for k in range(1,n):
        x,y,w,h,a=st[k]
        if 10<=a<=1400 and 4<=w<=44 and 6<=h<=56 and 0.9<=h/w<=2.6:
            # score: shape (arrow h/w~1.5, hand ~1.3) + continuity with previous position
            sc=abs(h/w-1.5)
            if last is not None and i-last[2]<=8:
                sc+=0.012*np.hypot(x-last[0],y-last[1])
            if best is None or sc<best[0]: best=(sc,x,y)
    if best is not None: last=(best[1],best[2],i)
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
    g=cv2.resize(g,(W//4,H//4))
    d=None if prev is None else cv2.absdiff(g,prev)
    # local diff around cursor stored as full diff map reduced for later
    track.append({"t":round(i/FPS,2),"x":None if best is None else int(best[1]),"y":None if best is None else int(best[2]),
        "gd": 0.0 if d is None else float(d.mean())})
    if d is not None and best is not None:
        cx,cy=best[1]//4,best[2]//4
        r=d[max(0,cy-40):cy+40,max(0,cx-40):cx+40]
        track[-1]["ld"]=float(r.mean())
    prev=g; i+=1
json.dump({"w":W,"h":H,"fps":FPS,"track":track},open(out,"w"))
f=sum(1 for t in track if t["x"] is not None); print("frames",len(track),"found",f)

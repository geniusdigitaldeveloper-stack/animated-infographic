import json, numpy as np
d=json.load(open('track.json')); T=d['track']; n=len(T); fps=d['fps']
xs=np.array([np.nan if t['x'] is None else t['x']+2 for t in T],float)
ys=np.array([np.nan if t['y'] is None else t['y']+2 for t in T],float)
idx=np.arange(n); ok=~np.isnan(xs)
xi=np.interp(idx,idx[ok],xs[ok]); yi=np.interp(idx,idx[ok],ys[ok])
# smooth
k=np.ones(3)/3; xi=np.convolve(np.pad(xi,1,'edge'),k,'valid'); yi=np.convolve(np.pad(yi,1,'edge'),k,'valid')
gd=np.array([t['gd'] for t in T]); ld=np.array([t.get('ld',0) for t in T])
sp=np.hypot(np.diff(xi,prepend=xi[0]),np.diff(yi,prepend=yi[0]))
clicks=[]; i=3
while i<n-6:
    moved=sp[i-3:i].sum()>25
    still=sp[i:i+2].sum()<4
    if ok[max(0,i-1):i+2].any() and moved and still:
        base=ld[max(0,i-6):i].mean() if i>6 else 0
        post=ld[i+1:i+6].max()
        if post>max(1.2,base*2.2):
            clicks.append({"t":round(i/fps,1),"x":int(xi[i]),"y":int(yi[i]),"ld":round(float(post),1)})
            i+=8; continue
    i+=1
json.dump({"x":[round(float(v),1) for v in xi],"y":[round(float(v),1) for v in yi],"found":[bool(o) for o in ok],"clicks":clicks,"fps":fps,"w":d['w'],"h":d['h']},open('cursor.json','w'))
print(len(clicks)); print(' '.join(f"{c['t']}" for c in clicks))

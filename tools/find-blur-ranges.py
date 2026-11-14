"""Find time ranges where a UI panel (template crop) is visible, to blur it.
Usage: python3 tools/find-blur-ranges.py video.mp4 template.png x y t0 t1  -> prints [(start,end), ...] (source seconds, 1280x720 space)
The template is a 1280x720-space crop of the panel; x,y = its top-left. Output goes into src/tutorial/blur.json (regions[].ranges).
"""
import sys, subprocess, numpy as np, cv2
vid, tpl, X, Y, t0, t1 = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
t = cv2.imread(tpl, 0); h, w = t.shape
raw = subprocess.run(["ffmpeg","-v","error","-ss",str(t0),"-t",str(t1-t0),"-i",vid,"-vf","fps=10,scale=1280:720,format=gray","-f","rawvideo","-"],capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8)[:len(raw)//(1280*720)*1280*720].reshape(-1, 720, 1280)
def ncc(a, b):
    a = a.astype(np.float32); b = b.astype(np.float32); a -= a.mean(); b -= b.mean()
    return float((a*b).sum() / (np.sqrt((a*a).sum()*(b*b).sum()) + 1e-6))
ok = [ncc(f[Y:Y+h, X:X+w], t) > 0.85 for f in fr]; rng = []; s = None
for i, v in enumerate(ok + [False]):
    if v and s is None: s = i
    if not v and s is not None:
        if i - s >= 3: rng.append((round(t0 + s/10, 1), round(t0 + i/10, 1)))
        s = None
print(rng)

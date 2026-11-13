"""Snap each click/dwell to the CENTRE of the UI button under the cursor.
Usage: python3 tools/snap-buttons.py video.mp4 plan.json [debug_dir]
For every click/dwell (src time + cursor tip in 1280x720 space) it grabs a full-res frame, flood-fills from seeds
around the tip and keeps the plausible button-sized region that contains the tip. Writes bx,by,bw,bh (1280-space,
centre + size) into the plan; if no button-like region is found, bx,by = cursor tip (snap=false).
"""
import sys, json, subprocess, os, numpy as np, cv2
vid, planf = sys.argv[1], sys.argv[2]; dbg = sys.argv[3] if len(sys.argv) > 3 else None
plan = json.load(open(planf)); SC = 2.0  # 2560 / 1280
if dbg: os.makedirs(dbg, exist_ok=True)
def frame(ts):
    p = subprocess.run(['ffmpeg','-v','error','-ss',f'{ts:.3f}','-i',vid,'-frames:v','1','-f','image2pipe','-vcodec','png','-'],capture_output=True)
    return cv2.imdecode(np.frombuffer(p.stdout,np.uint8),cv2.IMREAD_COLOR)
def change(ts, cx, cy):
    a, b = frame(max(0, ts - 0.30)), frame(ts + 0.55)
    if a is None or b is None: return 0, 0
    ga, gb = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY), cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
    d = cv2.absdiff(ga, gb); x0, y0 = max(0, cx-220), max(0, cy-140)
    return float(d[y0:cy+140, x0:cx+220].mean()), float(cv2.resize(d, (320, 180)).mean())
def find(img, tx, ty):
    H, W = img.shape[:2]; R = 300
    x0, y0 = max(0, tx-R), max(0, ty-R//2); x1, y1 = min(W, tx+R), min(H, ty+R//2)
    crop = cv2.GaussianBlur(img[y0:y1, x0:x1], (3,3), 0); px, py = tx-x0, ty-y0
    best = None
    for dx in range(-30, 31, 10):
        for dy in range(-12, 41, 8):
            sx, sy = px+dx, py+dy
            if not (1 <= sx < crop.shape[1]-1 and 1 <= sy < crop.shape[0]-1): continue
            mask = np.zeros((crop.shape[0]+2, crop.shape[1]+2), np.uint8)
            _, _, _, rect = cv2.floodFill(crop.copy(), mask, (sx, sy), 0, (10,10,10), (10,10,10), cv2.FLOODFILL_MASK_ONLY | (255 << 8) | 4)
            rx, ry, rw, rh = rect
            area = int(mask[1:-1,1:-1].sum() // 255)
            if not (rx-3 <= px <= rx+rw+3 and ry-3 <= py <= ry+rh+3): continue
            if not (26 <= rw <= 560 and 20 <= rh <= 150): continue
            if area < 0.35*rw*rh: continue
            if best is None or area > best[0]: best = (area, rx+x0, ry+y0, rw, rh)
    return best
res = 0
for kind in ('clicks', 'dwells'):
    for k in plan[kind]:
        ts = k.get('src'); 
        if ts is None: continue
        img = frame(ts + 0.04)
        if img is None: continue
        tx, ty = int(k['x']*SC), int(k['y']*SC)
        b = find(img, tx, ty)
        k['loc'], k['glob'] = [round(v, 2) for v in change(ts, tx, ty)]
        if b:
            _, bx, by, bw, bh = b
            k.update({"bx": (bx+bw/2)/SC, "by": (by+bh/2)/SC, "bw": bw/SC, "bh": bh/SC, "snap": True}); res += 1
        else:
            k.update({"bx": k['x'], "by": k['y'], "bw": 0, "bh": 0, "snap": False})
        if dbg:
            vis = img.copy()
            cv2.circle(vis, (int(k['bx']*SC), int(k['by']*SC)), 34, (0,0,255), 3)
            cv2.circle(vis, (tx, ty), 5, (0,255,0), -1)
            x0, y0 = max(0, int(k['bx']*SC)-260), max(0, int(k['by']*SC)-120)
            cv2.imwrite(f"{dbg}/{kind[0]}_{ts:07.2f}.jpg", vis[y0:y0+240, x0:x0+520])
json.dump(plan, open(planf, 'w'), ensure_ascii=False, indent=1)
print("snapped", res, "of", len(plan['clicks'])+len(plan['dwells']))

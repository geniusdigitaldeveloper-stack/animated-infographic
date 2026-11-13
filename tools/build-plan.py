"""Build the edit plan (EDL + subtitles + steps + clicks) for a screen-recording tutorial.
Usage: python3 tools/build-plan.py whisper.json cursor.json subs.json out/plan.json
subs.json = [{"s":src_start,"e":src_end,"t":"cleaned text with [[hook]] / {{hook red}}"}, ...]  (hand-cleaned from Whisper)
"""
import json, re, sys, numpy as np
wh, cur, subs_f, out = sys.argv[1:5]
W = json.load(open(wh)); C = json.load(open(cur)); subs = json.load(open(subs_f))
FPS_OUT = 30
words = [w for s in W['segments'] for w in s['words']]
PAD0, PAD1 = 0.10, 0.20
clips = []; t_out = 0.0
def add(src0, src1, rate, kind):
    global t_out
    d = (src1 - src0) / rate
    clips.append({"src0": round(src0,3), "src1": round(src1,3), "rate": round(rate,3), "out0": round(t_out,3), "out1": round(t_out+d,3), "kind": kind})
    t_out += d
subs_out = []
prev_end = 0.0
for i, s in enumerate(subs):
    a = max(prev_end, s['s'] - PAD0); b = s['e'] + PAD1
    if i + 1 < len(subs): b = min(b, subs[i+1]['s'] - 0.02)
    gap = a - prev_end
    if gap > 0.05:
        if gap <= 0.4: a = prev_end
        else: add(prev_end, a, max(2.0, gap/1.5), 'gap')
    o0 = t_out + (s['s'] - a)
    add(a, b, 1.0, 'speech')
    subs_out.append({"out0": round(o0,3), "out1": round(t_out - (b - s['e']) + 0.15,3), "text": s['t']})
    prev_end = b
def src2out(ts):
    for c in clips:
        if c['src0'] <= ts <= c['src1']: return c['out0'] + (ts - c['src0'])/c['rate']
    return None
# clicks: keyword times from whisper + dwell snapping
x = np.array(C['x']); y = np.array(C['y']); fps = C['fps']; FOUND = np.array(C['found'])
def seen(j, w=0.25):
    a = max(0, int(j - w*fps)); return FOUND[a:int(j + w*fps) + 1].any()
sp = np.hypot(np.diff(x, prepend=x[0]), np.diff(y, prepend=y[0])); R = max(1, round(fps/10))
pat = re.compile(r'klik|tekan|salin|inter|run|install|finish|next|pilih|buka', re.I)
cand = [w['end'] for w in words if pat.search(w['word']) and not re.search(r'suka', w['word'])]
vis = [c['t'] for c in C['clicks']]
allc = sorted(cand + vis); merged = []
for t in allc:
    if merged and t - merged[-1] < 0.9: continue
    merged.append(t)
clicks = []
for t in merged:
    i0 = int(t*fps); win = range(i0, min(len(x)-1, i0 + int(0.8*fps)))
    if not len(win): continue
    j = min(win, key=lambda k: sp[k]); ts = j / fps
    if not seen(j): continue  # cursor not actually detected here -> no ring (never guess)
    o = src2out(ts)
    if o is not None: clicks.append({"out": round(o,3), "x": float(x[j]), "y": float(y[j]), "src": round(ts,2)})
dwells = []
last = -9
for i in range(4*R, len(x)-2*R):
    if sp[i-4*R:i].sum() > 60 and sp[i:i+2*R].sum() < 3 and i/fps - last > 1.2 and seen(i):
        o = src2out(i/fps)
        if o is not None: dwells.append({"src": round(i/fps,2), "out": round(o,3), "x": float(x[i]), "y": float(y[i])}); last = i/fps
steps_src = [(13.8,"Semak e-mel pembelian"),(26.2,"Pilih Muat Turun / Akses"),(45.2,"Buka Panduan & Muat Turun"),(68.4,"Salin pautan muat turun"),
 (73.1,"Tampal di Chrome → Enter"),(90.5,"Buka fail yang dimuat turun"),(105.4,"More info → Run anyway"),(126.5,"Pilih PC / laptop → Next"),
 (130.6,"Pilih lokasi → Install → Finish"),(153.6,"Masukkan Stream Key"),(177.5,"Mode Formal: slide PDF")]
steps = []
for n, (ts, lab) in enumerate(steps_src, 1):
    o = src2out(ts)
    if o is not None: steps.append({"out0": round(o,3), "out1": round(o+3.6,3), "num": n, "label": lab})
HOOK = {"src0": 111.4, "src1": 114.4, "t": "{{Jangan risau}}, [[bukan virus!]] Cara betul download & setup."}
plan = {"fps": FPS_OUT, "duration": round(t_out,3), "clips": clips, "subs": subs_out, "steps": steps, "clicks": clicks, "dwells": dwells, "hook": HOOK}
json.dump(plan, open(out, 'w'), ensure_ascii=False, indent=1)
print("dwells", len(dwells)); print("duration", plan['duration'], "clips", len(clips), "clicks", len(clicks), "steps", len(steps))

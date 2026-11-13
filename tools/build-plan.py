"""Build the edit plan (EDL + subtitles + steps + clicks) for a screen-recording tutorial.
Usage: python3 tools/build-plan.py whisper.json cursor.json subs.json out/plan.json [audio16k.wav]
With audio16k.wav every subtitle word is locked to the REAL voice onset (Whisper word starts run ~0.13s late), so text appears exactly when spoken.
subs.json = [{"s":src_start,"e":src_end,"t":"cleaned text with [[hook]] / {{hook red}}"}, ...]  (hand-cleaned from Whisper)
"""
import json, re, sys, numpy as np
wh, cur, subs_f, out = sys.argv[1:5]; AUD = sys.argv[5] if len(sys.argv) > 5 else None
W = json.load(open(wh)); C = json.load(open(cur)); subs = json.load(open(subs_f))
FPS_OUT = 30
words = [w for s in W['segments'] for w in s['words']]
PAD0, PAD1 = 0.32, 0.20
# --- voice onsets (silence -> voice edges) from real audio
ONS = []
if AUD:
    a16 = np.frombuffer(open(AUD, 'rb').read()[44:], dtype=np.int16).astype(np.float32) / 32768
    hop = 160; nfr = len(a16) // hop
    db = 20*np.log10(np.sqrt((a16[:nfr*hop].reshape(nfr, hop)**2).mean(1)) + 1e-5)
    vc = db > (np.percentile(db, 15) + 14)
    ONS = [j/100 for j in range(1, nfr-1) if vc[j] and not vc[j-1] and vc[j+1]]
def onset(t):
    c = [o for o in ONS if t - 0.35 <= o <= t + 0.05]
    return (min(c, key=lambda o: abs(o - (t - 0.13)))) if c else t - 0.10
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
    add(a, b, 1.0, 'speech'); c = clips[-1]
    o_of = lambda ts: c['out0'] + (ts - c['src0'])
    ww = [w for w in words if w['start'] >= s['s'] - 0.08 and w['end'] <= s['e'] + 0.15]
    toks = s['t'].split()
    clean = [re.sub(r'\[\[|\]\]|\{\{|\}\}|\*', '', k) for k in toks]
    wl = [max(1, len(re.sub(r'\W', '', k))) for k in clean]
    if ww:
        st = [max(a, onset(w['start'])) for w in ww]; en = [w['end'] for w in ww]
        cw = np.cumsum([0] + [max(1, len(w['word'].strip())) for w in ww]); cw = cw / cw[-1]
        cc = np.cumsum([0] + wl); fr_ = cc / cc[-1]
        starts = [float(np.interp(fr_[k], cw[:-1], st)) for k in range(len(clean))]
        last_end = en[-1]
    else:
        n = len(clean); starts = [s['s'] + (s['e'] - s['s']) * k / n for k in range(n)]; last_end = s['e']
    starts = [min(max(v, a), b - 0.05) for v in starts]
    for k in range(1, len(starts)): starts[k] = max(starts[k], starts[k-1] + 0.04)
    o0 = o_of(starts[0] - 0.05)
    ends = starts[1:] + [last_end]
    wout = [{"text": clean[k], "start": round(o_of(starts[k]) - o0, 3), "end": round(max(o_of(ends[k]) - o0, o_of(starts[k]) - o0 + 0.1), 3)} for k in range(len(clean))]
    out1 = o_of(min(b, max(last_end, starts[-1]) + 0.25))
    subs_out.append({"out0": round(o0, 3), "out1": round(out1, 3), "text": s['t'], "words": wout})
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
plan = {"fps": FPS_OUT, "duration": round(t_out,3), "clips": clips, "subs": subs_out, "steps": steps, "clicks": clicks, "dwells": dwells}
json.dump(plan, open(out, 'w'), ensure_ascii=False, indent=1)
print("dwells", len(dwells)); print("duration", plan['duration'], "clips", len(clips), "clicks", len(clicks), "steps", len(steps))

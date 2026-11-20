"""Build the 'rahmah' reel (hadis & ayat, maksud + huraian) audio + word timings from the owner's VO.
Usage: python3 -I scripts/rahmah/build_audio.py raw/vo.m4a <whisper.json>
Outputs: public/rahmah/{vo,music}.mp3, public/rahmah/sfx-*.wav, src/scenes/rahmah-words.json
"""
import json, subprocess, sys, wave, os
import numpy as np

SR = 48000
SRC, WJSON = sys.argv[1], sys.argv[2]
OUT = 'public/rahmah'
os.makedirs(OUT, exist_ok=True)

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def write(path, x, mp3=False):
    x = np.clip(x, -1, 1)
    tmp = path if not mp3 else path + '.wav'
    with wave.open(tmp, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())
    if mp3:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-b:a', '128k', path], check=True)
        os.remove(tmp)

# ---------- 1. cut the VO ----------
# One scene = one source range. Ranges skip the Arabic recitation, "Sidang Jumaat" asides and a stumble.
SCENES = [
    ('ayat',    [(33.05, 43.95)]),    # maksud At-Tahrim:6 (Arabic recitation and "Yang bermaksud" skipped)
    ('hadis',   [(61.85, 73.70)]),    # Sunan Tirmizi + short Arabic of the hadith
    ('maksud',  [(73.78, 79.95)]),
    ('huraian', [(80.95, 86.75)]),
    ('rahmah',  [(88.00, 95.35)]),
    ('prinsip', [(95.45, 100.65)]),
    ('penutup', [(100.65, 110.65)]),
]
# whisper → what was actually said (checked by re-listening to each clip); list = split one token into several
FIX = {'peliharlah': 'peliharalah', 'bersadar': 'bersabda,', 'Leisa': 'Laisa', 'mallam': ['man', 'lam'], 'sagirana': 'saghirana.',
       'hari': 'Hadis', 'sini': 'ini', 'perekasi': ['pilih', 'kasih'], 'matian': 'makian.', 'R.': 'r.a.', 'Anhu': None,
       'dibimbing': 'dibimbing.'}
KEY = {'beriman', 'peliharalah', 'keluarga', 'neraka', 'Laisa', 'minna', 'man', 'lam', 'yarham', 'saghirana', 'golongan',
       'menyayangi', 'rahmah', 'akhlak', 'kelemahan', 'kekuatan', 'lembut', 'ketegasan', 'adil', 'kekerasan', 'dibimbing',
       'kemarahan', 'marwahnya', 'makian'}
MAX_GAP, KEEP_GAP, SCENE_GAP, TAIL = 0.30, 0.20, 0.40, 3.0

raw = json.load(open(WJSON))  # flat list [{w,s,e}] (per-clip re-transcription)
words = []
for w in raw:
    t = w['w'].strip()
    if t.startswith('-') and words:  # "kanak" "-kanak" -> "kanak-kanak"
        words[-1]['w'] += t; words[-1]['e'] = w['e']; continue
    f = FIX.get(t, t)
    if f is None:  # spoken but merged into the previous token (e.g. "r.a.")
        words[-1]['e'] = w['e']; continue
    if isinstance(f, list):
        step = (w['e'] - w['s']) / len(f)
        for i, x in enumerate(f): words.append({'w': x, 's': round(w['s'] + i * step, 3), 'e': round(w['s'] + (i + 1) * step, 3)})
        continue
    words.append({'w': f, 's': w['s'], 'e': w['e']})

# words the chunked pass missed but the full-file pass heard (first pass: "Dalam Sunan Tirmizi", "orang-orang yang beriman")
words.append({'w': 'Dalam', 's': 61.90, 'e': 62.10})
for i, w in enumerate(words):
    if w['w'] == 'beriman' and words[i - 1]['w'] == 'orang-orang':
        words.insert(i, {'w': 'yang', 's': w['s'], 'e': w['s'] + 0.18}); w['s'] += 0.18; break
words.sort(key=lambda w: w['s'])

vo = load(SRC)
fade = int(0.008 * SR)
pieces, out_words, scenes, cur = [], [], [], 0.0

def take(a, b):
    x = vo[int(a * SR):int(b * SR)].copy()
    x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    return x

# energy envelope (10 ms) -> silence runs longer than MAX_GAP are shrunk to KEEP_GAP
HOP = int(0.01 * SR)
db = 20 * np.log10(np.sqrt(np.add.reduceat(vo ** 2, np.arange(0, len(vo), HOP)) / HOP) + 1e-7)
THR = np.percentile(db, 12) + 12

def speech_pieces(a, b):
    fa, fb = int(a / 0.01), int(b / 0.01)
    quiet = db[fa:fb] < THR
    out, start, i = [], a, 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if (j - i) * 0.01 > MAX_GAP and i > 0 and j < len(quiet):
                out.append((start, a + i * 0.01 + KEEP_GAP / 2)); start = a + j * 0.01 - KEEP_GAP / 2
            i = j
        else: i += 1
    out.append((start, b))
    return out

for si, (sid, ranges) in enumerate(SCENES):
    if si: pieces.append(np.zeros(int(SCENE_GAP * SR))); cur += SCENE_GAP
    sc_start = cur
    for (a, b) in ranges:
        for (pa, pb) in speech_pieces(a, b):
            for w in words:
                if pa - 0.2 <= w['s'] < pb - 0.03 and not any(o['src'] == w['s'] for o in out_words):
                    t = w['w']
                    out_words.append({'text': t, 'key': t.strip('.,?!') in KEY, 'start': round(cur + max(0, w['s'] - pa), 3),
                                      'end': round(cur + min(pb, w['e']) - pa, 3), 'scene': sid, 'src': w['s']})
            pieces.append(take(pa, pb)); cur += pb - pa
    scenes.append({'id': sid, 'start': round(sc_start, 3)})

for s, n in zip(scenes, scenes[1:] + [None]):
    s['end'] = round(n['start'] if n else cur + TAIL, 3)
# "isu ini": whisper heard one word; keep the owner's words readable
voc = np.concatenate(pieces)
total = len(voc) / SR + TAIL
write(f'{OUT}/vo.wav', voc)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{OUT}/vo.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                '-ar', str(SR), '-b:a', '128k', f'{OUT}/vo.mp3'], check=True)
os.remove(f'{OUT}/vo.wav')
for i, w in enumerate(out_words):
    w.pop('src', None)
    nxt = out_words[i + 1] if i + 1 < len(out_words) else None
    if (not nxt or nxt['scene'] != w['scene']) and w['text'][-1] not in '.,?!': w['text'] += '.'  # scene ends a sentence
    prev = out_words[i - 1] if i else None
    if not prev or prev['scene'] != w['scene'] or (prev['text'].endswith('.') and prev['text'] != 'r.a.'):
        w['text'] = w['text'][0].upper() + w['text'][1:]
json.dump({'total': round(total, 3), 'voEnd': round(len(voc) / SR, 3), 'scenes': scenes, 'words': out_words},
          open('src/scenes/rahmah-words.json', 'w'), ensure_ascii=False, indent=1)
print(f'VO {len(voc)/SR:.2f}s  total {total:.2f}s')
for s in scenes: print(s)

# ---------- 2. SFX (synthesised, no third-party samples) ----------
rng = np.random.default_rng(7)
T = lambda d: np.arange(int(d * SR)) / SR

def pop():
    t = T(0.16); f = 300 + 700 * np.exp(-t * 38)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    x[:200] += rng.normal(0, 0.3, 200) * np.linspace(1, 0, 200)
    return x * 0.8

def tick():
    t = T(0.025)
    return (np.sin(2 * np.pi * 2600 * t) * 0.6 + rng.normal(0, 0.25, len(t))) * np.exp(-t * 260)

def ticks(d=0.75, n=16):
    x = np.zeros(int(d * SR))
    for i in range(n):
        p = int((1 - (1 - i / n) ** 1.6) * (d - 0.03) * SR)  # accelerating then settling
        k = tick() * (0.6 + 0.4 * i / n); x[p:p + len(k)] += k[:len(x) - p]
    return x * 0.8

def whoosh(d=0.55):
    t = T(d); n = rng.normal(0, 1, len(t))
    env = np.sin(np.pi * (t / d) ** 0.7) ** 2
    out, y, cut = np.zeros_like(n), 0.0, 0.02 + 0.18 * np.sin(np.pi * t / d)  # sweeping one-pole lowpass
    for i in range(len(n)):
        y += cut[i] * (n[i] - y); out[i] = y
    return out / np.abs(out).max() * env * 0.7

def hmm(d=0.75):
    t = T(d); f0 = 150 + 18 * np.sin(np.pi * t / d)  # gentle rise-fall, like a soft "hmm"
    ph = 2 * np.pi * np.cumsum(f0) / SR
    x = sum(np.sin(k * ph) / k ** 1.8 for k in range(1, 7))
    env = np.minimum(1, t / 0.12) * np.minimum(1, (d - t) / 0.25)
    return x / np.abs(x).max() * env * 0.45

def chime(d=2.4):  # signature: soft bell
    t = T(d); x = np.zeros_like(t)
    for f, a, dec in [(880, 1, 2.2), (1760 * 1.003, .45, 3.2), (2427, .3, 4.5), (4752, .12, 7), (1318.5, .5, 2.6)]:
        x += a * np.sin(2 * np.pi * f * t) * np.exp(-t * dec)
    x *= np.minimum(1, t / 0.004)
    return x / np.abs(x).max() * 0.6

for name, x in [('pop', pop()), ('tick', ticks()), ('whoosh', whoosh()), ('hmm', hmm()), ('signature', chime())]:
    write(f'{OUT}/sfx-{name}.wav', x)

# ---------- 3. ambient music (soft pad, original) ----------
d = total + 1
t = T(d)
chords = [[146.83, 220.0, 277.18, 329.63], [123.47, 185.0, 220.0, 293.66],
          [98.0, 196.0, 246.94, 293.66], [110.0, 164.81, 220.0, 277.18]]  # Dmaj7 Bm7 Gmaj Asus-ish
bar = 8.0
m = np.zeros_like(t)
for i in range(int(d // bar) + 1):
    c = chords[i % 4]; a0 = i * bar - 1.5
    seg = (t >= a0) & (t < a0 + bar + 3)
    tt = t[seg] - a0
    env = np.minimum(1, tt / 2.5) * np.minimum(1, np.maximum(0, (bar + 3 - tt) / 3))
    for j, f in enumerate(c):
        for det in (-0.6, 0.6):
            m[seg] += np.sin(2 * np.pi * (f + det) * tt + j) * env * (0.5 if j == 0 else 0.3)
m += 0.15 * np.sin(2 * np.pi * 73.42 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 16))  # low drone
# simple reverb: a few decaying echoes
for dl, g in [(0.11, .35), (0.23, .25), (0.37, .18), (0.53, .12)]:
    k = int(dl * SR); m[k:] += g * m[:-k]
m *= np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2.5)
write(f'{OUT}/music.mp3', m / np.abs(m).max() * 0.8, mp3=True)
print('ok')

import sys, json
from faster_whisper import WhisperModel
import numpy as np
wav, out = sys.argv[1], sys.argv[2]
raw = open(wav,"rb").read()[44:]
audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32)/32768.0
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = m.transcribe(audio, word_timestamps=True, vad_filter=True, language=None, initial_prompt="Tutorial BM campur English: download dan setup aplikasi Global Streamer.")
res = {"language": info.language, "segments": []}
for s in segs:
    res["segments"].append({"start": s.start, "end": s.end, "text": s.text.strip(),
        "words": [{"word": w.word, "start": w.start, "end": w.end} for w in (s.words or [])]})
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
print(info.language, len(res["segments"]))

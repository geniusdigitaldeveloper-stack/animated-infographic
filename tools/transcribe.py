import sys, json, numpy as np
from faster_whisper import WhisperModel
model, out = sys.argv[1], sys.argv[2]
raw = open(sys.argv[3],"rb").read()[44:]
audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32)/32768.0
m = WhisperModel(model, device="cpu", compute_type="int8", cpu_threads=4)
segs, info = m.transcribe(audio, language="ms", beam_size=5, word_timestamps=True, vad_filter=True, condition_on_previous_text=False,
  initial_prompt="Tutorial cara muat turun dan setup aplikasi Global Streamer. Chrome, Enter, Show in folder, Open, More info, Run anyway, Next, Install, Finish, Stream Key, Facebook, Mobile Legends, PDF, PowerPoint, download, paste, link.")
res = {"language": info.language, "segments": []}
for s in segs:
    res["segments"].append({"start": s.start, "end": s.end, "text": s.text.strip(),
        "words": [{"word": w.word, "start": w.start, "end": w.end} for w in (s.words or [])]})
json.dump(res, open(out,"w"), ensure_ascii=False, indent=1); print("done", len(res["segments"]))

---
name: reel-edit-workflow
description: Workflow edit reel dengan Claude Code — folder raw/references/done, 5 tool (Remotion, HyperFrames, FFmpeg, faster-whisper, yt-dlp) dan 3 prompt (tools, taste, edit). Guna bila pengguna mahu setup atau mengedit video mentah menjadi reel.
---

# Reel edit workflow

Panggil pengguna **Ustaz**. Tiada coding manual — semuanya melalui 3 prompt di dalam Claude app → tab **Code** → **Local** → folder `AI Editor`.

## Setup (≈1 minit)
1. Muat turun Claude app, buka tab **Code** (bukan browser — browser tak nampak fail).
2. Environment **Local**, pilih folder `~/Desktop/AI Editor` dengan subfolder `raw/`, `references/`, `done/`.

## 5 tool
| Tool | Fungsi |
|---|---|
| Remotion | bina video dengan kod (React) |
| HyperFrames | grafik/animasi |
| FFmpeg (+libass) | potong & export |
| faster-whisper | sari kata word-level |
| yt-dlp | muat turun reel rujukan |

## Prompt 1 — tools
```
You're my video editor. We work in this folder: raw, references, done.
Install and verify 5 tools: FFmpeg with libass, faster-whisper, yt-dlp, Remotion, HyperFrames.
Check what's installed first. Test each for real. Show a table: tool, version, works or not.
```

## Prompt 2 — taste (baris paling penting: "Take inspiration, but don't copy.")
```
Here are reels whose editing I like:
[link 1] [link 2] [link 3]
Download them with yt-dlp into references. Study each frame by frame and by ear:
pacing, subtitles, colors, music, first 3 seconds.
Take inspiration, but don't copy. Write my own style to style.md.
```
Pilih 3–5 reel; baris "don't copy" yang menjadikan video unik.

## Prompt 3 — edit
```
My new recording is in raw. Edit it using style.md.
Cut the pauses, add word-by-word subtitles, lay quiet music under the voice, save to done as draft-v1.mp4.
```
Tak suka sesuatu? Cakap biasa: "make the hook bigger" → `draft-v2`. Tiada istilah kod.

## Aliran Claude
Potong jeda (cth. 17 pauses cut) → subtitle (Whisper) → muzik perlahan → draft untuk semakan → iterasi dalam bahasa biasa.

## Pautan ke repo ini
Hasilkan grafik/subtitle ikut `infographic-reel-style`: edit `src/scenes/script.tsx`, letak face cam di `public/`, render dengan `npm run render`.

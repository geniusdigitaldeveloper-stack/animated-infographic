# animated-infographic

Reel 9:16 gaya **motion-graphics explainer**: talking head + kad infografik beranimasi, latar hitam, aksen kuning, subtitle serif perkataan-demi-perkataan. Dibina dengan [Remotion](https://remotion.dev).

**Preview (Remotion Studio):** https://geniusdigitaldeveloper-stack.github.io/animated-infographic/

## Mula
```bash
npm install
npm run dev        # Remotion Studio
npm run render     # out/explainer.mp4
```
Letak rakaman muka sendiri di `public/face.mp4` dan render dengan props `{"faceSrc":"face.mp4"}`.

**Saiz frame boleh dilaras**: `--props='{"width":1920,"height":1080}'` atau `npm run render:reel | render:landscape | render:square | render:portrait`. Mana-mana width/height berfungsi.

## Apa ada di dalam
- `src/theme.ts` – warna, layout, saiz (satu aksen kuning)
- `src/fonts.ts` – Instrument Serif (subtitle), Inter (UI), JetBrains Mono (prompt)
- `src/components/` – `Caption` (subtitle), `Frame` (layout, pil bab, kotak muka), `Graphics` (checkout, timer, app, senarai tool, prompt, waveform, checklist, follow)
- `src/scenes/script.tsx` – kandungan reel (satu scene = satu idea = satu visual)
- `scripts/whisper-to-captions.mjs` – Whisper word-timestamps → subtitle tepat
- `.claude/skills/infographic-reel-style` – panduan gaya visual, font, subtitle, skrip
- `.claude/skills/reel-edit-workflow` – 5 tool + 3 prompt (tools → taste → edit)
- `CLAUDE.md` – peraturan projek (panggil pemilik **Ustaz**, Bahasa Melayu)

## Deploy
Push ke `main` → GitHub Actions bina `remotion bundle` dan terbitkan ke GitHub Pages.

## Tutorial skrin (komposisi `Tutorial`)
Video rekod skrin 16:9 1920×1080: jejak kursor, ring + efek klik merah, zoom hook, buang jeda / 2x, callout langkah di bawah frame, subtitle dengan teks hook kuning butter / merah cerah, latar cerah beranimasi, logo kiri (pop setiap 100s) dan outro iOS. Lihat `.claude/skills/screen-tutorial-style`.
Alat: `tools/build-plan.py`, `tools/make-audio.py`. Kata hook dalam subtitle: `[[butter]]`, `{{merah}}`.

### Gaya subtitle (Ustaz)
Pil kaca setiap perkataan (Liquid Glass iOS, overlay hitam pudar) · kaca penyerlah meluncur antara perkataan · animasi spring lancar macam iPhone · hook kuning butter `[[…]]` / merah cerah `{{…}}`. Parameter: `captionStyle` (`src/theme.ts`).

# animated-infographic

Reel 9:16 gaya **motion-graphics explainer**: talking head + kad infografik beranimasi, latar hitam, aksen kuning, subtitle serif perkataan-demi-perkataan. Dibina dengan [Remotion](https://remotion.dev).

**Preview (Remotion Studio):** https://geniusdigitaldeveloper-stack.github.io/animated-infographic/

## Mula
```bash
npm install
npm run dev        # Remotion Studio
npm run render     # out/explainer.mp4
```
Letak rakaman muka di `public/face.mp4` dan render dengan props `{"faceSrc":"face.mp4"}`.

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

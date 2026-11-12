# animated-infographic

## Pemilik & cara berinteraksi (PENTING)
- Panggil pemilik repo ini **"Ustaz"** dalam setiap balasan.
- Berbual dalam **Bahasa Melayu** (santai, ringkas). Istilah teknikal kekal dalam bahasa Inggeris.
- Jangan reka maklumat peribadi; jangan letak nama/emel pemilik dalam fail yang di-push.

## Projek
Reel 9:16 gaya **motion-graphics explainer** (talking head + kad infografik beranimasi), dibina dengan **Remotion**.
Rujukan gaya: lihat skill `infographic-reel-style` (visual, font, subtitle) dan `reel-edit-workflow` (3 prompt + 5 tool).

## Arahan
- `npm run dev` → Remotion Studio · `npm run render` → `out/explainer.mp4` · `npm run build:site` → `site/` (dideploy ke GitHub Pages)
- `npm run typecheck` mesti bersih sebelum commit.
- Semua warna/saiz/layout di `src/theme.ts`; font di `src/fonts.ts`; kandungan reel di `src/scenes/script.tsx`.

## Peraturan gaya (jangan langgar)
1. Satu warna aksen sahaja: kuning `#ffd60a`. Merah hanya untuk "bayar/dikunci/salah".
2. Layout tetap: grafik atas, subtitle tengah, kotak muka bawah.
3. Subtitle serif perkataan-demi-perkataan; *kata kunci* italic.
4. Satu scene = satu idea = satu visual. Tiada cut kasar, guna fade/spring.

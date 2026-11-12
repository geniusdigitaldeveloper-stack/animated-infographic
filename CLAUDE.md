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
2. Layout menyesuaikan saiz frame (lihat `getLayout` dalam `src/theme.ts`): frame tinggi = grafik atas, subtitle tengah, muka bawah; frame lebar = grafik kiri, muka kanan, subtitle bawah.
3. Subtitle serif perkataan-demi-perkataan; **setiap perkataan beranimasi (pop/rise/blur) tepat pada masa ia disebut**; *kata kunci* italic.
4. Satu scene = satu idea = satu visual. Tiada cut kasar, guna fade/spring.

## Media & subtitle (peraturan pemilik)
- **Jangan ambil muka, rakaman atau suara dari video rujukan**, dan jangan guna subtitle (perkataan/gaya) video rujukan.
- Muka & video sebenar = **rakaman Ustaz sahaja**, letak di `public/` dan hantar sebagai `faceSrc`.
- Subtitle sentiasa guna **gaya teks Ustaz** (`captionStyle` dalam `src/theme.ts`, komponen `Caption`) dan perkataan Ustaz sendiri (Whisper pada suara Ustaz).
- Saiz frame **boleh dilaras** (bukan 1920x1080 sahaja): props `width`/`height`; preset `reel`, `landscape`, `square`, `portrait`. Layout menyesuaikan diri.
- **Gaya teks infografik (tajuk, kad, senarai, prompt, label) KEKALKAN** seperti sedia ada (Inter + JetBrains Mono, aksen kuning). Hanya **subtitle** yang guna gaya Ustaz.
- Bila Ustaz minta tukar warna atau font infografik: warna di `colors` dalam `src/theme.ts`, font di `src/fonts.ts`. Jangan ubah struktur lain.

## Pratonton langsung (Ustaz mahu tengok bila-bila)
- **Pada permulaan setiap tugasan**, hidupkan Remotion Studio dan dedahkan pratonton: `npx remotion studio --port 3000 --no-open` (latar belakang), kemudian panggil `report_preview_port` dengan port 3000 (nama `remotion-studio`). Semak dulu kalau sudah berjalan (`curl localhost:3000`).
- Studio refresh sendiri bila kod diubah, jadi Ustaz nampak perubahan semasa saya edit. Jangan matikan Studio sehingga tugasan selesai.
- Jangan tanya Ustaz sama ada mahu pratonton; sentiasa sediakan.

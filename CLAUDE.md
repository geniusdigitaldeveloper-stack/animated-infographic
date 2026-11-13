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
3. Subtitle perkataan-demi-perkataan, **setiap perkataan pil kaca sendiri (overlay hitam pudar, gaya Liquid Glass iOS) dengan kaca penyerlah meluncur dari perkataan ke perkataan; JANGAN guna satu bar/border panjang**; **teks HOOK dalam subtitle = kuning butter `#FFE066` `[[…]]` atau merah cerah `#FF3B30` `{{…}}` sahaja**, kata nama AM dan awal ayat/selepas titik dibesarkan; **setiap perkataan beranimasi (pop/naik/blur) tepat pada masa ia disebut dengan animasi spring lancar macam iPhone (`captionStyle.motion`)**; *kata kunci* italic.
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

## Pautan untuk Ustaz tengok (WAJIB setiap tugasan edit)
- Bagi pautan Markdown berlabel tepat **LIHAT SAYA KERJA EDIT** ke https://geniusdigitaldeveloper-stack.github.io/animated-infographic/ pada **permulaan** tugasan dan diulang pada **penghujung** (selepas merge).
- Nyatakan dengan jujur: pautan tu menunjukkan versi yang sudah merge (dikemas kini ±1–2 minit selepas merge). Pratonton langsung semasa saya edit hanya dalam panel `remotion-studio` aplikasi Claude (localhost tiada pautan awam).
- Jangan tukar label pautan tu.

## Video rekod skrin / tutorial
- Guna skill `screen-tutorial-style` (komposisi `Tutorial`, 1920×1080). **Preview dahulu, jangan render final tanpa kebenaran Ustaz.**
- Output sentiasa **1920×1080**. Teks hanya di bawah frame video; di atas video hanya efek kursor (ring, zoom, ripple klik merah).
- Hantar fail preview terus kepada Ustaz (`SendUserFile`) kerana panel pratonton/pautan Pages tidak memaparkan video tutorial.

## Gaya teks subtitle Ustaz — RINGKASAN LENGKAP (jangan tinggal satu pun)
1. Pil kaca **setiap perkataan** (overlay hitam pudar, lut sinar, Liquid Glass iOS) — **bukan** satu bar panjang.
2. Kaca penyerlah **meluncur** dari perkataan ke perkataan sebelah.
3. Animasi **spring lancar macam iPhone**, per bingkai, sesuai fps tinggi.
4. Perkataan pop masuk tepat masa disebut (Whisper), 4 perkataan satu chunk, fade lembut antara chunk.
5. **Teks HOOK**: kuning butter `#FFE066` `[[…]]` atau merah cerah `#FF3B30` `{{…}}` sahaja, pada tempat sesuai.
6. Awal ayat / selepas titik huruf besar; kata nama AM dibesarkan.
7. Subtitle di BAWAH frame video, tidak di atas video.
Kod: `src/components/Caption.tsx` (+ `glass()`), parameter: `captionStyle` dalam `src/theme.ts`.

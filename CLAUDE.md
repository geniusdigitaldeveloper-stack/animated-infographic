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
- Output sentiasa **1920×1080**. Teks hanya di bawah frame video; di atas video hanya efek kursor (ring dan ripple klik merah) dan zoom pada klik.
- Hantar SEMUA preview/render/bahagian edit terus dalam chat (`SendUserFile`); jangan tempat lain.

## Gaya teks subtitle Ustaz — RINGKASAN LENGKAP (jangan tinggal satu pun)
0. **Warna teks = tiga sahaja, tiada putih:** biru air `#6FD3FF` (teks biasa), kuning butter `#FFE066` dan merah cerah `#FF3B30` (hook sahaja).
1. Pil kaca **setiap perkataan** (overlay hitam pudar, lut sinar, Liquid Glass iOS) — **bukan** satu bar panjang.
2. Kaca penyerlah **meluncur** dari perkataan ke perkataan sebelah.
3. Animasi **spring lancar macam iPhone**, per bingkai, sesuai fps tinggi.
4. Perkataan pop masuk tepat masa disebut (Whisper), 4 perkataan satu chunk, fade lembut antara chunk.
5. **Teks HOOK**: kuning butter `#FFE066` `[[…]]` atau merah cerah `#FF3B30` `{{…}}` sahaja, pada tempat sesuai.
6. Awal ayat / selepas titik huruf besar; kata nama AM dibesarkan.
7. Subtitle di BAWAH frame video, tidak di atas video.
Kod: `src/components/Caption.tsx` (+ `glass()`), parameter: `captionStyle` dalam `src/theme.ts`.

## "Hook" = teks subtitle (peraturan Ustaz)
- **Hook ialah perkataan dalam subtitle** yang diwarnakan: **merah cerah** `{{…}}` atau **kuning butter** `[[…]]` pada tempat yang sesuai. Selebihnya **biru air** `#6FD3FF`.
- **JANGAN** cari bahagian video lalu letak di awal sebagai hook pembuka. Video bermula dari awal rakaman.

## Wajib setiap kali edit video untuk Ustaz
Guna SEMUA gaya yang Ustaz minta disimpan (skill `infographic-reel-style`, `screen-tutorial-style`, `reel-edit-workflow`, bahagian di atas). **Hanya buang apa yang Ustaz suruh buang; yang tidak disuruh buang, JANGAN buang.**
Senarai yang Ustaz suruh BUANG (kekal dibuang): bar subtitle hitam panjang · warna putih pada teks subtitle · klip hook pembuka · bunyi tek (SFX klik) · zoom yang ikut pergerakan mouse (zoom hanya pada butang yang diklik dibenarkan) · bulatan klik besar · video muka daripada video rujukan.

## Penghantaran hasil — SEMUA dalam chat ini sahaja (peraturan Ustaz)
- **Preview, render akhir, kualiti render, bahagian yang dipotong / di-crop / diedit — semuanya dihantar terus dalam chat ini** menggunakan `SendUserFile` (display `render`), supaya Ustaz boleh tengok semasa kita kerja bersama.
- **JANGAN** hantar atau letak hasil di tempat lain (Drive, Pages, artifact, repo awam, pautan luar) melainkan Ustaz minta.
- Tunjukkan juga bahagian yang diedit: gambar/klip sebelum-dan-selepas atau klip pendek bahagian yang diubah, dengan kapsyen ringkas apa yang berubah.
- Fail video terlalu besar: kecilkan bitrate atau pecah kepada bahagian, tetapi tetap hantar dalam chat ini.
- Render akhir tetap hanya selepas Ustaz kata puas hati; preview boleh dihantar bila-bila.

## Video statik, zoom hanya pada klik, tiada bunyi tek, kualiti (peraturan Ustaz — GANTI peraturan zoom sebelum ini)
- **Video STATIK sepanjang masa**, kecuali **zoom pada setiap klik**: kamera zoom masuk (smooth, **dekat sedikit**, 1.5x) ke **butang yang diklik** (fokus tetap pada tengah butang), kemudian keluar semula lancar. **Gerakan zoom = fizik spring critically-damped macam animasi sistem MacBook/iOS** (tiada overshoot, tiada tersentak; `camera.omega`). **JANGAN ikut pergerakan mouse dan jangan pan mengikut laluan mouse.** `tutorial.camera` dalam `src/theme.ts`.
- Animasi klik (bulatan merah, ripple pop-up) dan ring ikut mouse kekal.
- **BUANG bunyi "tek tek" (SFX klik).** Jangan letak bunyi klik. Hanya muzik latar halus + suara.
- **Bahagian kabur/pecah** (zoom sendiri dalam rakaman Ustaz) ditingkatkan: `tools/enhance-blurry.sh` (de-block, denoise, sharpen). Jujur: penajaman, bukan 4K sebenar.
- Efek yang ada tetap bergerak lancar macam animasi iPhone (spring/smootherstep). Output kekal 1920×1080.
- **Subtitle keluar serentak dengan sebutan** (masa per perkataan dikunci pada suara sebenar). Jangan awal, jangan lewat.

## Subtitle = HANYA apa yang Ustaz sebut (peraturan Ustaz)
- Subtitle mesti **verbatim**: hanya perkataan yang Ustaz sebut, dengan **gaya cakap Ustaz sendiri** (korang, macam ni, kat sini, nak, dia, lah). **Jangan tambah, jangan reka, jangan tukar maksud, jangan "baiki" bahasa** ke bentuk formal.
- Hanya betulkan ejaan jelas, huruf besar awal ayat / selepas titik / kata nama AM, dan salah dengar Whisper yang pasti (contoh *emak info* → *More info*).
- Transkripsi guna **Whisper `medium` dengan `language="ms"`** (`tools/transcribe.py medium out.json audio.wav`); model `small` salah dengar dan boleh terlepas ayat. Semak keseluruhan transkrip dengan rakaman/skrin sebelum guna.
- Ayat yang tidak pasti: **tandakan dan tanya Ustaz**, jangan teka senyap-senyap.
- Perkara umum: **apa yang Ustaz tak cakap, jangan buat; apa yang Ustaz tak suruh, jangan buat; apa yang Ustaz tak suruh padam, jangan padam.**

## Kabur & nama (peraturan Ustaz)
- **Kaburkan teks nota/lower-third pada panel Preview dan Program** (kotak border nota di kiri bawah, contoh "GLOBAL STREAMER", "FOLLOW & SHARE", "RANK BOOSTING") dalam bahagian contoh slide. Julat masa dan kawasan di `src/tutorial/blur.json` (dicari dengan `tools/find-blur-ranges.py`); kabur dilukis di dalam bingkai video supaya ikut zoom.
- Nama produk betul: **Mobile Legends Bang Bang** (bukan "main-main"; Whisper terpotong sebut "Bang Bang").

## Eksport akhir 1080p (peraturan Ustaz: JANGAN jatuh ke 720p)
- Output akhir **1080p penuh**. Fail mentah Remotion (120fps, level 5.1, `yuvj420p`) menyebabkan sesetengah app/pemain menghad kepada 720p. **Sentiasa eksport versi piawai**: H.264 High, **`yuv420p` bt709 julat TV**, level 4.2 (60fps) / 4.1 (30fps), `tools/export-1080p.sh [fps] [crf]`. Hantar 60fps dan 30fps dalam chat.
- Sahkan dengan `ffprobe` (1920×1080, `yuv420p`) sebelum hantar. Jika app Ustaz masih tunjuk 720p dengan fail piawai ini, had itu datang daripada app (pemprosesan / pelan), bukan fail.

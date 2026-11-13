---
name: screen-tutorial-style
description: Gaya edit khas untuk video rekod skrin / tutorial skrin (16:9 1920x1080, BM campur English) — jejak kursor, ring highlight, efek klik merah, zoom, buang jeda, 2x bahagian lambat, callout langkah di bawah frame, subtitle hook kuning butter / merah cerah, latar cerah beranimasi, logo kiri berasingan, outro iOS. Guna bila Ustaz beri rakaman skrin untuk diedit.
---

# Screen tutorial style

Panggil pengguna **Ustaz**. Komposisi: `Tutorial` (`src/tutorial/Tutorial.tsx`), 1920×1080. **Output sentiasa 1920×1080.** Preview dahulu; **jangan render final** sehingga Ustaz setuju.

## Aliran kerja
1. Muat turun rakaman (Drive: `drive.usercontent.google.com/download?id=…&export=download&confirm=t`).
2. **Transkripsi dahulu**: `faster-whisper` (word timestamps), hantar audio sebagai array numpy.
3. **Jejak kursor** (``tools/track-cursor.py` warna HSV, kursor Ustaz hijau limau → `track.json`; `tools/detect-clicks.py` → `cursor.json`).
4. Bersihkan transkrip secara manual (BM betul, huruf besar kata nama AM & awal ayat) → `subs.json` → `python3 tools/build-plan.py whisper.json cursor.json subs.json src/tutorial/plan.json`.
5. Hasilkan proxy preview 1280×720 ke `public/tutorial/proxy.mp4` (*.mp4 tidak di-commit), audio: `python3 tools/make-audio.py <saat>`.
6. Preview: `npx remotion render Tutorial out/preview/….mp4 --crf=28`. Hantar fail ke Ustaz.

## Susun atur (`tutorial` dalam `src/theme.ts`)
- Frame video ≈ **70% skrin**, tengah dan sedikit ke atas (x 288, y 60, 1344×756), jarak atas dikekalkan, ruang subtitle di bawah.
- **Tiada teks / infografik / hyperframe di dalam atau di atas video.** Semua teks di BAWAH frame: callout langkah (nombor + label pendek, bergerak ikut x kursor) dan bar subtitle gelap.
- Dibenarkan di atas video **hanya efek kursor**: ring highlight lembut (cyan/putih), zoom, dan ripple klik merah.
- Latar **cerah** beranimasi (orb biru/cyan, grid halus, petak piksel, ombak bawah) ikut tema logo.
- Warna grade neutral: `contrast(1.05) saturate(1.06) brightness(1.03)`; tiada gradient garang.

## Efek kursor
- Setiap **klik**: bulatan **merah KECIL** (radius ≤ ~40px, fokus tepat pada butang yang ditekan, bukan besar) keluar (2 ring + titik) + bunyi `click`, dan zoom lembut ke kawasan kursor.
- Bila kursor berhenti di butang/menu: **ring highlight** merah kecil dan lembut (radius ~20–30px).
- **Hook pembuka**: klik butang utama (contoh *Run anyway*) → zoom sinematik + `impact` + teks hook besar; kemudian video bermula dari awal.

## Potongan
Buang jeda janggal/loading; jurang > 0.4s dipercepat ≥ 2x (audio dimute, lencana ⏩ di bawah frame); ayat berulang dibuang. Momen penting kekal 1x.

## Gaya teks Ustaz (subtitle sahaja)
- Perkataan demi perkataan, setiap perkataan beranimasi tepat pada masa disebut.
- **TEKS HOOK dalam subtitle**: hanya **kuning butter `#FFE066`** (`[[frasa]]`) atau **merah cerah `#FF3B30`** (`{{frasa}}`); guna pada tempat yang sesuai (amaran, butang utama, ayat kuat). Bar subtitle gelap supaya warna jelas.
- Awal ayat dan selepas titik: huruf besar; kata nama AM (Chrome, Global Streamer, Facebook, Mobile Legends…) dibesarkan.

## Logo (2 logo diberi Ustaz)
- Kiri skrin, **tidak terlalu besar** (184px) dan tidak menindih frame; **setiap logo animasi sendiri** (bukan kumpulan), pop-up setiap **100 saat**.
- **Outro**: logo 1 = **Genius Digital Developer** (G biru, induk/ketua), logo 2 = **Global Streamer** (produk di bawahnya). Teks bawah: "Terima kasih" (besar) dan baris biru **"Genius Digital Developer @ Global Streamer"**. Kedua-dua logo animasi iOS (spring, blur→jelas, ikon squircle + sapuan kilat, tekan-bounce), masuk berasingan.

## Bunyi
Muzik instrumental tenang di bawah suara (volum 0.11, fade akhir) + SFX: `click`, `impact`, `whoosh`, `pop`, `chime`. Semua disintesis (`tools/make-audio.py`); boleh diganti lagu berlesen.

## Kualiti
Render akhir 1920×1080 daripada rakaman asal (2560×1440 diturunkan skala = lebih tajam). Kekerapan 120fps: rakaman asal 50fps, jadi 120fps memerlukan interpolasi bingkai (rujuk Ustaz sebelum render final).

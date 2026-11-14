---
name: infographic-reel-style
description: Gaya visual, font dan subtitle untuk reel "motion graphics explainer" (talking head + infografik beranimasi, latar hitam, aksen kuning). Guna bila membina atau mengubah scene, kad grafik, kapsyen atau tema dalam repo ini.
---

# Infographic reel style

Panggil pengguna **Ustaz**. Gaya ini dirumus daripada reel rujukan (88s, 9:16, 30fps, 1080×1920).

## Peraturan media
- Jangan guna muka/rakaman/suara/subtitle daripada video rujukan. Hanya rakaman pemilik (`faceSrc`) dan gaya subtitle pemilik (`captionStyle` dalam `src/theme.ts`).
- Gaya teks infografik (tajuk, kad, senarai, prompt) kekal; pemilik hanya akan minta tukar warna/font (`colors` dalam `theme.ts`, `fonts.ts`).

## Format
- Saiz **boleh dilaras** (props `width`/`height`, preset: reel 1080×1920, landscape 1920×1080, square 1080×1080, portrait 1080×1350). Frame tinggi = susun (grafik atas, subtitle tengah, muka bawah); frame lebar/segi empat = sisi (grafik kiri, muka kanan, subtitle bawah). 30fps. Satu video ≈ 60–90s. Hook dalam 3s pertama.
- Struktur: **Hook → Masalah → Janji → Langkah bernombor → Mesej utama → Recap → CTA (Follow)**.

## Layout 3 lapis (`src/theme.ts → layout`)
| Lapisan | Kedudukan | Kandungan |
|---|---|---|
| Grafik | atas (y≈150, tinggi 700) | satu kad/infografik per scene |
| Subtitle | tengah (y≈940) | serif, perkataan demi perkataan |
| Muka | bawah (kotak 560×440, bucu 36px) | talking head PIP; muka penuh hanya 2–3s hook |

## Warna
- Latar `#0b0b0b` + radial gelap, kad `#161616`, teks `#f5f5f5`, malap `rgba(255,255,255,.28)`.
- **Aksen tunggal kuning `#ffd60a`**. Merah `#e5333b` hanya untuk "Pay / PAID / locked / pause".

## Font
- **Subtitle: Instrument Serif** (italic untuk kata kunci), ~72px.
- **Tajuk/UI: Inter 800**. **Prompt/kod: JetBrains Mono**.

## Subtitle (`src/components/Caption.tsx`)
- **Warna teks subtitle (Ustaz) = TIGA sahaja, TIADA putih:** **biru air `#6FD3FF`** untuk teks biasa; **kuning butter `#FFE066`** `[[…]]` dan **merah cerah `#FF3B30`** `{{…}}` untuk hook pada tempat sesuai. Putih bukan gaya Ustaz.
- **Gaya border subtitle (Ustaz): BUKAN bar hitam panjang.** Setiap perkataan ada **pil kaca tersendiri** (overlay hitam yang dipudarkan, lut sinar, gaya *Liquid Glass* iOS terkini: blur latar, rim cerah, sorotan atas). Satu **kaca penyerlah meluncur lancar (spring) dari perkataan yang sedang disebut ke perkataan sebelah**. Pil tidak digabung menjadi satu border.
- **Animasi subtitle (Ustaz) = lancar macam iPhone/iOS.** Fizik *spring* (bukan linear / ease cut), dikira pada setiap bingkai, jadi kekal licin pada fps tinggi (render akhir fps tinggi, contoh 60/120). Dua gerakan: (1) setiap perkataan *pop* masuk (naik + skala + blur→jelas) tepat pada masa disebut; (2) **kaca penyerlah meluncur dari perkataan ke perkataan sebelah**. Parameter: `captionStyle.motion` dalam `src/theme.ts`. Jangan tukar ke animasi kasar atau cut keras.
- 4 perkataan satu chunk. **Setiap perkataan ada animasi frame sendiri, tepat pada saat ia disebut** (ikut suara):
  spring pop `scale 0.72→1`, naik `26px→0`, blur `8px→0`, fade in (~4 frame). Perkataan yang sedang disebut = **kuning + glow + denyut kecil**; sudah disebut = putih; belum disebut = tersembunyi.
- **Teks HOOK dalam subtitle** (gaya Ustaz): hanya **kuning butter `#FFE066`** `[[frasa]]` atau **merah cerah `#FF3B30`** `{{frasa}}`, pada tempat yang sesuai. Awal ayat & selepas titik huruf besar; kata nama AM dibesarkan.
- Tulis `*kata kunci*` dalam teks untuk italic. Chunk fade keluar 0.12s sebelum chunk seterusnya (tiada cut keras).
- **Masa tepat**: `faster-whisper` (word timestamps) → `npm run captions whisper.json` → letak `words` (saat, relatif kepada scene) pada scene dalam `script.tsx`. Tanpa `words`, masa dibahagi sama rata.
- Peraturan: jangan paparkan perkataan sebelum ia disebut; animasi mesti bermula pada frame `round(start*fps)`.

## Label bab
Pil kuning kiri atas: `01 · App`, `04 · Tools`, `07 · Key line`.

## Komponen grafik (`src/components/Graphics.tsx`)
`LockedCheckout` (hook "dikunci di sebalik kursus"), `TimerRing` ("1:00 whole setup"), `AppWindow` (mockup macOS + tab),
`ToolList` (senarai bernombor, highlight bergilir), `PromptCard` (taip mono + baris kunci dihighlight),
`Waveform` ("17 pauses cut"), `Checklist` (tick satu-satu), `Stinger` (dua kad penutup), `FollowCard` (Follow → Following ✓).

## Animasi
Spring `damping:200` untuk masuk; highlight bergilir; checklist tick berperingkat; kursor/taip teks; stamp "PAID" scale 2.2→1.
Elak transisi liar — fade dan spring sahaja.

## Skrip (gaya penulisan)
Ayat pendek, satu idea satu visual. Hook: "Everybody's … But the setup? They lock it behind paid courses."
Janji: "Give me one minute, and I'll show you all of it." Mesej: "Take inspiration, but don't copy."
Penutup: "The tools do the cutting. Your taste does the rest." CTA: "Follow, because next up…"

## Subtitle = HANYA apa yang Ustaz sebut (peraturan Ustaz)
- Subtitle mesti **verbatim**: hanya perkataan yang Ustaz sebut, dengan **gaya cakap Ustaz sendiri** (korang, macam ni, kat sini, nak, dia, lah). **Jangan tambah, jangan reka, jangan tukar maksud, jangan "baiki" bahasa** ke bentuk formal.
- Hanya betulkan ejaan jelas, huruf besar awal ayat / selepas titik / kata nama AM, dan salah dengar Whisper yang pasti (contoh *emak info* → *More info*).
- Transkripsi guna **Whisper `medium` dengan `language="ms"`** (`tools/transcribe.py medium out.json audio.wav`); model `small` salah dengar dan boleh terlepas ayat. Semak keseluruhan transkrip dengan rakaman/skrin sebelum guna.
- Ayat yang tidak pasti: **tandakan dan tanya Ustaz**, jangan teka senyap-senyap.
- Perkara umum: **apa yang Ustaz tak cakap, jangan buat; apa yang Ustaz tak suruh, jangan buat; apa yang Ustaz tak suruh padam, jangan padam.**

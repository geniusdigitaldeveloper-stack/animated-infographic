---
name: infographic-reel-style
description: Gaya visual, font dan subtitle untuk reel "motion graphics explainer" (talking head + infografik beranimasi, latar hitam, aksen kuning). Guna bila membina atau mengubah scene, kad grafik, kapsyen atau tema dalam repo ini.
---

# Infographic reel style

Panggil pengguna **Ustaz**. Gaya ini dirumus daripada reel rujukan (88s, 9:16, 30fps, 1080×1920).

## Format
- 1080×1920, 30fps. Satu video ≈ 60–90s. Hook dalam 3s pertama.
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
- 4 perkataan satu chunk; sudah disebut = putih, sedang disebut = **kuning**, belum = kelabu malap.
- Tulis `*kata kunci*` dalam teks untuk italic. Fade+naik 14px masuk, tiada cut keras.
- Untuk masa tepat: `faster-whisper` (word timestamps) → `npm run captions whisper.json`.

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

import React from 'react';
import {interpolate} from 'remotion';
import {colors} from '../theme';
import {arabic, sans} from '../fonts';
import {Compare, CountUp, FactCard, Kicker, LineIcon, Process, SlowZoom, Squash, useLocal, usePop} from '../components/Motion';
import data from './rahmah-words.json';

/**
 * Reel: "Rahmah" — 9:16 voice-over infographic from the owner's own VO (public/rahmah/vo.mp3).
 * Content: maksud At-Tahrim:6 → hadis Sunan Tirmizi (Arab + maksud) → huraian ringkas.
 * Timings come from Whisper (scripts/rahmah/build_audio.py → rahmah-words.json).
 * Every visual and SFX is keyed to a spoken WORD via cue(), so it lands exactly when the word is said.
 */
export type Sfx = 'pop' | 'tick' | 'whoosh' | 'hmm' | 'signature';
export const SFX_LEN: Record<Sfx, number> = {pop: 0.16, tick: 0.75, whoosh: 0.55, hmm: 0.75, signature: 2.4};
export const SFX_VOL: Record<Sfx, number> = {pop: 0.45, tick: 0.3, whoosh: 0.3, hmm: 0.55, signature: 0.5};
export const MUSIC_VOL = 0.2; // ambient bed, 20% under the VO
export const OVERLAP = 0.35; // seconds of cross-transition between scenes

type W = {text: string; key: boolean; start: number; end: number; scene: string; ar: boolean};
export const words = data.words as W[];
export const TOTAL = data.total;
const norm = (s: string) => s.toLowerCase().replace(/[.,?!]/g, '');

/** Absolute time (s) of the nth occurrence of a word inside a scene. Throws if missing, so typos never go unnoticed. */
export const wordAt = (scene: string, w: string, nth = 0) => {
  const hits = words.filter((x) => x.scene === scene && norm(x.text) === norm(w));
  if (!hits[nth]) throw new Error(`cue "${w}" not found in scene ${scene}`);
  return hits[nth].start;
};

type Bg = {glow: [number, number]; pattern: 'dots' | 'grid' | 'rings' | 'none'};
export type ReelScene = {
  id: string; chapter: string; bg: Bg;
  graphic: (c: (w: string, nth?: number) => number) => React.ReactElement;
  sfx: {w: string; nth?: number; s: Sfx}[];
  closing?: boolean; // the "moment": slow zoom + music dips
};

const Col: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 40}) => (
  <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>{children}</div>
);

const Chip: React.FC<{at: number; children: React.ReactNode; hot?: boolean}> = ({at, children, hot}) => {
  const s = usePop(at);
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, opacity: s.opacity, transform: s.transform, fontFamily: sans, fontWeight: 700, fontSize: 38,
      padding: '14px 28px', borderRadius: 999, background: hot ? colors.accent : colors.card, color: hot ? '#111' : colors.text,
      border: `2px solid ${hot ? colors.accent : colors.cardBorder}`}}>{children}</span>
  );
};

/** Arabic text; each word lights up (pop + accent) exactly as it is recited. RTL. */
const ArabicLine: React.FC<{parts: {ar: string; at: number}[]}> = ({parts}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', direction: 'rtl', justifyContent: 'center', gap: '10px 26px', padding: '10px 20px'}}>
    {parts.map((p, i) => <ArabicWord key={i} {...p} next={parts[i + 1]?.at ?? p.at + 0.8} />)}
  </div>
);
const ArabicWord: React.FC<{ar: string; at: number; next: number}> = ({ar, at, next}) => {
  const s = usePop(at);
  const {t} = useLocal(at);
  const active = t >= 0 && t < next - at + 0.15;
  return (
    <span style={{fontFamily: arabic, fontWeight: 700, fontSize: 92, lineHeight: 1.6, opacity: t < 0 ? 0.18 : s.opacity,
      color: active ? colors.accent : colors.text, transform: t < 0 ? 'none' : s.transform, display: 'inline-block',
      textShadow: active ? '0 0 30px rgba(255,214,10,.4)' : 'none'}}>{ar}</span>
  );
};

/** Quran recitation: the verse in phrases; the current phrase is shown, each word lights up as it is recited. */
const ArabicRecitation: React.FC<{c: (w: string, nth?: number) => number; blocks: string[][]; label: string[]}> = ({c, blocks, label}) => {
  const {frame, fps} = useLocal(0);
  const t = frame / fps;
  const seen: Record<string, number> = {};
  const timed = blocks.map((b) => b.map((ar) => { const n = seen[ar] ?? 0; seen[ar] = n + 1; return {ar, at: c(ar, n)}; }));
  return (
    <div style={{position: 'relative', width: '100%', height: 860}}>
      {timed.map((b, i) => {
        const start = b[0].at, end = timed[i + 1]?.[0].at ?? 1e9;
        const o = interpolate(t, [start - 0.25, start, end - 0.25, end], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        if (o <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: o,
            transform: `translateY(${(1 - o) * 30}px)`}}>
            <Kicker at={start - 0.2} color={colors.accent}>{label[i]}</Kicker>
            <ArabicLine parts={b} />
          </div>
        );
      })}
    </div>
  );
};

export const reelScenes: ReelScene[] = [
  {
    id: 'firman', chapter: 'Firman Allah', bg: {glow: [50, 35], pattern: 'rings'},
    graphic: (c) => (
      <Col gap={30}>
        <LineIcon name="book" at={c('firman')} size={110} />
        <Kicker at={c('firman')} size={36} color={colors.text}>Firman Allah Taala dalam</Kicker>
        <Squash at={c('at-tahrim')} size={92}><span style={{whiteSpace: 'nowrap'}}>Surah At-Tahrim</span></Squash>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <Kicker at={c('ayat')} size={44} color={colors.text}>Ayat</Kicker>
          <CountUp at={c('6')} to={6} dur={0.5} size={220} />
        </div>
      </Col>
    ),
    sfx: [{w: 'at-tahrim', s: 'pop'}, {w: '6', s: 'tick'}],
  },
  {
    id: 'ayat_ar', chapter: 'At-Tahrim: 6', bg: {glow: [50, 45], pattern: 'none'},
    graphic: (c) => (
      <ArabicRecitation c={c} label={['Ta\'awwuz', 'Ayat 6', 'Ayat 6', 'Ayat 6']} blocks={[
        ['أَعُوذُ', 'بِاللَّهِ', 'مِنَ', 'الشَّيْطَانِ', 'الرَّجِيمِ'],
        ['يَا', 'أَيُّهَا', 'الَّذِينَ', 'آمَنُوا', 'قُوا', 'أَنفُسَكُمْ', 'وَأَهْلِيكُمْ', 'نَارًا'],
        ['وَقُودُهَا', 'النَّاسُ', 'وَالْحِجَارَةُ', 'عَلَيْهَا', 'مَلَائِكَةٌ', 'غِلَاظٌ', 'شِدَادٌ'],
        ['لَّا', 'يَعْصُونَ', 'اللَّهَ', 'مَا', 'أَمَرَهُمْ', 'وَيَفْعَلُونَ', 'مَا', 'يُؤْمَرُونَ'],
      ]} />
    ),
    sfx: [],
  },
  {
    id: 'ayat', chapter: 'Al-Quran · At-Tahrim: 6', bg: {glow: [50, 28], pattern: 'dots'},
    graphic: (c) => (
      <Col gap={34}>
        <Kicker at={c('bermaksud')}>Yang bermaksud</Kicker>
        <Kicker at={c('wahai')} size={34} color={colors.text}>Wahai orang yang beriman</Kicker>
        <Squash at={c('peliharalah')} size={108}>PELIHARALAH</Squash>
        <div style={{display: 'flex', gap: 22, width: '100%'}}>
          <FactCard at={c('diri')} icon="shield" title="Diri kamu" />
          <FactCard at={c('keluarga')} icon="home" title="Keluarga kamu" hot />
        </div>
        <Kicker at={c('neraka')} size={34} color={colors.text}>dari api neraka · bahan bakarnya</Kicker>
        <div style={{display: 'flex', gap: 18}}>
          <Chip at={c('manusia')}>Manusia</Chip>
          <Chip at={c('batu')}>Batu berhala</Chip>
        </div>
      </Col>
    ),
    sfx: [{w: 'peliharalah', s: 'pop'}, {w: 'keluarga', s: 'pop'}, {w: 'manusia', s: 'pop'}],
  },
  {
    id: 'malaikat', chapter: 'Maksud ayat', bg: {glow: [70, 30], pattern: 'grid'},
    graphic: (c) => (
      <Col gap={30}>
        <Kicker at={c('mereka')}>Dijaga dan dikawal oleh</Kicker>
        <Squash at={c('malaikat-malaikat')} size={140}>MALAIKAT</Squash>
        <div style={{display: 'flex', gap: 18}}>
          <Chip at={c('keras')}>Keras</Chip>
          <Chip at={c('kasar')}>Kasar layanannya</Chip>
        </div>
        <FactCard at={c('menderhaka')} icon="shield" title="Tidak menderhaka" sub="kepada Allah" />
        <FactCard at={c('melakukan')} icon="check" title="Tetap melakukan" sub="segala yang diperintahkan" hot />
      </Col>
    ),
    sfx: [{w: 'malaikat-malaikat', s: 'pop'}, {w: 'menderhaka', s: 'pop'}, {w: 'melakukan', s: 'pop'}],
  },
  {
    id: 'hadis', chapter: 'Hadis · Sunan Tirmizi', bg: {glow: [50, 40], pattern: 'none'},
    graphic: (c) => (
      <Col gap={34}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <LineIcon name="book" at={c('sunan')} size={84} />
          <Squash at={c('sunan')} size={84}>Sunan Tirmizi</Squash>
        </div>
        <FactCard at={c('abdullah')} icon="star" title="Abdullah bin Amr r.a." sub="meriwayatkan" />
        <Kicker at={c('rasulullah')} color={colors.accent} size={34}>Rasulullah SAW bersabda</Kicker>
        <ArabicLine parts={[
          {ar: 'لَيْسَ', at: c('laisa')}, {ar: 'مِنَّا', at: c('minna')}, {ar: 'مَنْ', at: c('man')},
          {ar: 'لَمْ', at: c('lam')}, {ar: 'يَرْحَمْ', at: c('yarham')}, {ar: 'صَغِيرَنَا', at: c('saghirana')},
        ]} />
      </Col>
    ),
    sfx: [{w: 'sunan', s: 'pop'}, {w: 'abdullah', s: 'pop'}, {w: 'laisa', s: 'pop'}],
  },
  {
    id: 'maksud', chapter: 'Maksud hadis', bg: {glow: [30, 50], pattern: 'grid'},
    graphic: (c) => (
      <Col gap={46}>
        <Kicker at={c('bermaksud')}>Yang bermaksud</Kicker>
        <Squash at={c('bukan')} size={104} color={colors.text}>
          Bukan daripada<br /><span style={{color: colors.accent}}>golongan kami</span>
        </Squash>
        <FactCard at={c('menyayangi')} icon="heart" title="Sesiapa yang tidak menyayangi" sub="kanak-kanak kami" hot />
      </Col>
    ),
    sfx: [{w: 'bukan', s: 'pop'}, {w: 'menyayangi', s: 'pop'}],
  },
  {
    id: 'huraian', chapter: 'Huraian', bg: {glow: [70, 35], pattern: 'rings'},
    graphic: (c) => (
      <Col gap={44}>
        <Kicker at={c('hadis')}>Hadis ini meletakkan</Kicker>
        <Squash at={c('rahmah')} size={165}>RAHMAH</Squash>
        <Kicker at={c('terhadap')} size={34} color={colors.text}>terhadap kanak-kanak sebagai</Kicker>
        <FactCard at={c('akhlak')} icon="star" title="Akhlak umat" sub="Nabi Muhammad SAW" hot />
      </Col>
    ),
    sfx: [{w: 'rahmah', s: 'pop'}, {w: 'akhlak', s: 'pop'}],
  },
  {
    id: 'rahmah', chapter: 'Rahmah itu…', bg: {glow: [50, 55], pattern: 'dots'},
    graphic: (c) => (
      <Col gap={36}>
        <Compare minHeight={460}
          left={{at: c('bukan'), kicker: 'BUKAN', title: 'Kelemahan', icon: 'battery', strikeAt: c('tetapi')}}
          right={{at: c('kekuatan'), kicker: 'TETAPI', title: 'Kekuatan', icon: 'bolt'}}
        />
        <div style={{display: 'flex', gap: 18, alignItems: 'center'}}>
          <Chip at={c('lembut')} hot>Lembut</Chip>
          <span style={{fontFamily: sans, fontWeight: 700, fontSize: 34, color: 'rgba(255,255,255,.55)'}}>+</span>
          <Chip at={c('ketegasan')}>Tegas</Chip>
        </div>
      </Col>
    ),
    sfx: [{w: 'bukan', s: 'pop'}, {w: 'kekuatan', s: 'pop'}, {w: 'lembut', s: 'pop'}],
  },
  {
    id: 'prinsip', chapter: 'Cara mendidik', bg: {glow: [25, 40], pattern: 'grid'},
    graphic: (c) => (
      <Process title="Mendidik dengan rahmah" titleAt={c('adil') - 0.2} rowH={300} steps={[
        {at: c('adil'), icon: 'scale', title: 'Adil', sub: 'tanpa pilih kasih'},
        {at: c('mendisiplinkan'), icon: 'hand', title: 'Disiplin', sub: 'tanpa kekerasan'},
      ]} />
    ),
    sfx: [{w: 'adil', s: 'pop'}, {w: 'mendisiplinkan', s: 'pop'}],
  },
  {
    id: 'penutup', chapter: 'Pesanan', bg: {glow: [50, 40], pattern: 'none'},
    graphic: (c) => <Closing c={c} />,
    sfx: [{w: 'dibimbing', s: 'pop'}, {w: 'tubuhnya', s: 'pop'}, {w: 'marwahnya', s: 'pop'}],
  },
  {
    id: 'kuat_intro', chapter: 'Umat yang kuat', bg: {glow: [50, 30], pattern: 'dots'},
    graphic: (c) => (
      <Col gap={34}>
        <Kicker at={c('rasulullah')} size={36} color={colors.text}>Rasulullah SAW amat mencintai</Kicker>
        <LineIcon name="bolt" at={c('kuat')} size={140} />
        <Squash at={c('kuat')} size={130}>UMAT YANG KUAT</Squash>
      </Col>
    ),
    sfx: [{w: 'kuat', s: 'pop'}],
  },
  {
    id: 'kuat', chapter: 'Hadis · Sahih Muslim', bg: {glow: [35, 45], pattern: 'grid'},
    graphic: (c) => (
      <Col gap={34}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <LineIcon name="book" at={c('sahih')} size={70} />
          <Kicker at={c('sahih')} color={colors.accent} size={34}>Sahih Muslim · Nabi SAW bersabda</Kicker>
        </div>
        <div style={{display: 'flex', gap: 26, width: '100%', alignItems: 'stretch'}}>
          <div style={{flex: 1.3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
            <Kicker at={c('mukmin')} size={32} color={colors.text}>Mukmin yang</Kicker>
            <Squash at={c('kuat')} size={140}>KUAT</Squash>
            <FactCard at={c('baik')} icon="star" title="lebih baik" />
            <FactCard at={c('dicintai')} icon="heart" title="lebih dicintai" sub="oleh Allah" hot />
          </div>
          <LemahCol at={c('lemah')} />
        </div>
      </Col>
    ),
    sfx: [{w: 'kuat', s: 'pop'}, {w: 'baik', s: 'pop'}, {w: 'dicintai', s: 'pop'}, {w: 'lemah', s: 'pop'}],
  },
  {
    id: 'rumah', chapter: 'Renungan', bg: {glow: [50, 40], pattern: 'none'}, closing: true,
    graphic: (c) => (
      <SlowZoom at={c('kekuatan')} to={1.14} dur={5}>
        <Col gap={24}>
          <Kicker at={c('kekuatan')} size={40} color={colors.text}>Kekuatan ini bermula dari</Kicker>
          <LineIcon name="home" at={c('rumah')} size={170} draw={0.8} />
          <Squash at={c('rumah')} size={170}>RUMAH</Squash>
        </Col>
      </SlowZoom>
    ),
    sfx: [{w: 'rumah', s: 'signature'}],
  },
];

const LemahCol: React.FC<{at: number}> = ({at}) => {
  const s = usePop(at);
  return (
    <div style={{flex: 1, opacity: s.opacity * 0.75, transform: s.transform, background: colors.card, borderRadius: 28,
      border: `2px solid ${colors.cardBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
      <div style={{fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,.5)'}}>DARIPADA</div>
      <LineIcon name="battery" at={at} size={100} color="rgba(255,255,255,.6)" />
      <div style={{fontFamily: sans, fontWeight: 800, fontSize: 64, color: 'rgba(255,255,255,.6)'}}>lemah</div>
    </div>
  );
};

const Closing: React.FC<{c: (w: string) => number}> = ({c}) => {
  const {t} = useLocal(c('tubuhnya'));
  const lift = interpolate(t, [0, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SlowZoom at={c('kesalahan')} to={1.08} dur={10}>
      <Col gap={30}>
        <div style={{transform: `translateY(${-20 * lift}px) scale(${1 - 0.12 * lift})`}}>
          <Col gap={10}>
            <Kicker at={c('kesalahan')} size={40} color={colors.text}>Kesalahan anak perlu</Kicker>
            <Squash at={c('dibimbing')} size={150}>DIBIMBING</Squash>
          </Col>
        </div>
        <FactCard at={c('tubuhnya')} icon="x" wrong title="Tubuhnya" sub="bukan tempat melepaskan kemarahan" />
        <FactCard at={c('marwahnya')} icon="x" wrong title="Marwahnya" sub="tidak dihancurkan dengan makian" />
      </Col>
    </SlowZoom>
  );
};

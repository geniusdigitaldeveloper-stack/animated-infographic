import React from 'react';
import {interpolate} from 'remotion';
import {colors} from '../theme';
import {arabic, sans} from '../fonts';
import {Compare, FactCard, Kicker, LineIcon, Process, SlowZoom, Squash, useLocal, usePop} from '../components/Motion';
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

type W = {text: string; key: boolean; start: number; end: number; scene: string};
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

export const reelScenes: ReelScene[] = [
  {
    id: 'ayat', chapter: 'Al-Quran · At-Tahrim: 6', bg: {glow: [50, 28], pattern: 'dots'},
    graphic: (c) => (
      <Col gap={34}>
        <Kicker at={c('wahai')}>Wahai orang yang beriman</Kicker>
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
    id: 'penutup', chapter: 'Pesanan', bg: {glow: [50, 40], pattern: 'none'}, closing: true,
    graphic: (c) => <Closing c={c} />,
    sfx: [{w: 'dibimbing', s: 'signature'}, {w: 'marwahnya', s: 'pop'}],
  },
];

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

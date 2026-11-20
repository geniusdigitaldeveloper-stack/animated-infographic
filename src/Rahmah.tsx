import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, getReelLayout} from './theme';
import {sans} from './fonts';
import {Caption} from './components/Caption';
import {MUSIC_VOL, OVERLAP, reelScenes, Sfx, SFX_LEN, SFX_VOL, TOTAL, wordAt, words} from './scenes/rahmah';
import data from './scenes/rahmah-words.json';

export type RahmahProps = {width: number; height: number; showSafeZone: boolean};
export const rahmahFrames = (fps: number) => Math.round(TOTAL * fps);

const sceneTimes = data.scenes.map((s, i) => ({...s, seq: i === 0 ? 0 : s.start - OVERLAP}));

/**
 * SFX map → one list, never stacked: an SFX is dropped if it would start while the previous one is still sounding.
 * Whoosh sits in the silent gap before each scene so it never covers a word.
 */
export const sfxEvents = (() => {
  const ev: {t: number; s: Sfx}[] = [];
  reelScenes.forEach((sc, i) => {
    if (i > 0) ev.push({t: sceneTimes[i].start - 0.42, s: 'whoosh'});
    sc.sfx.forEach((x) => ev.push({t: wordAt(sc.id, x.w, x.nth), s: x.s}));
  });
  ev.sort((a, b) => a.t - b.t);
  const out: typeof ev = [];
  for (const e of ev) {
    const prev = out[out.length - 1];
    if (!prev || e.t >= prev.t + SFX_LEN[prev.s] * 0.9) out.push(e);
  }
  return out;
})();

const closingAt = wordAt('penutup', 'kesalahan'); // the "moment": music dips under the closing line

const Backdrop: React.FC<{glow: [number, number]; pattern: string}> = ({glow, pattern}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 3;
  const pat: Record<string, string> = {
    dots: 'radial-gradient(rgba(255,255,255,.07) 2px, transparent 2.5px) 0 0 / 46px 46px',
    grid: 'linear-gradient(rgba(255,255,255,.04) 2px, transparent 2px) 0 0 / 72px 72px, linear-gradient(90deg, rgba(255,255,255,.04) 2px, transparent 2px) 0 0 / 72px 72px',
    rings: 'repeating-radial-gradient(circle at 50% 45%, rgba(255,255,255,.035) 0 2px, transparent 2px 80px)',
    none: 'none',
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: pat[pattern], opacity: 0.9}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at ${glow[0] + drift}% ${glow[1]}%, rgba(255,214,10,.10) 0%, rgba(255,214,10,0) 45%)`}} />
    </AbsoluteFill>
  );
};

/** Diagonal accent streaks sweeping across on every section change. */
const Wipe: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const k = frame / (0.4 * fps);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {[0, 1, 2].map((i) => {
        const x = interpolate(k - i * 0.12, [0, 1], [-width * 0.9, width * 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <div key={i} style={{position: 'absolute', top: -height * 0.2, left: x, width: [70, 26, 12][i], height: height * 1.4,
          background: colors.accent, opacity: [0.9, 0.6, 0.4][i], transform: 'rotate(18deg)'}} />;
      })}
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{i: number; dur: number}> = ({i, dur}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const L = getReelLayout(width, height);
  const sc = reelScenes[i];
  const seq = sceneTimes[i].seq;
  const t = frame / fps;
  const enter = i === 0 ? 1 : interpolate(t, [0, OVERLAP], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const last = i === reelScenes.length - 1;
  const exit = last ? 1 : interpolate(t, [dur - OVERLAP, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = (w: string, nth = 0) => wordAt(sc.id, w, nth) - seq;
  const s = Math.min(L.graphic.w / 900, L.graphic.h / 860);
  const sceneWords = words.filter((w) => w.scene === sc.id);
  const text = sceneWords.map((w) => (w.key ? w.text.replace(/^([^.,?!]+)([.,?!]*)$/, '*$1*$2') : w.text)).join(' ');
  return (
    <AbsoluteFill style={{opacity: Math.min(enter, exit)}}>
      <Backdrop glow={sc.bg.glow} pattern={sc.bg.pattern} />
      <div style={{position: 'absolute', left: L.pill.x, top: L.pill.y, background: colors.accent, color: '#111', fontFamily: sans,
        fontWeight: 800, fontSize: 26 * L.unit, padding: `${10 * L.unit}px ${22 * L.unit}px`, borderRadius: 999,
        transform: `translateX(${(1 - enter) * -40}px)`}}>{sc.chapter}</div>
      <div style={{position: 'absolute', left: L.graphic.x, top: L.graphic.y, width: L.graphic.w, height: L.graphic.h,
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: 900, height: 860, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${s * (0.94 + 0.06 * enter)}) translateY(${(1 - enter) * 60}px)`}}>
          {sc.graphic(c)}
        </div>
      </div>
      <Caption text={text} duration={dur} box={L.caption} unit={L.unit}
        words={sceneWords.map((w) => ({text: w.text, start: w.start - seq, end: w.end - seq}))} />
    </AbsoluteFill>
  );
};

const SafeZone: React.FC = () => {
  const {width, height} = useVideoConfig();
  const {safe} = getReelLayout(width, height);
  return <div style={{position: 'absolute', left: safe.x, top: safe.y, width: safe.w, height: safe.h,
    border: '3px dashed rgba(255,0,255,.8)', pointerEvents: 'none'}} />;
};

export const Rahmah: React.FC<RahmahProps> = ({showSafeZone}) => {
  const {fps} = useVideoConfig();
  const F = (s: number) => Math.round(s * fps);
  const voEnd = data.voEnd;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #171717 0%, ${colors.bg} 75%)`}}>
      {reelScenes.map((_, i) => {
        const from = sceneTimes[i].seq;
        const to = i === reelScenes.length - 1 ? TOTAL : sceneTimes[i + 1].start;
        return (
          <Sequence key={i} from={F(from)} durationInFrames={F(to - from)} premountFor={fps}>
            <SceneView i={i} dur={to - from} />
          </Sequence>
        );
      })}
      {sceneTimes.slice(1).map((s, i) => (
        <Sequence key={`w${i}`} from={F(s.start - 0.5)} durationInFrames={F(0.6)}><Wipe /></Sequence>
      ))}

      {/* AUDIO — VO on top, SFX balanced under it, music bed 20% (dips for the closing moment) */}
      <Audio src={staticFile('rahmah/vo.mp3')} volume={1} />
      <Audio src={staticFile('rahmah/music.mp3')} volume={(f) => {
        const t = f / fps;
        const dip = interpolate(t, [closingAt - 0.4, closingAt + 0.2, voEnd + 0.6, voEnd + 1.6], [1, 0.3, 0.3, 1.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const fadeIn = interpolate(t, [0, 0.8], [0.4, 1], {extrapolateRight: 'clamp'});
        const fadeOut = interpolate(t, [TOTAL - 1.8, TOTAL], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return MUSIC_VOL * dip * fadeIn * fadeOut;
      }} />
      {sfxEvents.map((e, i) => (
        <Sequence key={`s${i}`} from={F(e.t)} durationInFrames={F(SFX_LEN[e.s] + 0.3)}>
          <Audio src={staticFile(`rahmah/sfx-${e.s}.wav`)} volume={SFX_VOL[e.s]} />
        </Sequence>
      ))}
      {showSafeZone && <SafeZone />}
    </AbsoluteFill>
  );
};

import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {captionStyle as C, tutorial} from '../theme';
import {useLayout} from './Frame';
import {serif} from '../fonts';
import type {Word} from '../types';

/**
 * OWNER'S SUBTITLE STYLE
 * - NO long bar. EVERY word has its own faded-black GLASS pill (iOS "Liquid Glass" look: translucent dark overlay,
 *   backdrop blur, bright rim + specular highlight). Pills are separate, never one long border.
 * - A glass highlight lens glides smoothly from the word being said to the next word (spring, 4K-smooth).
 * - Every word still pops in (spring / rise / blur) at the moment it is spoken.
 * COLOURS (owner): exactly three — water blue #6FD3FF for normal text, butter yellow #FFE066 / bright red #FF3B30 for HOOK only. NEVER white.
 * Markup: *word* italic · [[phrase]] HOOK butter yellow (#FFE066) · {{phrase}} HOOK bright red (#FF3B30)
 * Timing: pass `words` (seconds, from Whisper) for exact sync, else evenly spread over `duration`.
 */
export const WORDS_PER_CHUNK = C.wordsPerChunk;
export type CaptionRect = {x: number; y: number; w: number; h: number; fontSize: number};
export type Palette = {spoken: string; active: string; glow: string};
type Props = {fontFamily?: string; text: string; duration: number; words?: Word[]; rect?: CaptionRect; palette?: Palette; unit?: number};
type Tok = {text: string; italic: boolean; hook: 'butter' | 'red' | null; start: number; end: number};

const tokenize = (text: string, duration: number, words?: Word[]): Tok[] => {
  const raw = text.split(/\s+/).filter(Boolean);
  const per = duration / raw.length;
  let mode: 'butter' | 'red' | null = null;
  return raw.map((r, i) => {
    if (r.startsWith('[[')) mode = 'butter';
    if (r.startsWith('{{')) mode = 'red';
    const hook = mode;
    if (r.includes(']]') || r.includes('}}')) mode = null;
    const clean = r.replace(/\[\[|\]\]|\{\{|\}\}/g, '');
    const w = words?.[i];
    return {text: clean.replace(/\*/g, ''), italic: /^\*.+\*[.,!?:;]*$/.test(clean), hook,
      start: w ? w.start : i * per, end: w ? w.end : (i + 1) * per};
  });
};

// Liquid-glass recipe (dark, faded, see-through)
const glass = (u: number, strong = false): React.CSSProperties => ({
  background: strong
    ? 'linear-gradient(180deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.10) 45%, rgba(255,255,255,.18) 100%)'
    : 'linear-gradient(180deg, rgba(20,28,48,.46) 0%, rgba(10,16,30,.52) 100%)',
  backdropFilter: 'blur(18px) saturate(1.8)', WebkitBackdropFilter: 'blur(18px) saturate(1.8)',
  border: `${Math.max(1, 1.5 * u)}px solid rgba(255,255,255,${strong ? 0.6 : 0.26})`,
  borderRadius: 22 * u,
  boxShadow: `inset 0 ${1.5 * u}px 0 rgba(255,255,255,${strong ? 0.7 : 0.4}), inset 0 ${-1.5 * u}px 0 rgba(255,255,255,.10), inset 0 0 ${14 * u}px rgba(255,255,255,.07), 0 ${10 * u}px ${28 * u}px rgba(8,14,30,${strong ? 0.12 : 0.22})`,
});

export const Caption: React.FC<Props> = ({text, duration, words, rect, palette, unit, fontFamily}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const box = rect ?? L.caption;
  const u = unit ?? L.unit;
  const pal = palette ?? {spoken: tutorial.waterBlue, active: tutorial.waterBlue, glow: C.glow};
  const family = fontFamily ?? serif;
  const t = frame / fps;
  const toks = tokenize(text, duration, words);

  let idx = 0;
  toks.forEach((k, i) => { if (t >= k.start) idx = i; });
  const chunkStart = Math.floor(idx / WORDS_PER_CHUNK) * WORDS_PER_CHUNK;
  const chunk = toks.slice(chunkStart, chunkStart + WORDS_PER_CHUNK);
  const lastEnd = chunk[chunk.length - 1].end;
  const out = chunkStart + WORDS_PER_CHUNK < toks.length
    ? interpolate(t, [lastEnd - C.motion.chunkFade, lastEnd], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;

  // exact widths so the gliding lens lines up with every pill
  const fs = box.fontSize, padX = fs * 0.36, padY = fs * 0.14, gap = fs * 0.2;
  const weight = (k: Tok) => (fontFamily ? (k.hook ? 800 : 600) : 400);
  const widths = chunk.map((k) => {
    let w = fs * 0.6 * k.text.length;
    try { w = measureText({text: k.text, fontFamily: family, fontSize: fs, fontWeight: String(weight(k))}).width; } catch (e) { /* font not ready */ }
    return Math.ceil(w) + padX * 2;
  });
  const xs: number[] = []; let acc = 0;
  widths.forEach((w, i) => { xs[i] = acc; acc += w + gap; });
  const total = acc - gap;
  const fit = Math.min(1, (box.w - 40) / total);
  const rowH = fs * 1.18 + padY * 2;

  // lens glides from previous word -> current word
  const li = idx - chunkStart;
  const startF = Math.round(chunk[li].start * fps);
  const p = spring({frame: frame - startF, fps, config: C.motion.lens});
  const from = li > 0 ? li - 1 : li;
  const lx = xs[from] + (xs[li] - xs[from]) * p;
  const lw = widths[from] + (widths[li] - widths[from]) * p;
  const lensIn = li === 0 ? interpolate(frame - startF, [0, C.motion.lensIn], [0, 1], {extrapolateRight: 'clamp'}) : 1;

  return (
    <div style={{position: 'absolute', top: box.y, left: box.x, width: box.w, height: box.h, display: 'flex', justifyContent: 'center',
      alignItems: 'center', opacity: out}}>
      <div style={{position: 'relative', width: total, height: rowH, transform: `scale(${fit})`, transformOrigin: 'center'}}>
        <div style={{position: 'absolute', left: lx, top: 0, width: lw, height: rowH, opacity: lensIn, ...glass(u, true),
          boxShadow: `${glass(u, true).boxShadow}, 0 0 ${26 * u}px rgba(255,255,255,.35)`}} />
        {chunk.map((w, i) => {
          const g = chunkStart + i;
          const local = frame - Math.round(w.start * fps);
          const pop = spring({frame: local, fps, config: C.motion.pop});
          const appear = interpolate(local, [0, C.fadeFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const blur = interpolate(local, [0, 6], [C.blur, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const active = g === idx;
          const beat = active ? 1 + C.beat * Math.max(0, 1 - local / 8) : 1;
          const hookColor = w.hook === 'butter' ? tutorial.hookButter : w.hook === 'red' ? tutorial.hookRed : null;
          return (
            <div key={g} style={{position: 'absolute', left: xs[i], top: 0, width: widths[i], height: rowH, display: 'flex', alignItems: 'center',
              justifyContent: 'center', ...glass(u), opacity: local >= 0 ? appear : 0,
              transform: `translateY(${(1 - pop) * C.rise * u}px) scale(${(C.popFrom + (1 - C.popFrom) * pop) * beat})`,
              filter: `blur(${blur}px)`}}>
              <span style={{fontFamily: family, fontSize: fs, lineHeight: 1.18, whiteSpace: 'nowrap', fontStyle: w.italic ? 'italic' : 'normal',
                fontWeight: weight(w), color: hookColor ?? pal.spoken,
                textShadow: hookColor ? `0 0 ${20 * u}px ${hookColor}55, 0 ${2 * u}px ${6 * u}px rgba(0,0,0,.45)` : `0 0 ${18 * u}px rgba(111,211,255,.45), 0 ${2 * u}px ${8 * u}px rgba(0,0,0,.45)`}}>{w.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

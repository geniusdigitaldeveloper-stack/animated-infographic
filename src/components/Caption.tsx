import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionStyle as C, tutorial} from '../theme';
import {useLayout} from './Frame';
import {serif} from '../fonts';
import type {Word} from '../types';

/**
 * Owner's subtitle: word-by-word, every word animates (spring pop / rise / blur) at the moment it is spoken.
 * Markup inside the text:
 *   *word*        italic keyword
 *   [[phrase]]    HOOK text, butter yellow  (#FFE066)
 *   {{phrase}}    HOOK text, bright red     (#FF3B30)
 * Hook colours are the owner's rule: use ONLY butter yellow or bright red for hook text, at the right place.
 * Proper nouns / sentence starts are capitalised in the source text itself.
 * Timing: pass `words` (seconds, from Whisper) for exact sync, else words are spread evenly over `duration`.
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
    return {
      text: clean.replace(/\*/g, ''),
      italic: /^\*.+\*[.,!?:;]*$/.test(clean),
      hook,
      start: w ? w.start : i * per,
      end: w ? w.end : (i + 1) * per,
    };
  });
};

export const Caption: React.FC<Props> = ({text, duration, words, rect, palette, unit, fontFamily}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const box = rect ?? L.caption;
  const u = unit ?? L.unit;
  const pal = palette ?? {spoken: C.spoken, active: C.active, glow: C.glow};
  const t = frame / fps;
  const toks = tokenize(text, duration, words);

  let idx = 0;
  toks.forEach((k, i) => { if (t >= k.start) idx = i; });
  const chunkStart = Math.floor(idx / WORDS_PER_CHUNK) * WORDS_PER_CHUNK;
  const chunk = toks.slice(chunkStart, chunkStart + WORDS_PER_CHUNK);
  const lastEnd = chunk[chunk.length - 1].end;
  const out = chunkStart + WORDS_PER_CHUNK < toks.length
    ? interpolate(t, [lastEnd - 0.12, lastEnd], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  return (
    <div style={{
      position: 'absolute', top: box.y, left: box.x, width: box.w, height: box.h,
      display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: out,
    }}>
      <div style={{fontFamily: fontFamily ?? serif, fontSize: box.fontSize, lineHeight: 1.18, color: pal.spoken}} data-caption>
        {chunk.map((w, i) => {
          const g = chunkStart + i;
          const local = frame - Math.round(w.start * fps);
          const p = spring({frame: local, fps, config: {damping: 14, stiffness: 190, mass: 0.6}});
          const appear = interpolate(local, [0, C.fadeFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const blur = interpolate(local, [0, 6], [C.blur, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const active = g === idx;
          const beat = active ? 1 + C.beat * Math.max(0, 1 - local / 8) : 1;
          const hookColor = w.hook === 'butter' ? tutorial.hookButter : w.hook === 'red' ? tutorial.hookRed : null;
          return (
            <span key={g} style={{
              display: 'inline-block', marginRight: '0.28em',
              color: hookColor ?? (active ? pal.active : pal.spoken),
              fontStyle: w.italic ? 'italic' : 'normal',
              fontWeight: fontFamily ? (hookColor ? 800 : 600) : 400,
              opacity: local >= 0 ? appear : 0,
              transform: `translateY(${(1 - p) * C.rise * u}px) scale(${(C.popFrom + (1 - C.popFrom) * p) * beat})`,
              filter: `blur(${blur}px)`,
              textShadow: hookColor ? `0 0 26px ${hookColor}66` : active ? `0 0 28px ${pal.glow}` : 'none',
            }}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

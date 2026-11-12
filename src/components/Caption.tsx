import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionStyle as C} from '../theme';
import {useLayout} from './Frame';
import {serif} from '../fonts';
import type {Word} from '../types';

/**
 * Word-by-word serif subtitle with a per-word animation, timed to the speech.
 * - every word pops in at the exact frame it is spoken: spring scale 0.72→1, rise 26px→0, blur 8px→0, fade in
 * - the word being spoken is yellow with a soft glow and a small "beat" scale; spoken = white; upcoming = hidden-dim
 * - *word* in the source text => italic keyword
 * - ~4 words per chunk; chunk fades out softly when the next one starts (no hard cuts)
 * Timing: pass `words` (seconds, from Whisper) for exact sync; otherwise words are spread evenly over `duration`.
 */
export const WORDS_PER_CHUNK = C.wordsPerChunk;

type Props = {text: string; duration: number; words?: Word[]};
type Tok = {text: string; italic: boolean; start: number; end: number}; // seconds, relative to the scene

const tokenize = (text: string, duration: number, words?: Word[]): Tok[] => {
  const raw = text.split(/\s+/).filter(Boolean);
  const per = duration / raw.length;
  return raw.map((r, i) => {
    const w = words?.[i];
    return {
      text: r.replace(/\*/g, ''),
      italic: /^\*.+\*[.,!?:;]*$/.test(r),
      start: w ? w.start : i * per,
      end: w ? w.end : (i + 1) * per,
    };
  });
};

export const Caption: React.FC<Props> = ({text, duration, words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const t = frame / fps;
  const toks = tokenize(text, duration, words);

  let idx = 0; // word currently being spoken
  toks.forEach((k, i) => { if (t >= k.start) idx = i; });
  const chunkStart = Math.floor(idx / WORDS_PER_CHUNK) * WORDS_PER_CHUNK;
  const chunk = toks.slice(chunkStart, chunkStart + WORDS_PER_CHUNK);
  const lastEnd = chunk[chunk.length - 1].end;
  const out = chunkStart + WORDS_PER_CHUNK < toks.length
    ? interpolate(t, [lastEnd - 0.12, lastEnd], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  return (
    <div style={{
      position: 'absolute', top: L.caption.y, left: L.caption.x, width: L.caption.w, height: L.caption.h,
      display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: out,
    }}>
      <div style={{fontFamily: serif, fontSize: L.caption.fontSize, lineHeight: 1.18, color: C.spoken}}>
        {chunk.map((w, i) => {
          const g = chunkStart + i;
          const local = frame - Math.round(w.start * fps);
          const p = spring({frame: local, fps, config: {damping: 14, stiffness: 190, mass: 0.6}});
          const appear = interpolate(local, [0, C.fadeFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const blur = interpolate(local, [0, 6], [C.blur, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const active = g === idx;
          const beat = active ? 1 + C.beat * Math.max(0, 1 - local / 8) : 1;
          const shown = local >= 0;
          return (
            <span key={g} style={{
              display: 'inline-block', marginRight: '0.28em',
              color: active ? C.active : C.spoken,
              fontStyle: w.italic ? 'italic' : 'normal',
              opacity: shown ? appear : 0,
              transform: `translateY(${(1 - p) * C.rise * L.unit}px) scale(${(C.popFrom + (1 - C.popFrom) * p) * beat})`,
              filter: `blur(${blur}px)`,
              textShadow: active ? `0 0 28px ${C.glow}` : 'none',
            }}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, layout, type} from '../theme';
import {serif} from '../fonts';

/**
 * Word-by-word serif subtitle.
 * - spoken words: white, current word: yellow, upcoming: dim grey
 * - *word* in the source text => italic keyword
 * - shows ~4 words per chunk, chunks fade in/out softly (no hard cuts)
 */
export const WORDS_PER_CHUNK = 4;

type Props = {text: string; duration: number};

export const Caption: React.FC<Props> = ({text, duration}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tokens = text.split(/\s+/).filter(Boolean).map((raw) => {
    const italic = /^\*.+\*[.,!?:;]*$/.test(raw);
    return {text: raw.replace(/\*/g, ''), italic};
  });
  const per = (duration * fps) / tokens.length; // frames per word (even split; swap for Whisper timings)
  const idx = Math.min(tokens.length - 1, Math.floor(frame / per));
  const chunkStart = Math.floor(idx / WORDS_PER_CHUNK) * WORDS_PER_CHUNK;
  const chunk = tokens.slice(chunkStart, chunkStart + WORDS_PER_CHUNK);
  const chunkFrame = frame - chunkStart * per;
  const opacity = interpolate(chunkFrame, [0, 5], [0, 1], {extrapolateRight: 'clamp'});
  const y = interpolate(chunkFrame, [0, 6], [14, 0], {extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute', top: layout.captionTop, left: layout.pad, right: layout.pad,
        height: layout.captionHeight, display: 'flex', justifyContent: 'center',
        alignItems: 'center', textAlign: 'center', opacity, transform: `translateY(${y}px)`,
      }}
    >
      <div style={{fontFamily: serif, fontSize: type.caption, lineHeight: 1.15, color: colors.text}}>
        {chunk.map((w, i) => {
          const g = chunkStart + i;
          const color = g < idx ? colors.text : g === idx ? colors.accent : colors.dim;
          return (
            <span key={g} style={{color, fontStyle: w.italic ? 'italic' : 'normal', marginRight: '0.28em'}}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

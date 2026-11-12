import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {colors, GRAPHIC_H, GRAPHIC_W, getLayout} from '../theme';
import {sans} from '../fonts';

export const useLayout = () => {
  const {width, height} = useVideoConfig();
  return getLayout(width, height);
};

export const Background: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #1b1b1b 0%, ${colors.bg} 70%)`}}>
    {children}
  </AbsoluteFill>
);

/** Yellow pill label top-left: "04 · Tools" */
export const ChapterPill: React.FC<{label: string}> = ({label}) => {
  const L = useLayout();
  return (
    <div style={{
      position: 'absolute', top: L.pill.y, left: L.pill.x, background: colors.accent, color: '#111',
      fontFamily: sans, fontWeight: 800, fontSize: 24 * L.unit, padding: `${8 * L.unit}px ${18 * L.unit}px`, borderRadius: 999,
    }}>{label}</div>
  );
};

/**
 * Talking head picture-in-picture. ONLY the owner's own footage is used:
 * put it in /public and pass faceSrc (e.g. "face.mp4"). Never use faces from reference videos.
 * faceFit: 'cover' crops to fill, 'contain' shows the whole frame (any aspect ratio of your clip).
 */
export const FaceCard: React.FC<{faceSrc?: string; faceFit?: 'cover' | 'contain'}> = ({faceSrc, faceFit = 'cover'}) => {
  const L = useLayout();
  const f = L.face;
  return (
    <div style={{
      position: 'absolute', left: f.x, top: f.y, width: f.w, height: f.h, borderRadius: f.radius,
      overflow: 'hidden', background: '#2a2a2a', boxShadow: '0 20px 60px rgba(0,0,0,.6)',
      border: `1px solid ${colors.cardBorder}`,
    }}>
      {faceSrc ? (
        <OffthreadVideo src={staticFile(faceSrc)} style={{width: '100%', height: '100%', objectFit: faceFit}} />
      ) : (
        <div style={{color: colors.dim, fontFamily: sans, display: 'flex', height: '100%',
          alignItems: 'center', justifyContent: 'center', fontSize: 28 * L.unit, textAlign: 'center', padding: 20}}>
          your face cam{'\n'}(faceSrc)
        </div>
      )}
    </div>
  );
};

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{
    background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 28,
    padding: 36, boxShadow: '0 24px 70px rgba(0,0,0,.55)', ...style,
  }}>{children}</div>
);

/** Graphics are authored on a 984x700 box and scaled to fit the slot, so they work at any frame size. */
export const GraphicSlot: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {graphic: g} = useLayout();
  const s = Math.min(g.w / GRAPHIC_W, g.h / GRAPHIC_H);
  return (
    <div style={{position: 'absolute', left: g.x, top: g.y, width: g.w, height: g.h,
      display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: GRAPHIC_W, height: GRAPHIC_H, flex: 'none', transform: `scale(${s})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    </div>
  );
};

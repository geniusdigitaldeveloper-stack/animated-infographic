import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {colors, layout} from '../theme';
import {sans} from '../fonts';

export const Background: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #1b1b1b 0%, ${colors.bg} 70%)`}}>
    {children}
  </AbsoluteFill>
);

/** Yellow pill label top-left: "04 · Tools" */
export const ChapterPill: React.FC<{label: string}> = ({label}) => (
  <div style={{
    position: 'absolute', top: 70, left: layout.pad, background: colors.accent, color: '#111',
    fontFamily: sans, fontWeight: 800, fontSize: 24, padding: '8px 18px', borderRadius: 999,
  }}>{label}</div>
);

/** Talking head picture-in-picture. Pass faceSrc (file in /public). Falls back to a placeholder. */
export const FaceCard: React.FC<{faceSrc?: string}> = ({faceSrc}) => (
  <div style={{
    position: 'absolute', top: layout.faceTop, left: (1080 - layout.faceWidth) / 2,
    width: layout.faceWidth, height: layout.faceHeight, borderRadius: layout.faceRadius,
    overflow: 'hidden', background: '#2a2a2a', boxShadow: '0 20px 60px rgba(0,0,0,.6)',
    border: `1px solid ${colors.cardBorder}`,
  }}>
    {faceSrc ? (
      <OffthreadVideo src={staticFile(faceSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    ) : (
      <div style={{color: colors.dim, fontFamily: sans, display: 'flex', height: '100%',
        alignItems: 'center', justifyContent: 'center', fontSize: 28}}>face cam (faceSrc)</div>
    )}
  </div>
);

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{
    background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: 28,
    padding: 36, boxShadow: '0 24px 70px rgba(0,0,0,.55)', ...style,
  }}>{children}</div>
);

export const GraphicSlot: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', top: layout.graphicTop, left: layout.pad, right: layout.pad,
    height: layout.graphicHeight, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {children}
  </div>
);
export {Img};

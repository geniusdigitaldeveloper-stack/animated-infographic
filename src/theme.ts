// Single source of truth for the look. Change values here, everything follows.
export const FPS = 30;
// Default size only. The frame is adjustable: pass {width,height} props (Studio sidebar or --props) or pick a preset.
export const WIDTH = 1080;
export const HEIGHT = 1920; // 9:16 reel (default)
export const presets = {
  reel: {width: 1080, height: 1920}, // 9:16  TikTok / Reels / Shorts
  landscape: {width: 1920, height: 1080}, // 16:9  YouTube
  square: {width: 1080, height: 1080}, // 1:1
  portrait: {width: 1080, height: 1350}, // 4:5  Instagram feed
} as const;

export const colors = {
  bg: '#0b0b0b',
  card: '#161616',
  cardBorder: 'rgba(255,255,255,0.08)',
  text: '#f5f5f5',
  dim: 'rgba(255,255,255,0.28)', // words not yet spoken
  accent: '#ffd60a', // the ONE accent: yellow
  danger: '#e5333b', // only for "paid / locked / wrong"
  ok: '#ffd60a',
};

export type Rect = {x: number; y: number; w: number; h: number};
export type Layout = {
  mode: 'stack' | 'side';
  unit: number; // scale factor for text/UI so it stays readable at any size
  pill: {x: number; y: number};
  graphic: Rect; // graphics are designed on a 984x700 box and scaled to fit this rect
  caption: Rect & {fontSize: number};
  face: Rect & {radius: number};
};
export const GRAPHIC_W = 984;
export const GRAPHIC_H = 700;

/**
 * Layout adapts to ANY width/height.
 * - tall frames (9:16, 4:5): STACK  = graphic top, subtitle middle, face bottom
 * - wide/square frames (16:9, 1:1): SIDE = graphic left, face right, subtitle across the bottom
 */
export const getLayout = (W: number, H: number): Layout => {
  const u = W >= H ? Math.min(W, H) / 1080 : W / 1080;
  const pad = 48 * u;
  if (H / W >= 1.2) {
    const faceW = Math.min(W - 2 * pad, 560 * u);
    const faceH = Math.min(H * 0.23, faceW * 0.8);
    return {
      mode: 'stack', unit: u, pill: {x: pad, y: H * 0.036},
      graphic: {x: pad, y: H * 0.078, w: W - 2 * pad, h: H * 0.365},
      caption: {x: pad, y: H * 0.49, w: W - 2 * pad, h: H * 0.135, fontSize: type.caption * u},
      face: {x: (W - faceW) / 2, y: H * 0.667, w: faceW, h: faceH, radius: 36 * u},
    };
  }
  const top = H * 0.14, mid = H * 0.58;
  return {
    mode: 'side', unit: u, pill: {x: pad, y: H * 0.05},
    graphic: {x: pad, y: top, w: W * 0.56, h: mid},
    caption: {x: pad, y: H * 0.76, w: W - 2 * pad, h: H * 0.2, fontSize: type.caption * u},
    face: {x: W * 0.64, y: top, w: W * 0.32, h: mid, radius: 36 * u},
  };
};

export const type = {
  caption: 72, // serif, word-by-word
  title: 64,
  body: 30,
  mono: 26,
  pill: 24,
};

/**
 * OWNER'S SUBTITLE STYLE — the only subtitle style used in this repo.
 * Edit here to change every caption. Never copy subtitles/text from reference videos.
 */
export const captionStyle = {
  wordsPerChunk: 4,
  spoken: colors.text, // already said
  active: colors.accent, // being said now
  glow: 'rgba(255,214,10,.45)',
  popFrom: 0.72, // scale at first frame of a word
  rise: 26, // px a word rises while popping in
  blur: 8, // px blur at first frame
  fadeFrames: 4,
  beat: 0.06, // extra scale on the active word
};

/**
 * Voice-over reels (no face cam). Everything sits inside the platform SAFE ZONE
 * (TikTok/Reels UI covers the top bar, the right-hand buttons and the bottom caption area).
 * tall: graphic top, subtitle under it · wide: graphic left, subtitle bottom.
 */
export const safeZone = {top: 0.085, bottom: 0.21, left: 0.06, right: 0.13}; // fractions of the frame
export type ReelLayout = {unit: number; safe: Rect; pill: {x: number; y: number}; graphic: Rect; caption: Rect & {fontSize: number}};
export const getReelLayout = (W: number, H: number): ReelLayout => {
  const u = W >= H ? Math.min(W, H) / 1080 : W / 1080;
  const safe = {x: W * safeZone.left, y: H * safeZone.top, w: W * (1 - safeZone.left - safeZone.right), h: H * (1 - safeZone.top - safeZone.bottom)};
  const pillH = 60 * u;
  if (H / W >= 1.2) {
    const capH = safe.h * 0.22;
    return {unit: u, safe, pill: {x: safe.x, y: safe.y},
      graphic: {x: safe.x, y: safe.y + pillH + 20 * u, w: safe.w, h: safe.h - pillH - capH - 40 * u},
      caption: {x: safe.x, y: safe.y + safe.h - capH, w: safe.w, h: capH, fontSize: type.caption * u}};
  }
  const capH = safe.h * 0.24;
  return {unit: u, safe, pill: {x: safe.x, y: safe.y},
    graphic: {x: safe.x, y: safe.y + pillH + 10 * u, w: safe.w, h: safe.h - pillH - capH - 20 * u},
    caption: {x: safe.x, y: safe.y + safe.h - capH, w: safe.w, h: capH, fontSize: type.caption * 0.85 * u}};
};

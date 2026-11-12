// Single source of truth for the look. Change values here, everything follows.
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920; // 9:16 reel

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

// Layout: graphic on top, caption in the middle, face picture-in-picture at the bottom.
export const layout = {
  pad: 48,
  graphicTop: 150,
  graphicHeight: 700,
  captionTop: 940,
  captionHeight: 260,
  faceTop: 1280,
  faceWidth: 560,
  faceHeight: 440,
  faceRadius: 36,
};

export const type = {
  caption: 72, // serif, word-by-word
  title: 64, // bold sans
  body: 30,
  mono: 26,
  pill: 24,
};

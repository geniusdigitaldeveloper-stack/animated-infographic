export type Word = {text: string; start: number; end: number}; // seconds
export type Line = {words: Word[]};
export type Scene = {
  id: string;
  chapter: string; // e.g. "04 · Tools"
  duration: number; // seconds
  caption: string; // plain text; wrap *word* to render it italic
  graphic: string; // key into the graphics registry
};

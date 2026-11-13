import plan from './plan.json';
import cursor from './cursor.json';

export type Clip = {src0: number; src1: number; rate: number; out0: number; out1: number; kind: string};
export const P = plan as unknown as {
  fps: number; duration: number; clips: Clip[];
  subs: {out0: number; out1: number; text: string; words: {text: string; start: number; end: number}[]}[];
  steps: {out0: number; out1: number; num: number; label: string}[];
  clicks: {out: number; x: number; y: number; src: number; bx: number; by: number; bw: number; bh: number; snap: boolean}[];
  dwells: {out: number; x: number; y: number; src: number; bx: number; by: number}[];
};
export const HOOK_S = 0; // NO opening hook clip (owner removed it): video starts from the beginning
export const OUTRO_S = 6.5;
export const MAIN_S = P.duration;
export const TOTAL_S = HOOK_S + MAIN_S + OUTRO_S;

export const srcTimeAt = (outT: number): number => {
  for (const c of P.clips) if (outT >= c.out0 && outT < c.out1) return c.src0 + (outT - c.out0) * c.rate;
  return P.clips[P.clips.length - 1].src1;
};
const cur = cursor as unknown as {x: number[]; y: number[]; found: boolean[]; fps: number; w: number; h: number};
/** true when the cursor was really detected near this source time (never guess). */
export const cursorSeen = (ts: number, w = 0.2) => {
  const a = Math.max(0, Math.floor((ts - w) * cur.fps)), b = Math.min(cur.found.length - 1, Math.ceil((ts + w) * cur.fps));
  for (let i = a; i <= b; i++) if (cur.found[i]) return true;
  return false;
};
/** Cursor position (in 1280x720 source space) at source time. */
export const cursorAtSrc = (ts: number) => {
  const f = Math.min(cur.x.length - 1, Math.max(0, ts * cur.fps));
  const i = Math.floor(f), j = Math.min(cur.x.length - 1, i + 1), k = f - i;
  return {x: cur.x[i] * (1 - k) + cur.x[j] * k, y: cur.y[i] * (1 - k) + cur.y[j] * k};
};
export const cursorAt = (outT: number) => cursorAtSrc(srcTimeAt(outT));
export const CW = cur.w, CH = cur.h;

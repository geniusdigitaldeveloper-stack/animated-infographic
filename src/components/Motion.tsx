import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';
import {sans} from '../fonts';

/**
 * Motion kit for VO-driven infographic reels.
 * Every element takes `at` = seconds (relative to its Sequence) of the word that triggers it,
 * so visuals land exactly when the word is spoken.
 */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const useLocal = (at: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - Math.round(at * fps);
  return {f, t: f / fps, fps, frame};
};

/** Pop-in (spring scale + rise), used for fact cards and chips. */
export const usePop = (at: number) => {
  const {f, fps} = useLocal(at);
  const p = spring({frame: f, fps, config: {damping: 13, stiffness: 200, mass: 0.6}});
  return {
    opacity: interpolate(f, [0, 4], [0, 1], clamp),
    transform: `translateY(${(1 - p) * 40}px) scale(${0.6 + 0.4 * p})`,
    p,
  };
};

/** Cartoon squash & stretch entrance for big keywords: falls in stretched, squashes on landing, wobbles to rest. */
export const Squash: React.FC<{at: number; size?: number; color?: string; children: React.ReactNode; italic?: boolean}> =
  ({at, size = 200, color = colors.accent, children, italic}) => {
    const {t} = useLocal(at);
    let sy = 1, y = 0;
    if (t < 0) { sy = 1; y = 0; }
    else if (t < 0.12) { const k = t / 0.12; y = -160 * (1 - k * k); sy = 1.35 - 0.1 * k; }
    else { const u = t - 0.12; sy = 1 - 0.42 * Math.cos(2 * Math.PI * 3.4 * u) * Math.exp(-7 * u); }
    const sx = Math.min(1.5, Math.pow(1 / Math.max(0.3, sy), 0.75));
    return (
      <div style={{
        fontFamily: sans, fontWeight: 800, fontSize: size, lineHeight: 1, color, letterSpacing: -2,
        fontStyle: italic ? 'italic' : 'normal', transformOrigin: '50% 100%', opacity: t < 0 ? 0 : interpolate(t, [0, 0.05], [0, 1], clamp),
        transform: `translateY(${y}px) scale(${sx}, ${sy})`, textAlign: 'center',
      }}>{children}</div>
    );
  };

/** Number count-up with a bounce when it lands. */
export const CountUp: React.FC<{at: number; to: number; dur?: number; size?: number}> = ({at, to, dur = 0.75, size = 260}) => {
  const {t, f, fps} = useLocal(at);
  const k = interpolate(t, [0, dur], [0, 1], clamp);
  const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
  const land = spring({frame: f - Math.round(dur * fps), fps, config: {damping: 6, stiffness: 260, mass: 0.5}});
  const filling = t >= 0 && t < dur ? 1 + 0.04 * Math.sin(t * 60) : 1;
  const bounce = t >= dur ? 1 + 0.18 * (1 - land) * Math.sign(1 - land + 0.0001) : filling;
  return (
    <div style={{fontFamily: sans, fontWeight: 800, fontSize: size, lineHeight: 1, color: colors.accent, letterSpacing: -6,
      opacity: t < 0 ? 0 : 1, transform: `scale(${t < 0 ? 0.6 : bounce})`, fontVariantNumeric: 'tabular-nums', textAlign: 'center'}}>
      {v.toLocaleString('en-US')}
    </div>
  );
};

/** Floating "thinking" question marks. */
export const QuestionMarks: React.FC<{at: number}> = ({at}) => {
  const {t} = useLocal(at);
  if (t < 0) return null;
  const marks = [{x: -300, y: -40, s: 150, d: 0}, {x: 290, y: -90, s: 110, d: 0.15}, {x: 220, y: 120, s: 80, d: 0.3}, {x: -250, y: 150, s: 70, d: 0.45}];
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {marks.map((m, i) => {
        const u = t - m.d;
        const o = interpolate(u, [0, 0.25], [0, i === 0 ? 1 : 0.55], clamp);
        const pop = interpolate(u, [0, 0.18, 0.32], [0.3, 1.2, 1], clamp);
        return (
          <div key={i} style={{position: 'absolute', left: '50%', top: '42%', fontFamily: sans, fontWeight: 800,
            fontSize: m.s, color: i === 0 ? colors.accent : colors.text, opacity: o,
            transform: `translate(${m.x + Math.sin(u * 1.6 + i) * 10}px, ${m.y + Math.sin(u * 2.2 + i * 2) * 18}px) translate(-50%,-50%) rotate(${Math.sin(u * 1.3 + i) * 12}deg) scale(${pop})`}}>?</div>
        );
      })}
    </div>
  );
};

/** Line-style icons (24x24, stroke). Each icon draws itself on at `at`. */
const ICONS: Record<string, string[]> = {
  alert: ['M12 3 L22 20 H2 Z', 'M12 9 v5', 'M12 17.2 v.6'],
  pin: ['M12 21 s-7 -6.2 -7 -11 a7 7 0 0 1 14 0 c0 4.8 -7 11 -7 11 z', 'M12 7.5 a2.5 2.5 0 1 0 0.01 0'],
  ruler: ['M2 8 h20 v8 h-20 z', 'M6 8 v3', 'M10 8 v4', 'M14 8 v3', 'M18 8 v4'],
  apple: ['M12 7 c-2 -2 -7 -1.5 -7 4 c0 4 3 9 5 9 c1 0 1.3 -.6 2 -.6 s1 .6 2 .6 c2 0 5 -5 5 -9 c0 -5.5 -5 -6 -7 -4 z', 'M12 7 c0 -2 1 -3.5 3 -4'],
  brain: ['M12 5 a3 3 0 0 0 -5.5 1.5 a3 3 0 0 0 -2 5 a3 3 0 0 0 2 5 a3 3 0 0 0 5.5 1.5 z', 'M12 5 a3 3 0 0 1 5.5 1.5 a3 3 0 0 1 2 5 a3 3 0 0 1 -2 5 a3 3 0 0 1 -5.5 1.5', 'M12 5 v13'],
  shield: ['M12 3 l8 3 v6 c0 5 -3.5 8 -8 9 c-4.5 -1 -8 -4 -8 -9 V6 z', 'M9 12 l2 2 l4 -4'],
  trend: ['M3 17 l6 -6 l4 4 l8 -8', 'M15 7 h6 v6'],
  heart: ['M12 20 s-8 -5 -8 -11 a4.5 4.5 0 0 1 8 -2.8 a4.5 4.5 0 0 1 8 2.8 c0 6 -8 11 -8 11 z'],
  home: ['M3 11 l9 -7 l9 7', 'M5 10 v10 h14 V10', 'M10 20 v-6 h4 v6'],
  bolt: ['M13 2 L4 14 h7 l-1 8 l9 -12 h-7 z'],
  battery: ['M2 7 h17 v10 h-17 z', 'M21.5 10.5 v3', 'M5 10 v4'],
  calendar: ['M3 5 h18 v16 h-18 z', 'M3 10 h18', 'M8 3 v4', 'M16 3 v4'],
  book: ['M4 5 a2 2 0 0 1 2 -2 h13 v16 h-13 a2 2 0 0 0 -2 2 z', 'M4 19 v2', 'M9 8 h6'],
  star: ['M12 3 l2.7 5.6 l6.1 .9 l-4.4 4.3 l1 6.1 l-5.4 -2.9 l-5.4 2.9 l1 -6.1 l-4.4 -4.3 l6.1 -.9 z'],
  scale: ['M12 3 v18', 'M7 21 h10', 'M4 7 h16', 'M4 7 l-2.5 6 a2.5 2.5 0 0 0 5 0 z', 'M20 7 l-2.5 6 a2.5 2.5 0 0 0 5 0 z'],
  hand: ['M7 11 V5.5 a1.5 1.5 0 0 1 3 0 V10', 'M10 10 V4 a1.5 1.5 0 0 1 3 0 v6', 'M13 10 V5 a1.5 1.5 0 0 1 3 0 v6', 'M16 11 V8 a1.5 1.5 0 0 1 3 0 v6 a7 7 0 0 1 -7 7 h-1 a6 6 0 0 1 -5 -3 l-3 -5 a1.5 1.5 0 0 1 2.5 -1.5 L7 13'],
  x: ['M12 3 a9 9 0 1 0 0.01 0', 'M8.5 8.5 l7 7', 'M15.5 8.5 l-7 7'],
  check: ['M12 3 a9 9 0 1 0 0.01 0', 'M8 12.5 l3 3 l5 -6'],
};

export const LineIcon: React.FC<{name: keyof typeof ICONS | string; at: number; size?: number; color?: string; draw?: number}> =
  ({name, at, size = 96, color = colors.accent, draw = 0.5}) => {
    const {t} = useLocal(at);
    const k = interpolate(t, [0, draw], [0, 1], clamp);
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7}
        strokeLinecap="round" strokeLinejoin="round" style={{opacity: t < 0 ? 0 : 1, flex: 'none'}}>
        {(ICONS[name] ?? []).map((d, i) => (
          <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
        ))}
      </svg>
    );
  };

/** Fact card: line icon + text, pops in on its word. */
export const FactCard: React.FC<{at: number; icon: string; title: string; sub?: string; hot?: boolean; wrong?: boolean; width?: number | string}> =
  ({at, icon, title, sub, hot, wrong, width = '100%'}) => {
    const s = usePop(at);
    return (
      <div style={{width, opacity: s.opacity, transform: s.transform, background: colors.card, borderRadius: 28, padding: '30px 32px',
        border: `2px solid ${hot ? colors.accent : colors.cardBorder}`, boxShadow: hot ? '0 0 60px rgba(255,214,10,.18)' : '0 24px 70px rgba(0,0,0,.5)',
        display: 'flex', alignItems: 'center', gap: 24, boxSizing: 'border-box'}}>
        <LineIcon name={icon} at={at} size={78} color={wrong ? colors.danger : hot ? colors.accent : colors.text} />
        <div>
          <div style={{fontFamily: sans, fontWeight: 800, fontSize: 46, color: hot ? colors.accent : colors.text, lineHeight: 1.05}}>{title}</div>
          {sub && <div style={{fontFamily: sans, fontWeight: 500, fontSize: 28, color: 'rgba(255,255,255,.55)', marginTop: 6}}>{sub}</div>}
        </div>
      </div>
    );
  };

/** Small label that fades/slides in (source line, kicker). */
export const Kicker: React.FC<{at: number; children: React.ReactNode; color?: string; size?: number}> = ({at, children, color = 'rgba(255,255,255,.6)', size = 30}) => {
  const {t} = useLocal(at);
  return (
    <div style={{fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: 4, textTransform: 'uppercase', color, textAlign: 'center',
      opacity: interpolate(t, [0, 0.3], [0, 1], clamp), transform: `translateY(${interpolate(t, [0, 0.3], [16, 0], clamp)}px)`}}>{children}</div>
  );
};

/** Animated straight line (live line-draw). */
export const DrawLine: React.FC<{at: number; dur?: number; x1: number; y1: number; x2: number; y2: number; color?: string; width?: number}> =
  ({at, dur = 0.4, x1, y1, x2, y2, color = colors.accent, width = 6}) => {
    const {t} = useLocal(at);
    const k = interpolate(t, [0, dur], [0, 1], clamp);
    return <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={t < 0 ? 0 : 1} />;
  };

/** Two-column comparison: left appears first, then right. */
export const Compare: React.FC<{
  left: {at: number; kicker: string; title: string; icon: string; strikeAt?: number};
  right: {at: number; kicker: string; title: string; icon: string};
  minHeight?: number;
}> = ({left, right, minHeight = 520}) => {
  const L = usePop(left.at);
  const R = usePop(right.at);
  const strike = useLocal(left.strikeAt ?? 1e9);
  const sk = interpolate(strike.t, [0, 0.35], [0, 1], clamp);
  const col = (side: 'l' | 'r'): React.CSSProperties => ({
    flex: 1, background: colors.card, borderRadius: 30, padding: '40px 28px', textAlign: 'center', boxSizing: 'border-box',
    border: `2px solid ${side === 'r' ? colors.accent : colors.cardBorder}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
    boxShadow: side === 'r' ? '0 0 70px rgba(255,214,10,.16)' : '0 24px 70px rgba(0,0,0,.5)', minHeight, justifyContent: 'center',
  });
  return (
    <div style={{display: 'flex', gap: 28, width: '100%'}}>
      <div style={{...col('l'), opacity: L.opacity * (1 - 0.45 * sk), transform: L.transform}}>
        <LineIcon name={left.icon} at={left.at} size={110} color={colors.text} />
        <div style={{fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: 'rgba(255,255,255,.55)'}}>{left.kicker}</div>
        <div style={{position: 'relative', fontFamily: sans, fontWeight: 800, fontSize: 64, color: colors.text, lineHeight: 1.05}}>
          {left.title}
          <div style={{position: 'absolute', left: -8, top: '52%', height: 7, borderRadius: 4, width: `calc(${sk * 100}% + 16px)`, background: colors.danger}} />
        </div>
      </div>
      <div style={{...col('r'), opacity: R.opacity, transform: R.transform}}>
        <LineIcon name={right.icon} at={right.at} size={110} />
        <div style={{fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: colors.accent}}>{right.kicker}</div>
        <div style={{fontFamily: sans, fontWeight: 800, fontSize: 56, color: colors.text, lineHeight: 1.08}}>{right.title}</div>
      </div>
    </div>
  );
};

/** Vertical process diagram: nodes appear on their word, the connecting line draws live between them. */
export const Process: React.FC<{title: string; titleAt: number; steps: {at: number; icon: string; title: string; sub: string}[]; rowH?: number}> = ({title, titleAt, steps, rowH = 210}) => {
  const top = 120;
  return (
    <div style={{position: 'relative', width: '100%', height: top + rowH * steps.length}}>
      <Kicker at={titleAt} color={colors.accent} size={34}>{title}</Kicker>
      <svg width={900} height={top + rowH * steps.length} style={{position: 'absolute', left: 0, top: 0}}>
        {steps.slice(1).map((s, i) => (
          <DrawLine key={i} at={s.at - 0.4} dur={0.4} x1={95} y1={top + rowH * i + 150} x2={95} y2={top + rowH * (i + 1) + 30} />
        ))}
      </svg>
      {steps.map((s, i) => <ProcessRow key={i} {...s} y={top + rowH * i} />)}
    </div>
  );
};

const ProcessRow: React.FC<{at: number; icon: string; title: string; sub: string; y: number}> = ({at, icon, title, sub, y}) => {
  const s = usePop(at);
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: '100%', display: 'flex', alignItems: 'center', gap: 34, opacity: s.opacity}}>
      <div style={{width: 180, height: 180, borderRadius: 999, border: `4px solid ${colors.accent}`, background: colors.card,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * s.p})`, flex: 'none', marginLeft: 5}}>
        <LineIcon name={icon} at={at} size={96} />
      </div>
      <div style={{transform: s.transform, transformOrigin: 'left center'}}>
        <div style={{fontFamily: sans, fontWeight: 800, fontSize: 58, color: colors.text, lineHeight: 1.05}}>{title}</div>
        <div style={{fontFamily: sans, fontWeight: 500, fontSize: 30, color: 'rgba(255,255,255,.55)', marginTop: 6}}>{sub}</div>
      </div>
    </div>
  );
};

/** Horizontal timeline drawn live: dot → line → dot. */
export const Timeline: React.FC<{points: {at: number; label: string; hot?: boolean}[]}> = ({points}) => {
  const W = 860, y = 60, xs = points.map((_, i) => 60 + (i * (W - 120)) / (points.length - 1));
  return (
    <div style={{position: 'relative', width: W, height: 150}}>
      <svg width={W} height={150} style={{position: 'absolute'}}>
        <line x1={xs[0]} y1={y} x2={xs[xs.length - 1]} y2={y} stroke="rgba(255,255,255,.08)" strokeWidth={6} strokeLinecap="round" />
        {points.slice(1).map((p, i) => <DrawLine key={i} at={points[i].at} dur={Math.max(0.2, p.at - points[i].at)} x1={xs[i]} y1={y} x2={xs[i + 1]} y2={y} />)}
      </svg>
      {points.map((p, i) => <TimelineDot key={i} {...p} x={xs[i]} y={y} />)}
    </div>
  );
};

const TimelineDot: React.FC<{at: number; label: string; hot?: boolean; x: number; y: number}> = ({at, label, hot, x, y}) => {
  const s = usePop(at);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: s.opacity, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{width: 34, height: 34, borderRadius: 99, background: hot ? colors.accent : colors.bg, border: `5px solid ${colors.accent}`, transform: `scale(${0.4 + 0.6 * s.p})`, marginTop: 52}} />
      <div style={{fontFamily: sans, fontWeight: 700, fontSize: 32, color: hot ? colors.accent : colors.text, marginTop: 14, whiteSpace: 'nowrap'}}>{label}</div>
    </div>
  );
};

/** Slow push-in for the closing / most important line. */
export const SlowZoom: React.FC<{at: number; children: React.ReactNode; to?: number; dur?: number}> = ({at, children, to = 1.12, dur = 4}) => {
  const {t} = useLocal(at);
  const z = interpolate(t, [0, dur], [1, to], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 2)});
  return <div style={{transform: `scale(${z})`, opacity: interpolate(t, [0, 0.4], [0, 1], clamp)}}>{children}</div>;
};

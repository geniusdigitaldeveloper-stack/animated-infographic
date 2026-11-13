import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {tutorial as T} from '../theme';
import {sans} from '../fonts';
import {Caption} from '../components/Caption';
import {CH, CW, cursorAt, cursorAtSrc, HOOK_S, MAIN_S, OUTRO_S, P, srcTimeAt, TOTAL_S} from './timeline';

const FPS = T.FPS;
const sf = (p: string) => staticFile(p);
const fr = T.frame;

/* ---------- bright animated background (theme: blue/cyan like the logos) ---------- */
const Background: React.FC = () => {
  const f = useCurrentFrame() / FPS;
  const orb = (cx: number, cy: number, r: number, c: string, sx: number, sy: number, ph: number) => (
    <div style={{position: 'absolute', left: cx + Math.sin(f * sx + ph) * 120 - r, top: cy + Math.cos(f * sy + ph) * 90 - r,
      width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${c} 0%, transparent 68%)`}} />
  );
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${T.bg[0]}, ${T.bg[1]})`}}>
      {orb(300, 260, 520, 'rgba(56,189,248,.35)', 0.35, 0.28, 0)}
      {orb(1650, 220, 460, 'rgba(99,102,241,.22)', 0.25, 0.33, 2)}
      {orb(1500, 900, 560, 'rgba(14,165,233,.28)', 0.3, 0.22, 4)}
      {orb(380, 930, 420, 'rgba(255,90,90,.10)', 0.22, 0.3, 1)}
      <div style={{position: 'absolute', inset: 0, opacity: 0.5,
        backgroundImage: 'linear-gradient(rgba(30,64,175,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(30,64,175,.06) 1px, transparent 1px)',
        backgroundSize: '64px 64px', backgroundPosition: `${(f * 8) % 64}px ${(f * 5) % 64}px`}} />
      {Array.from({length: 14}).map((_, i) => {
        const x = i < 7 ? 70 + i * 22 : 1700 + (i - 7) * 24; const sz = 10 + (i % 3) * 6;
        const y = 1080 - (((f * (24 + i * 4)) + i * 180) % 1200);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, background: 'rgba(37,99,235,.28)', borderRadius: 3}} />;
      })}
      <svg width={1920} height={240} style={{position: 'absolute', bottom: 0, left: 0}} viewBox="0 0 1920 240">
        {[0, 1].map((k) => {
          const a = 26 + k * 14, ph = f * (0.6 + k * 0.3) + k * 2;
          const d = Array.from({length: 49}).map((_, i) => `${i === 0 ? 'M' : 'L'}${i * 40},${150 + k * 30 + Math.sin(i * 0.32 + ph) * a}`).join(' ');
          return <path key={k} d={`${d} L1920,240 L0,240 Z`} fill={k ? 'rgba(37,99,235,.10)' : 'rgba(56,189,248,.14)'} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- logos on the left: each pops on its own every 100s (no grouping) ---------- */
const popAnim = (f: number, times: number[]) => {
  let s = 0, rot = 0;
  for (const tt of times) {
    const l = f - tt * FPS;
    if (l >= 0 && l < FPS * 1.6) {
      const p = spring({frame: l, fps: FPS, config: {damping: 7, stiffness: 160, mass: 0.7}});
      s = Math.max(s, (p - 1) * 0.32 + (tt === times[0] ? 0 : 0)); rot = Math.sin(l * 0.5) * 6 * Math.exp(-l / 12);
    }
  }
  return {s, rot};
};
const SideLogo: React.FC<{src: string; y: number; first: number; round?: boolean}> = ({src, y, first, round}) => {
  const frame = useCurrentFrame();
  const times: number[] = []; for (let t = first; t < TOTAL_S - OUTRO_S - 1; t += 100) times.push(t);
  const enter = spring({frame: frame - first * FPS, fps: FPS, config: {damping: 12, stiffness: 120}});
  const {s, rot} = popAnim(frame, times.slice(1));
  const outT = TOTAL_S - OUTRO_S;
  const fade = interpolate(frame / FPS, [outT - 0.5, outT], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = Math.max(0, s) * 2;
  return (
    <div style={{position: 'absolute', left: T.logos.x, top: y, width: T.logos.size, height: T.logos.size, opacity: fade * Math.min(1, enter),
      transform: `scale(${(0.4 + 0.6 * Math.min(enter, 1.05)) * (1 + s)}) rotate(${rot}deg)`, filter: `drop-shadow(0 10px 24px rgba(30,64,175,${0.25 + glow * 0.3}))`}}>
      <Img src={sf(src)} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: round ? 40 : 0}} />
    </div>
  );
};

/* ---------- video frame with cursor effects (ring + red click ripple) and gentle cinematic zoom ---------- */
const sc = fr.w / CW; // 1280-space -> frame px
const Ripple: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const l = t - at; if (l < 0 || l > 0.9) return null;
  const ring = (d: number, size: number) => {
    const k = Math.max(0, l - d) / 0.6; if (k <= 0 || k > 1) return null;
    const r = 10 + k * size; return <div style={{position: 'absolute', left: x * sc - r, top: y * sc - r, width: r * 2, height: r * 2,
      borderRadius: '50%', border: `${4 - k * 2.5}px solid rgba(255,45,45,${1 - k})`, boxShadow: `0 0 ${14 * (1 - k)}px rgba(255,45,45,${0.6 * (1 - k)})`}} />;
  };
  const dot = Math.max(0, 1 - l / 0.25);
  return <>{ring(0, 70)}{ring(0.14, 100)}<div style={{position: 'absolute', left: x * sc - 9, top: y * sc - 9, width: 18, height: 18, borderRadius: '50%', background: `rgba(255,45,45,${dot})`}} /></>;
};

const VideoFrame: React.FC<{mode: 'hook' | 'main'; t: number; children: React.ReactNode; zoomOverride?: number}> = ({mode, t, children, zoomOverride}) => {
  const ts = mode === 'hook' ? P.hook.src0 + t : srcTimeAt(t);
  const c = cursorAtSrc(ts);
  let zoom = 1;
  if (mode === 'main') for (const k of P.clicks) {
    const d = t - k.out; if (d > -0.35 && d < 1.3) zoom = Math.max(zoom, 1 + 0.2 * Math.sin(Math.PI * Math.min(1, Math.max(0, (d + 0.35) / 1.65))) );
  }
  if (zoomOverride) zoom = zoomOverride;
  const ringOn = mode === 'main' ? P.dwells.some((d) => t > d.out - 0.05 && t < d.out + 1.1) : false;
  const rk = mode === 'main' ? P.dwells.find((d) => t > d.out - 0.05 && t < d.out + 1.1) : undefined;
  return (
    <div style={{position: 'absolute', left: fr.x, top: fr.y, width: fr.w, height: fr.h, borderRadius: fr.radius, overflow: 'hidden',
      boxShadow: '0 30px 80px rgba(30,64,175,.28), 0 2px 0 rgba(255,255,255,.8) inset', border: '1px solid rgba(255,255,255,.9)', background: '#fff'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${c.x * sc}px ${c.y * sc}px`, transform: `scale(${zoom})`, filter: T.grade}}>
        {children}
        {ringOn && rk && (() => {
          const k = Math.min(1, (t - rk.out + 0.05) / 0.25), fade = Math.min(1, (rk.out + 1.1 - t) / 0.4);
          const r = 40 + (1 - k) * 30; return <div style={{position: 'absolute', left: rk.x * sc - r, top: rk.y * sc - r, width: r * 2, height: r * 2, borderRadius: '50%',
            border: '3px solid rgba(255,255,255,.95)', boxShadow: '0 0 22px rgba(56,189,248,.95), inset 0 0 14px rgba(56,189,248,.5)', opacity: fade}} />;
        })()}
        {mode === 'main' && P.clicks.map((k, i) => <Ripple key={i} t={t} at={k.out} x={k.x} y={k.y} />)}
        {mode === 'hook' && <Ripple t={t} at={1.0} x={cursorAtSrc(P.hook.src0 + 1.0).x} y={cursorAtSrc(P.hook.src0 + 1.0).y} />}
      </div>
    </div>
  );
};

const MainClips: React.FC = () => (
  <>{P.clips.map((c, i) => (
    <Sequence key={i} from={Math.round(c.out0 * FPS)} durationInFrames={Math.max(1, Math.round((c.out1 - c.out0) * FPS))} premountFor={FPS}>
      <OffthreadVideo src={sf('tutorial/proxy.mp4')} startFrom={Math.round(c.src0 * FPS)} playbackRate={c.rate} muted={c.kind === 'gap'}
        style={{width: fr.w, height: fr.h, objectFit: 'cover'}} />
    </Sequence>))}</>
);

/* ---------- text lives BELOW the frame: step callout (follows mouse x) + subtitle bar ---------- */
const Callout: React.FC<{t: number}> = ({t}) => {
  const step = P.steps.find((s) => t >= s.out0 && t < s.out1); if (!step) return null;
  const w = 540; const avg = [-0.3, -0.15, 0, 0.15, 0.3].map((d) => cursorAt(Math.max(0, t + d)).x).reduce((a, b) => a + b, 0) / 5;
  const cx = Math.min(fr.x + fr.w - w, Math.max(fr.x, fr.x + avg * sc - w / 2));
  const l = t - step.out0; const p = Math.min(1, l / 0.3) * Math.min(1, (step.out1 - t) / 0.3);
  return (
    <div style={{position: 'absolute', left: cx, top: T.callout.y, width: w, height: T.callout.h, opacity: p, transform: `translateY(${(1 - p) * 10}px)`,
      display: 'flex', alignItems: 'center', gap: 12, fontFamily: sans}}>
      <span style={{width: 40, height: 40, borderRadius: 99, background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 16px rgba(37,99,235,.45)'}}>{step.num}</span>
      <span style={{background: 'rgba(255,255,255,.92)', color: T.ink, fontWeight: 700, fontSize: 26, padding: '6px 18px', borderRadius: 99, boxShadow: '0 6px 18px rgba(30,64,175,.18)', whiteSpace: 'nowrap'}}>{step.label}</span>
    </div>
  );
};
const SubBar: React.FC<{children: React.ReactNode; big?: boolean}> = ({children}) => (
  <div style={{position: 'absolute', left: T.subBar.x, top: T.subBar.y, width: T.subBar.w, height: T.subBar.h, borderRadius: T.subBar.radius,
    background: 'rgba(11,18,32,.90)', boxShadow: '0 18px 50px rgba(11,18,32,.30)'}}>{children}</div>
);
const subRect = (fs: number) => ({x: 0, y: 0, w: T.subBar.w, h: T.subBar.h, fontSize: fs});
const pal = {spoken: 'rgba(255,255,255,.92)', active: '#ffffff', glow: 'rgba(255,255,255,.5)'};

const SpeedBadge: React.FC<{t: number}> = ({t}) => {
  const c = P.clips.find((k) => t >= k.out0 && t < k.out1); if (!c || c.kind !== 'gap') return null;
  return <div style={{position: 'absolute', left: fr.x + fr.w - 150, top: T.callout.y + 2, fontFamily: sans, fontWeight: 800, fontSize: 24, color: '#2563eb', background: 'rgba(255,255,255,.92)', padding: '6px 16px', borderRadius: 99}}>⏩ {Math.round(c.rate * 10) / 10}x</div>;
};

/* ---------- sections ---------- */
const Hook: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  const zoom = 1 + 0.55 * Math.min(1, Math.max(0, (t - 0.9) / 1.6)) * (1 - 0.0);
  const sh = t > 1.0 && t < 1.18 ? (Math.random() - 0.5) * 0 : 0; void sh;
  return (
    <>
      <VideoFrame mode="hook" t={t} zoomOverride={zoom}>
        <OffthreadVideo src={sf('tutorial/proxy.mp4')} startFrom={Math.round(P.hook.src0 * FPS)} style={{width: fr.w, height: fr.h, objectFit: 'cover'}} />
      </VideoFrame>
      <SubBar><Caption text={P.hook.t} duration={HOOK_S - 0.3} rect={subRect(74)} palette={pal} unit={1.2} fontFamily={sans} /></SubBar>
      <Sequence from={Math.round(0.95 * FPS)}><Audio src={sf('audio/impact.mp3')} volume={0.85} /></Sequence>
      <Sequence from={Math.round(1.0 * FPS)}><Audio src={sf('audio/click.mp3')} volume={0.7} /></Sequence>
      <Sequence from={Math.round(3.6 * FPS)}><Audio src={sf('audio/whoosh.mp3')} volume={0.6} /></Sequence>
    </>
  );
};
const Main: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / FPS;
  return (
    <>
      <VideoFrame mode="main" t={t}><MainClips /></VideoFrame>
      <Callout t={t} /><SpeedBadge t={t} />
      <SubBar>{P.subs.map((s, i) => (
        <Sequence key={i} from={Math.round(s.out0 * FPS)} durationInFrames={Math.max(8, Math.round((s.out1 - s.out0) * FPS))}>
          <Caption text={s.text} duration={Math.max(0.4, s.out1 - s.out0 - 0.1)} rect={subRect(56)} palette={pal} unit={1} fontFamily={sans} />
        </Sequence>))}</SubBar>
      {P.clicks.map((k, i) => <Sequence key={'c' + i} from={Math.round(k.out * FPS)}><Audio src={sf('audio/click.mp3')} volume={0.55} /></Sequence>)}
      {P.steps.map((s, i) => <Sequence key={'s' + i} from={Math.round(s.out0 * FPS)}><Audio src={sf('audio/chime.mp3')} volume={0.28} /></Sequence>)}
    </>
  );
};
const iosIcon: React.CSSProperties = {borderRadius: '22.5%', boxShadow: '0 40px 90px rgba(30,64,175,.35), 0 8px 20px rgba(0,0,0,.12)', overflow: 'hidden'};
const OutroLogo: React.FC<{src: string; size: number; x: number; delay: number; squircle?: boolean}> = ({src, size, x, delay, squircle}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - delay * FPS, fps: FPS, config: {damping: 15, stiffness: 90, mass: 1}});
  const press = f > (delay + 1.1) * FPS && f < (delay + 1.5) * FPS ? 1 - 0.06 * Math.sin(Math.PI * (f / FPS - delay - 1.1) / 0.4) : 1;
  const sweep = ((f / FPS - delay - 0.5) / 1.4);
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: 400 - size / 2 + (1 - p) * 120, width: size, height: size, opacity: Math.min(1, p * 1.4),
      transform: `scale(${(0.55 + 0.45 * p) * press})`, filter: `blur(${(1 - Math.min(1, p)) * 14}px)`, ...(squircle ? iosIcon : {filter: 'drop-shadow(0 30px 50px rgba(30,64,175,.35))'})}}>
      <Img src={sf(src)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      {squircle && sweep > 0 && sweep < 1 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${sweep * 140 - 40}%, rgba(255,255,255,.55) ${sweep * 140 - 20}%, transparent ${sweep * 140}%)`}} />}
    </div>
  );
};
const Outro: React.FC = () => {
  const f = useCurrentFrame() / FPS;
  const txt = Math.min(1, Math.max(0, (f - 2.4) / 0.7));
  return (
    <>
      <OutroLogo src="tutorial/logo-app.png" size={400} x={640} delay={0.2} squircle />
      <OutroLogo src="tutorial/logo-gs.png" size={420} x={1280} delay={1.0} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: sans, color: T.ink, opacity: txt, transform: `translateY(${(1 - txt) * 16}px)`}}>
        <div style={{fontSize: 64, fontWeight: 800}}>Terima kasih!</div>
        <div style={{fontSize: 34, fontWeight: 600, marginTop: 10, color: '#2563eb'}}>Global Streamer · Selamat mencuba</div>
      </div>
      <Sequence from={Math.round(0.2 * FPS)}><Audio src={sf('audio/whoosh.mp3')} volume={0.5} /></Sequence>
      <Sequence from={Math.round(0.45 * FPS)}><Audio src={sf('audio/pop.mp3')} volume={0.7} /></Sequence>
      <Sequence from={Math.round(1.25 * FPS)}><Audio src={sf('audio/pop.mp3')} volume={0.7} /></Sequence>
      <Sequence from={Math.round(2.4 * FPS)}><Audio src={sf('audio/chime.mp3')} volume={0.45} /></Sequence>
    </>
  );
};

export const totalFrames = () => Math.ceil(TOTAL_S * FPS);
export const Tutorial: React.FC = () => {
  const {fps} = useVideoConfig(); void fps;
  const frame = useCurrentFrame();
  const hookF = Math.round(HOOK_S * FPS), mainF = Math.round(MAIN_S * FPS), outF = Math.round(OUTRO_S * FPS);
  const outT = (hookF + mainF);
  const fadeOutFrame = interpolate(frame, [outT - 12, outT + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{fontFamily: sans}}>
      <Background />
      <SideLogo src="tutorial/logo-app.png" y={T.logos.y1} first={1.5} round />
      <SideLogo src="tutorial/logo-gs.png" y={T.logos.y2} first={4} />
      <AbsoluteFill style={{opacity: fadeOutFrame}}>
        <Sequence durationInFrames={hookF}><Hook /></Sequence>
        <Sequence from={hookF} durationInFrames={mainF}><Main /></Sequence>
      </AbsoluteFill>
      <Sequence from={outT}><Outro /></Sequence>
      <Audio src={sf('audio/music.mp3')} volume={(f) => 0.11 * interpolate(f, [totalFrames() - 120, totalFrames() - 10], [1, 0.0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
    </AbsoluteFill>
  );
};

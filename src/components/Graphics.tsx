import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, type} from '../theme';
import {mono, sans} from '../fonts';
import {Card} from './Frame';

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200}});
};

/** Numbered list; highlights items one at a time (e.g. the "5 editing tools"). */
export const ToolList: React.FC<{title: string; big: string; items: {name: string; tag: string}[]; stepFrames?: number}> =
  ({title, big, items, stepFrames = 30}) => {
    const frame = useCurrentFrame();
    const active = Math.min(items.length - 1, Math.floor(frame / stepFrames));
    return (
      <div style={{width: '100%'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 24}}>
          <span style={{fontFamily: sans, fontWeight: 800, fontSize: 120, color: colors.accent, lineHeight: 1}}>{big}</span>
          <span style={{fontFamily: sans, fontWeight: 800, fontSize: type.title * 0.7, color: colors.text}}>{title}</span>
        </div>
        {items.map((it, i) => {
          const on = i === active;
          const seen = i <= active;
          return (
            <div key={it.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
              padding: '22px 26px', borderRadius: 18, background: colors.card,
              border: `2px solid ${on ? colors.accent : colors.cardBorder}`, opacity: seen ? 1 : 0.35,
            }}>
              <span style={{fontFamily: sans, fontWeight: 800, fontSize: 38, color: colors.text}}>
                <span style={{fontFamily: mono, fontSize: 22, color: colors.dim, marginRight: 16}}>0{i + 1}</span>{it.name}
              </span>
              <span style={{fontFamily: sans, fontSize: 24, color: colors.dim}}>{it.tag}</span>
            </div>
          );
        })}
      </div>
    );
  };

/** Checklist that ticks item by item (the "whole process" recap). */
export const Checklist: React.FC<{items: string[]; stepFrames?: number}> = ({items, stepFrames = 24}) => {
  const frame = useCurrentFrame();
  return (
    <Card style={{width: '100%'}}>
      {items.map((t, i) => {
        const done = frame >= (i + 1) * stepFrames;
        return (
          <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '14px 0',
            fontFamily: mono, fontSize: 34, color: done ? colors.text : colors.dim}}>
            <span style={{width: 40, height: 40, borderRadius: 99, display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800,
              background: done ? colors.accent : 'transparent', color: '#111',
              border: `2px solid ${done ? colors.accent : colors.dim}`}}>{done ? '✓' : ''}</span>
            {t}
          </div>
        );
      })}
    </Card>
  );
};

/** A prompt card typed out in mono, with an optional highlighted key line. */
export const PromptCard: React.FC<{tag: string; hint: string; lines: string[]; highlight?: number; cps?: number}> =
  ({tag, hint, lines, highlight, cps = 55}) => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const full = lines.join('\n');
    const shown = Math.floor((frame / fps) * cps);
    let left = shown;
    return (
      <Card style={{width: '100%'}}>
        <div style={{display: 'flex', gap: 14, alignItems: 'center', marginBottom: 22}}>
          <span style={{background: colors.accent, color: '#111', fontFamily: sans, fontWeight: 800,
            fontSize: 22, padding: '6px 16px', borderRadius: 99}}>{tag}</span>
          <span style={{fontFamily: sans, color: colors.dim, fontSize: 24}}>{hint}</span>
        </div>
        {lines.map((l, i) => {
          const t = l.slice(0, Math.max(0, left));
          left -= l.length;
          const hl = i === highlight && shown > full.length;
          return (
            <div key={i} style={{fontFamily: mono, fontSize: type.mono + 4, lineHeight: 1.5, minHeight: 40,
              color: colors.text, background: hl ? colors.accent : 'transparent', borderRadius: 6,
              ...(hl ? {color: '#111', fontWeight: 600} : {})}}>{t || ' '}</div>
          );
        })}
      </Card>
    );
  };

/** Big circular countdown: "1:00 / the whole setup" */
export const TimerRing: React.FC<{label: string; text: string}> = ({label, text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(frame, [0, fps * 3], [1, 0.82], {extrapolateRight: 'clamp'});
  const r = 230, c = 2 * Math.PI * r;
  const s = useIn();
  return (
    <div style={{position: 'relative', width: 520, height: 520, transform: `scale(${0.85 + s * 0.15})`, opacity: s}}>
      <svg width={520} height={520}>
        <circle cx={260} cy={260} r={r} stroke="rgba(255,255,255,.08)" strokeWidth={18} fill="none" />
        <circle cx={260} cy={260} r={r} stroke={colors.accent} strokeWidth={18} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform="rotate(-90 260 260)" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: sans, fontWeight: 800, fontSize: 150, color: colors.accent}}>{text}</div>
        <div style={{fontFamily: sans, fontSize: 34, color: colors.text}}>{label}</div>
      </div>
    </div>
  );
};

/** Checkout card with a locked item + red CTA + "PAID" stamp (the hook visual: "locked behind paid courses"). */
export const LockedCheckout: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const stamp = interpolate(frame, [30, 36], [2.2, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  const stampO = interpolate(frame, [30, 33], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <Card style={{width: '100%', position: 'relative'}}>
      <div style={{fontFamily: mono, fontSize: 22, color: colors.dim, letterSpacing: 2}}>CHECKOUT</div>
      <div style={{display: 'flex', gap: 20, alignItems: 'center', margin: '24px 0'}}>
        <span style={{fontSize: 56}}>🔒</span>
        <div>
          <div style={{fontFamily: sans, fontWeight: 800, fontSize: 44, color: colors.text}}>{title}</div>
          <div style={{fontFamily: sans, fontSize: 24, color: colors.dim}}>Setup revealed after payment</div>
        </div>
      </div>
      <div style={{height: 28, borderRadius: 10, background: 'rgba(255,255,255,.06)', marginBottom: 14}} />
      <div style={{height: 28, borderRadius: 10, background: 'rgba(255,255,255,.06)', marginBottom: 26}} />
      <div style={{background: colors.danger, color: '#fff', fontFamily: sans, fontWeight: 800, fontSize: 32,
        textAlign: 'center', padding: '22px 0', borderRadius: 16}}>Pay for course →</div>
      <div style={{position: 'absolute', top: 18, right: 22, opacity: stampO, transform: `rotate(-8deg) scale(${stamp})`,
        border: `5px solid ${colors.danger}`, color: colors.danger, fontFamily: sans, fontWeight: 800,
        fontSize: 40, padding: '4px 16px', borderRadius: 10}}>PAID</div>
    </Card>
  );
};

/** Fake macOS-style app window with tabs; `active` tab is yellow. */
export const AppWindow: React.FC<{title: string; tabs: string[]; active: number; body?: string}> = ({title, tabs, active, body}) => (
  <Card style={{width: '100%', padding: 0, overflow: 'hidden'}}>
    <div style={{display: 'flex', gap: 10, padding: '18px 24px', background: '#1d1d1d'}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{width: 16, height: 16, borderRadius: 99, background: c}} />)}
    </div>
    <div style={{padding: 36}}>
      <div style={{fontFamily: sans, fontWeight: 800, fontSize: 44, color: colors.text, marginBottom: 22}}>{title}</div>
      <div style={{display: 'inline-flex', gap: 6, background: '#222', padding: 8, borderRadius: 16}}>
        {tabs.map((t, i) => (
          <span key={t} style={{fontFamily: sans, fontWeight: 600, fontSize: 26, padding: '10px 22px', borderRadius: 12,
            background: i === active ? colors.accent : 'transparent', color: i === active ? '#111' : colors.dim}}>{t}</span>
        ))}
      </div>
      {body && <div style={{marginTop: 26, fontFamily: mono, fontSize: 24, color: colors.dim,
        border: `1px solid ${colors.cardBorder}`, borderRadius: 14, padding: 20}}>{body}</div>}
    </div>
  </Card>
);

/** Deterministic waveform with a few red "pause" gaps — used for "Claude cuts the pauses". */
export const Waveform: React.FC<{file: string; seconds: string; note: string}> = ({file, seconds, note}) => {
  const frame = useCurrentFrame();
  const bars = 56;
  return (
    <Card style={{width: '100%'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: mono, color: colors.text, fontSize: 26}}>
        <span>● {file}</span><span style={{color: colors.dim}}>{seconds}</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 5, height: 200, margin: '28px 0'}}>
        {Array.from({length: bars}).map((_, i) => {
          const gap = i % 11 === 7;
          const cut = frame > 20 && gap;
          const h = cut ? 4 : 30 + Math.abs(Math.sin(i * 1.7) * 150) + (gap ? 0 : 10);
          return <div key={i} style={{flex: 1, height: h, borderRadius: 4, background: gap && !cut ? colors.danger : colors.accent}} />;
        })}
      </div>
      <div style={{fontFamily: mono, fontSize: 24, color: colors.danger}}>{note}</div>
    </Card>
  );
};

/** Profile + Follow button that flips to "Following ✓". */
export const FollowCard: React.FC<{handle: string; bio: string; next: string}> = ({handle, bio, next}) => {
  const frame = useCurrentFrame();
  const following = frame > 30;
  return (
    <Card style={{width: '100%'}}>
      <div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
        <div style={{width: 96, height: 96, borderRadius: 99, background: '#333', border: `3px solid ${colors.accent}`}} />
        <div>
          <div style={{fontFamily: sans, fontWeight: 800, fontSize: 42, color: colors.text}}>{handle}</div>
          <div style={{fontFamily: sans, fontSize: 24, color: colors.dim}}>{bio}</div>
        </div>
      </div>
      <div style={{marginTop: 28, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 36, padding: '22px 0',
        borderRadius: 16, background: following ? '#262626' : colors.accent, color: following ? colors.text : '#111'}}>
        {following ? 'Following ✓' : 'Follow'}
      </div>
      {following && <div style={{marginTop: 18, fontFamily: sans, fontWeight: 600, fontSize: 24, color: colors.accent}}>{next} ▶</div>}
    </Card>
  );
};

/** Two-pill stinger: "the tools do the cutting" / "your taste does the rest". */
export const Stinger: React.FC<{icon: string; kicker: string; text: string; hot?: boolean}> = ({icon, kicker, text, hot}) => {
  const s = useIn();
  return (
    <Card style={{width: '100%', opacity: s, transform: `translateY(${(1 - s) * 30}px)`,
      border: `2px solid ${hot ? colors.accent : colors.cardBorder}`, boxShadow: hot ? `0 0 60px rgba(255,214,10,.25)` : undefined}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <span style={{fontSize: 64, color: hot ? colors.accent : colors.text}}>{icon}</span>
        <div>
          <div style={{fontFamily: mono, fontSize: 22, letterSpacing: 3, color: colors.dim}}>{kicker}</div>
          <div style={{fontFamily: sans, fontWeight: 800, fontSize: 56, color: hot ? colors.accent : colors.text}}>{text}</div>
        </div>
      </div>
    </Card>
  );
};

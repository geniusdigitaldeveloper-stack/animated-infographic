import React from 'react';
import {AppWindow, Checklist, FollowCard, LockedCheckout, PromptCard, Stinger, TimerRing, ToolList, Waveform} from '../components/Graphics';
import type {Scene} from '../types';

// One scene = one idea = one visual. Edit this file to make a new reel.
export const scenes: Scene[] = [
  {id: 'hook', chapter: 'Hook', duration: 3, caption: 'Everybody’s editing their *reels* with *Claude* right.', graphic: 'locked'},
  {id: 'promise', chapter: 'Promise', duration: 4, caption: 'Give me *one minute,* and I’ll show you all of it.', graphic: 'timer'},
  {id: 'app', chapter: '01 · App', duration: 4, caption: 'Step one: download the *Claude app* and open *Claude Code* inside it.', graphic: 'app'},
  {id: 'tools', chapter: '04 · Tools', duration: 8, caption: '*Five* editing tools. Remotion, HyperFrames, FFmpeg, Whisper and yt-dlp.', graphic: 'tools'},
  {id: 'prompt1', chapter: '05 · Prompt 1', duration: 5, caption: 'You don’t install any of it yourself. Just paste in the *first prompt.*', graphic: 'prompt1'},
  {id: 'taste', chapter: '07 · Key line', duration: 5, caption: 'Take inspiration, but *don’t copy.* That line keeps your videos unique.', graphic: 'prompt2'},
  {id: 'edit', chapter: '10 · Claude edits', duration: 6, caption: 'Claude cuts the *pauses,* adds *subtitles,* lays *music* under it.', graphic: 'wave'},
  {id: 'recap', chapter: 'Recap', duration: 5, caption: 'That’s the whole *process,* from an empty folder to a finished *reel.*', graphic: 'recap'},
  {id: 'stinger', chapter: 'Recap', duration: 4, caption: 'The tools handle the cutting. Your *taste* handles the rest.', graphic: 'stinger'},
  {id: 'cta', chapter: 'CTA', duration: 4, caption: '*Follow,* because next up I’m showing you my own *editing style.*', graphic: 'follow'},
];

export const graphics: Record<string, () => React.ReactElement> = {
  locked: () => <LockedCheckout title="AI Editing Masterclass" />,
  timer: () => <TimerRing text="1:00" label="the whole setup" />,
  app: () => <AppWindow title="Claude" tabs={['Chat', 'Cowork', 'Code']} active={2} body="Claude Code · new session" />,
  tools: () => (
    <ToolList big="5" title="editing tools" stepFrames={42} items={[
      {name: 'Remotion', tag: 'video'}, {name: 'HyperFrames', tag: 'graphics'}, {name: 'FFmpeg', tag: 'cuts & exports'},
      {name: 'Whisper', tag: 'subtitles'}, {name: 'yt-dlp', tag: 'downloads references'}]} />
  ),
  prompt1: () => (
    <PromptCard tag="PROMPT 1" hint="tools" lines={[
      'You’re my video editor. We work in this folder:', 'raw, references, done. Install and verify 5 tools:',
      'FFmpeg, faster-whisper, yt-dlp, Remotion, HyperFrames.', 'Test each for real. Show a table.']} />
  ),
  prompt2: () => (
    <PromptCard tag="PROMPT 2" hint="your taste" highlight={4} cps={90} lines={[
      'Here are reels whose editing I like:', '[link 1] [link 2] [link 3]', 'Download them with yt-dlp into references.',
      'Study each frame by frame and by ear.', 'Take inspiration, but don’t copy.', 'Write my own style to style.md.']} />
  ),
  wave: () => <Waveform file="take.mp4" seconds="48.5 s" note="17 pauses cut" />,
  recap: () => (
    <Checklist items={['Claude app → Code', 'AI Editor folder', 'Local chat', '5 tools · prompt 1', 'Your taste · prompt 2', 'Edit · prompt 3']} />
  ),
  stinger: () => (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 24}}>
      <Stinger icon="✂" kicker="THE TOOLS" text="do the cutting" />
      <Stinger icon="★" kicker="YOUR TASTE" text="does the rest" hot />
    </div>
  ),
  follow: () => <FollowCard handle="your.handle" bio="Vibe code AI" next="Next: my own editing style" />,
};

import React from 'react';
import {Composition} from 'remotion';
import {Explainer, ExplainerProps, totalFrames} from './Explainer';
import {FPS, HEIGHT, WIDTH} from './theme';
import {Rahmah, RahmahProps, rahmahFrames} from './Rahmah';
import './fonts';

// Frame size is a prop, not a constant: any width/height works (Studio sidebar or --props).
// Presets: reel 1080x1920 · landscape 1920x1080 · square 1080x1080 · portrait 1080x1350 (see theme.ts)
export const Root: React.FC = () => (
  <>
  {/* VO-only infographic reel (owner's voice). Tick showSafeZone in the sidebar to see the TikTok/Reels safe zone. */}
  <Composition
    id="Rahmah"
    component={Rahmah}
    durationInFrames={rahmahFrames(FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{width: WIDTH, height: HEIGHT, showSafeZone: false} as RahmahProps}
    calculateMetadata={({props}) => ({width: props.width, height: props.height})}
  />
  <Composition
    id="Explainer"
    component={Explainer}
    durationInFrames={totalFrames(FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{faceSrc: undefined, faceFit: 'cover', width: WIDTH, height: HEIGHT} as ExplainerProps}
    calculateMetadata={({props}) => ({width: props.width, height: props.height})}
  />
  </>
);

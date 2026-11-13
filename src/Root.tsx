import React from 'react';
import {Composition} from 'remotion';
import {Explainer, ExplainerProps, totalFrames} from './Explainer';
import {FPS, HEIGHT, WIDTH} from './theme';
import './fonts';
import {Tutorial, totalFrames as tutorialFrames} from './tutorial/Tutorial';

// Frame size is a prop, not a constant: any width/height works (Studio sidebar or --props).
// Presets: reel 1080x1920 · landscape 1920x1080 · square 1080x1080 · portrait 1080x1350 (see theme.ts)
export const Root: React.FC = () => (
  <>
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
  <Composition id="Tutorial" component={Tutorial} durationInFrames={tutorialFrames()} fps={30} width={1920} height={1080} />
  </>
);

import React from 'react';
import {Composition} from 'remotion';
import {Explainer, totalFrames} from './Explainer';
import {FPS, HEIGHT, WIDTH} from './theme';
import './fonts';

export const Root: React.FC = () => (
  <Composition
    id="Explainer"
    component={Explainer}
    durationInFrames={totalFrames(FPS)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{faceSrc: undefined as string | undefined}}
  />
);

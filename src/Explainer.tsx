import React from 'react';
import {Sequence, useVideoConfig} from 'remotion';
import {Background, ChapterPill, FaceCard, GraphicSlot} from './components/Frame';
import {Caption} from './components/Caption';
import {graphics, scenes} from './scenes/script';

export type ExplainerProps = {faceSrc?: string};

export const totalFrames = (fps: number) => scenes.reduce((a, s) => a + Math.round(s.duration * fps), 0);

export const Explainer: React.FC<ExplainerProps> = ({faceSrc}) => {
  const {fps} = useVideoConfig();
  let from = 0;
  return (
    <Background>
      {scenes.map((s) => {
        const d = Math.round(s.duration * fps);
        const el = (
          <Sequence key={s.id} from={from} durationInFrames={d} premountFor={fps}>
            <ChapterPill label={s.chapter} />
            <GraphicSlot>{graphics[s.graphic]()}</GraphicSlot>
            <Caption text={s.caption} duration={s.duration} words={s.words} />
          </Sequence>
        );
        from += d;
        return el;
      })}
      <FaceCard faceSrc={faceSrc} />
    </Background>
  );
};

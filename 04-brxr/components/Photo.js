/* eslint-disable no-new */
import { PhotoDome, Vector3, VideoDome } from '@babylonjs/core';
import { Engine, Scene } from 'react-babylonjs';
import Hovering from './Hovering';
import Yellow from './Yellow';

const Photo = () => {
  return (
    <Engine canvasId="canvas">
      <Scene
        onSceneMount={({ scene }) => {
          new PhotoDome(
            'testdome',
            './dome.jpg',
            { resolution: 64, size: 512 },
            scene
          );
          // new VideoDome(
          //   'videodome',
          //   './riding.mp4',
          //   { resolution: 64, clickToPlay: true },
          //   scene
          // );
        }}
      >
        <hemisphericLight
          name="light1"
          intensity={1}
          direction={Vector3.Up()}
        />
        <Hovering>
          <Yellow black />
        </Hovering>
        <arcRotateCamera
          name="camera"
          position={new Vector3(0, 5, -10)}
          radius={0}
          alpha={1}
          beta={1}
          target={Vector3.Zero()}
        />
        <vrExperienceHelper />
      </Scene>
    </Engine>
  );
};

export default Photo;

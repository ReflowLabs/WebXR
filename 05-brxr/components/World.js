import { Axis, Vector3 } from '@babylonjs/core';
import { Engine, Scene } from 'react-babylonjs';
import Hovering from './Hovering';
import Yellow from './Yellow';

const World = () => {
  // return null;
  return (
    <Engine canvasId="canvas">
      <Scene>
        <hemisphericLight
          name="light1"
          intensity={1}
          direction={Vector3.Up()}
        />
        <Hovering>
          <box name="box" size={2} position={new Vector3(0, 5, 2)} />
          <box name="box" size={2} position={new Vector3(3, 5, 2)} />
          <box name="box" size={2} position={new Vector3(6, 5, 2)} />
        </Hovering>
        <Hovering>
          <Yellow />
        </Hovering>
        {/* <holographicButton text="Hello!" scaling={new Vector3(20, 20, 20)} /> */}
        <freeCamera
          name="camera1"
          position={new Vector3(0, 5, -10)}
          target={Vector3.Zero()}
        />

        <vrExperienceHelper teleportEnvironmentGround />
        <environmentHelper enableGroundShadow groundYBias={1} />
      </Scene>
    </Engine>
  );
};

export default World;

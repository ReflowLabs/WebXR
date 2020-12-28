import {
  Vector3,
  Animation,
  CircleEase,
  EasingFunction,
  CubicEase,
  SineEase,
  BezierCurveEase,
  ElasticEase,
  QuinticEase,
  QuarticEase,
  QuadraticEase,
  PowerEase
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useBabylonScene } from 'react-babylonjs';

function getHoverAnimation(position, offsetY) {
  const { y } = position;

  const height = new Animation('height', 'position.y', 60, 0, 1);
  const rotation = new Animation(
    'rotation',
    'rotation',
    60,
    Animation.ANIMATIONTYPE_VECTOR3,
    1
  );

  height.setKeys([
    {
      frame: 0,
      value: y + offsetY
    },
    {
      frame: 60,
      value: y
    },
    {
      frame: 120,
      value: y + offsetY
    }
  ]);

  rotation.setKeys([
    { frame: 0, value: new Vector3(0.1, 0, -0.1) },
    { frame: 250, value: new Vector3(-0.1, 0, 0.1) },
    { frame: 500, value: new Vector3(0.1, 0, -0.1) }
  ]);

  const heightEasing = new PowerEase(2.5);
  // For each easing function, you can choose between EASEIN (default), EASEOUT, EASEINOUT
  heightEasing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  // Adding the easing function to the height
  height.setEasingFunction(heightEasing);

  const rotationEasing = new SineEase();
  // For each easing function, you can choose between EASEIN (default), EASEOUT, EASEINOUT
  rotationEasing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  // Adding the easing function to the rotation
  rotation.setEasingFunction(rotationEasing);

  return [height, rotation];
}

const Hovering = ({ children }) => {
  const groupRef = useRef(null);
  const scene = useBabylonScene();
  const position = Vector3.Zero();

  const playAnimation = () => {
    if (groupRef.current) {
      const frames = 500;
      const group = groupRef.current.hostInstance;
      const animations = getHoverAnimation(position, -2);
      scene.beginDirectAnimation(
        group,
        animations,
        0,
        frames,
        true,
        Math.random() + 0.5
      );
    }
  };

  useEffect(() => {
    playAnimation();
  }, []);

  return (
    <transformNode name="group" ref={groupRef} position={position}>
      {children}
    </transformNode>
  );
};

export default Hovering;

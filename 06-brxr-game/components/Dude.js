import { BoneIKController, Space, Vector3 } from "@babylonjs/core";
import { useRef, useState } from "react";
import { Model, useBabylonScene } from "react-babylonjs";

const Dude = ({ state, scaling = new Vector3(0.05, 0.05, 0.05) }) => {
  const [ready, setReady] = useState(false);
  const scene = useBabylonScene();
  const leftTargetRef = new useRef();
  const leftPoleTargetRef = new useRef();
  const rightTargetRef = new useRef();
  const rightPoleTargetRef = new useRef();
  const modelRef = new useRef();
  const armLeftRef = new useRef();
  const armRightRef = new useRef();

  function registerBones(model) {
    // name the model parts for collision
    model.meshes.forEach((m) => (m.name = "dude"));
    modelRef.current = model;
    const mesh = model.meshes[0];
    const skeleton = model.skeletons[0];
    mesh.checkCollisions = true;
    mesh.scaling = scaling;
    rightTargetRef.current.hostInstance.parent = mesh;
    rightPoleTargetRef.current.hostInstance.prent = mesh;
    leftTargetRef.current.hostInstance.parent = mesh;
    leftPoleTargetRef.current.hostInstance.prent = mesh;
    armLeftRef.current = new BoneIKController(mesh, skeleton.bones[33], {
      targetMesh: leftTargetRef.current.hostInstance,
      poleTargetMesh: leftPoleTargetRef.current.hostInstance,
      poleAngle: Math.PI,
    });
    armLeftRef.current.maxAngle = Math.PI * 0.9;
    armRightRef.current = new BoneIKController(mesh, skeleton.bones[14], {
      targetMesh: rightTargetRef.current.hostInstance,
      poleTargetMesh: rightPoleTargetRef.current.hostInstance,
      poleAngle: Math.PI,
    });
    armRightRef.current.maxAngle = Math.PI * 0.9;
    setReady(true);
  }

  scene.registerBeforeRender(() => {
    if (ready && modelRef.current && modelRef.current.meshes[0]) {
      try {
        const bone = modelRef.current.skeletons[0].bones[4];
        bone.setYawPitchRoll(
          -state.hrz * 1.2,
          state.hry * 1.2,
          -state.hrx * 1.2,
          Space.LOCAL
        );
        const lX = parseFloat(state.lpx) * 60;
        const lY = parseFloat(state.lpy) * 60;
        const lZ = (parseFloat(state.lpz) + 7.5) * 60;
        leftTargetRef.current.hostInstance.position.x = lX;
        leftTargetRef.current.hostInstance.position.y = lY + 12;
        leftTargetRef.current.hostInstance.position.z = lZ + 10;
        const rX = parseFloat(state.rpx) * 60;
        const rY = parseFloat(state.rpy) * 60;
        const rZ = (parseFloat(state.rpz) + 7.5) * 60;
        rightTargetRef.current.hostInstance.position.x = rX;
        rightTargetRef.current.hostInstance.position.y = rY + 12;
        rightTargetRef.current.hostInstance.position.z = rZ + 10;
        armLeftRef.current.update();
        armRightRef.current.update();
      } catch (e) {
        // console.error(e);
      }
    }
  });

  return (
    <>
      <sphere
        ref={leftPoleTargetRef}
        scaling={new Vector3(0, 0, 0)}
        position={new Vector3(-2, 4, -4)}
      />
      <sphere
        ref={rightPoleTargetRef}
        scaling={new Vector3(0, 0, 0)}
        position={new Vector3(2, 4, -4)}
      />
      <sphere ref={leftTargetRef} />
      <sphere ref={rightTargetRef} />
      <Model
        rootUrl="/"
        sceneFilename={"Dude.babylon"}
        position={new Vector3(0, 0, 0)}
        rotation={new Vector3(0, -Math.PI, 0)}
        onModelLoaded={registerBones}
      />
    </>
  );
};

export default Dude;

import { BoneAxesViewer, BoneIKController, Vector3 } from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { Model, useBabylonScene } from "react-babylonjs";

const Dude = ({ scaling = new Vector3(0.05, 0.05, 0.05) }) => {
  const targetRef = new useRef();
  const poleTargetRef = new useRef();
  const scene = useBabylonScene();

  function start(model) {
    model.meshes.forEach((m) => (m.name = "dude"));
    const mesh = model.meshes[0];

    const skeleton = model.skeletons[0];
    // mesh.name = "dude";
    mesh.checkCollisions = true;

    mesh.scaling = scaling;
    targetRef.current.hostInstance.parent = mesh;
    poleTargetRef.current.hostInstance.prent = mesh;

    const leftArm = new BoneIKController(mesh, skeleton.bones[14], {
      targetMesh: targetRef.current.hostInstance,
      poleTargetMesh: poleTargetRef.current.hostInstance,
      poleAngle: Math.PI,
    });
    // const rightArm = new BoneIKController(mesh, skeleton.bones[32], {
    //   targetMesh: targetRef.current.hostInstance,
    //   poleTargetMesh: poleTargetRef.current.hostInstance,
    //   poleAngle: Math.PI,
    // });
    // const torso = new BoneIKController(mesh, skeleton.bones[4], {
    //   targetMesh: targetRef.current.hostInstance,
    //   poleTargetMesh: poleTargetRef.current.hostInstance,
    //   poleAngle: Math.PI,
    // });
    // const leftLeg = new BoneIKController(mesh, skeleton.bones[51], {
    //   targetMesh: targetRef.current.hostInstance,
    //   poleTargetMesh: poleTargetRef.current.hostInstance,
    //   poleAngle: Math.PI,
    // });
    // const rightLeg = new BoneIKController(mesh, skeleton.bones[55], {
    //   targetMesh: targetRef.current.hostInstance,
    //   poleTargetMesh: poleTargetRef.current.hostInstance,
    //   poleAngle: Math.PI,
    // });

    // const body = new BoneIKController(mesh, skeleton.bones[3], {
    //   targetMesh: targetRef.current.hostInstance,
    //   poleTargetMesh: poleTargetRef.current.hostInstance,
    //   poleAngle: Math.PI,
    // });

    // ikCtl.mesh.scaling = scaling;
    // ikCtl.maxAngle = Math.PI * 0.9;
    // ikCtl.maxAngle = Math.PI * 0.9;
    // console.log(ikCtl);

    let t = 0;

    scene.registerBeforeRender(() => {
      // const dist = 2 + 12 * Math.sin(t);
      t += 0.02;
      // console.log("going...", target);
      targetRef.current.hostInstance.position.x = 20;
      targetRef.current.hostInstance.position.y = 40 + 40 * Math.sin(t);
      targetRef.current.hostInstance.position.z = 30 + 40 * Math.cos(t);
      // body.update();
      leftArm.update();
      // rightArm.update();
      // torso.update();
      // leftLeg.update();
      // rightLeg.update();
      // var bone1AxesViewer = new BoneAxesViewer(scene, skeleton.bones[14], mesh);
      // var bone2AxesViewer = new BoneAxesViewer(scene, skeleton.bones[13], mesh);
    });
  }

  return (
    <>
      <sphere ref={poleTargetRef} position={new Vector3(0, 10, -5)} />
      <sphere ref={targetRef} />
      <Model
        rootUrl="/"
        sceneFilename={"Dude.babylon"}
        position={new Vector3(0, 0, 0)}
        rotation={new Vector3(0, Math.PI, 0)}
        onModelLoaded={start}
        // scaling={scaling}
      />
    </>
  );
};

export default Dude;

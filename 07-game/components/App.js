import React, { useRef } from "react";
import "@babylonjs/core/Physics/physicsEngineComponent"; // side-effect adds scene.enablePhysics function
import { Vector3, PhysicsImpostor } from "@babylonjs/core";
import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins";
import { Scene, Engine } from "react-babylonjs";

import * as CANNON from "cannon";
// import Snowballs from "./Snowballs";
import Dude from "./Dude";
import Inspector from "./Inspector";
import Snowballs from "./Snowballs";
window.CANNON = CANNON;

const gravityVector = new Vector3(0, -9.81, 0);

const App = () => {
  function meshPicked(e) {
    if (e.id === "sphere1") {
      e.physicsImpostor.applyImpulse(
        Vector3.Up().scale(10),
        e.getAbsolutePosition()
      );
    }
  }
  return (
    <Engine antialias={true} adaptToDeviceRatio={true} canvasId="canvas">
      <Scene
        collisionsEnabled
        enablePhysics={[gravityVector, new CannonJSPlugin()]}
        onMeshPicked={meshPicked}
      >
        {/* <Inspector /> */}
        <arcRotateCamera
          name="arc"
          target={new Vector3(0, 1, 0)}
          alpha={-Math.PI / 2}
          beta={0.5 + Math.PI / 4}
          radius={4}
          minZ={0.001}
          wheelPrecision={50}
          lowerRadiusLimit={8}
          upperRadiusLimit={200}
          upperBetaLimit={Math.PI / 2}
        />
        <hemisphericLight
          name="hemi"
          direction={new Vector3(0, -1, 0)}
          intensity={0.8}
        />
        <directionalLight
          name="shadow-light"
          setDirectionToTarget={[Vector3.Zero()]}
          direction={Vector3.Zero()}
          position={new Vector3(-40, 30, -40)}
          intensity={0.4}
          shadowMinZ={1}
          shadowMaxZ={2500}
        >
          <shadowGenerator
            mapSize={1024}
            useBlurExponentialShadowMap={true}
            blurKernel={32}
            darkness={0.8}
            shadowCasters={["dude", "sphere"]}
            forceBackFacesOnly={true}
            depthScale={100}
          />
        </directionalLight>

        <ground
          name="ground"
          width={100}
          height={100}
          subdivisions={2}
          receiveShadows={true}
        >
          <physicsImpostor
            type={PhysicsImpostor.BoxImpostor}
            _options={{ mass: 0, restitution: 0.6 }}
          />
        </ground>
        <Snowballs />
        <Dude />
      </Scene>
    </Engine>
  );
};
export default App;

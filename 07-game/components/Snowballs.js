import {
  Ray,
  Vector3,
  WebXRDefaultExperience,
  Animation,
  BezierCurveEase,
  Color3,
  FresnelParameters,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { Mesh, Texture, useBabylonScene } from "react-babylonjs";
import { PhysicsImpostor } from "@babylonjs/core";

let observers = {};
let meshesUnderPointer = {};

const tmpVec = new Vector3();
const tmpRay = new Ray();
tmpRay.origin = new Vector3();
tmpRay.direction = new Vector3();
let lastTimestamp = 0;
const oldPos = new Vector3();

function Snowall({ position }) {
  const sphereRef = useRef();
  const scene = useBabylonScene();

  function resetPos(mesh) {
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    mesh.physicsImpostor.setLinearVelocity(Vector3.Zero());
    mesh.physicsImpostor.setAngularVelocity(Vector3.Zero());
  }
  scene.registerBeforeRender(() => {
    const mesh = sphereRef.current.hostInstance;
    if (mesh.position.y < -0.1) {
      resetPos(mesh);
    }
    // const dude = scene.getMeshByName("dude");
    scene.meshes
      .filter((m) => m.name == "dude")
      .forEach((m) => {
        if (mesh.intersectsMesh(m, true)) {
          console.log("bam");
          resetPos(mesh);
        }
      });
  });
  return (
    <sphere
      ref={sphereRef}
      name="sphere"
      diameter={0.2}
      checkCollisions
      onCollide={() => console.log("yo")}
      segments={16}
      position={position}
    >
      <physicsImpostor
        type={PhysicsImpostor.SphereImpostor}
        _options={{ mass: 1, restitution: 0.9 }}
      />
      <standardMaterial
        name="material1"
        specularPower={16}
        diffuseColor={Color3.Black()}
        emissiveColor={new Color3(0.5, 0.5, 0.5)}
        reflectionFresnelParameters={FresnelParameters.Parse({
          isEnabled: true,
          leftColor: [1, 1, 1],
          rightColor: [0, 0, 0],
          bias: 0.1,
          power: 1,
        })}
      />
      <plane
        name="dialog"
        size={2}
        position={new Vector3(0, 1.5, 0)}
        sideOrientation={Mesh.BACKSIDE}
      >
        <advancedDynamicTexture
          name="dialogTexture"
          height={1024}
          width={1024}
          createForParentMesh={true}
          hasAlpha={true}
          generateMipMaps={true}
          samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        />
      </plane>
    </sphere>
  );
}

export default function Snowballs() {
  const scene = useBabylonScene();
  const xrRef = useRef();
  useEffect(() => {
    (async () => {
      const xr = await WebXRDefaultExperience.CreateAsync(scene);
      console.log("creating", xr);
      xrRef.current = xr;
      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
          if (motionController.handness === "left") {
            const squeeze = motionController.getComponentOfType("squeeze");
            if (squeeze) {
              // check its state and handle state changes
              squeeze.onButtonStateChangedObservable.add(() => {
                // pressed was changed
                if (squeeze.changes.pressed) {
                  // is it pressed?
                  if (squeeze.pressed) {
                    // animate position
                    controller.getWorldPointerRayToRef(tmpRay, true);
                    tmpRay.direction.scaleInPlace(0.2);
                    const position = controller.grip
                      ? controller.grip.position
                      : controller.pointer.position;

                    let mesh = scene.meshUnderPointer;
                    if (xr.pointerSelection.getMeshUnderPointer) {
                      mesh = xr.pointerSelection.getMeshUnderPointer(
                        controller.uniqueId
                      );
                    }
                    if (mesh && mesh.id !== "ground" && mesh.physicsImpostor) {
                      const animatable = Animation.CreateAndStartAnimation(
                        "meshmove",
                        mesh,
                        "position",
                        30,
                        15,
                        mesh.position.clone(),
                        position.add(tmpRay.direction),
                        Animation.ANIMATIONLOOPMODE_CONSTANT,
                        new BezierCurveEase(0.3, -0.75, 0.7, 1.6),
                        () => {
                          if (!mesh) return;
                          meshesUnderPointer[controller.uniqueId] = mesh;
                          observers[
                            controller.uniqueId
                          ] = xr.baseExperience.sessionManager.onXRFrameObservable.add(
                            () => {
                              const delta =
                                xr.baseExperience.sessionManager
                                  .currentTimestamp - lastTimestamp;
                              lastTimestamp =
                                xr.baseExperience.sessionManager
                                  .currentTimestamp;
                              controller.getWorldPointerRayToRef(tmpRay, true);
                              tmpRay.direction.scaleInPlace(0.2);
                              const position = controller.grip
                                ? controller.grip.position
                                : controller.pointer.position;
                              tmpVec.copyFrom(position);
                              tmpVec.addInPlace(tmpRay.direction);
                              tmpVec.subtractToRef(oldPos, tmpVec);
                              tmpVec.scaleInPlace(1000 / delta);
                              meshesUnderPointer[
                                controller.uniqueId
                              ].position.copyFrom(position);
                              meshesUnderPointer[
                                controller.uniqueId
                              ].position.addInPlace(tmpRay.direction);
                              oldPos.copyFrom(
                                meshesUnderPointer[controller.uniqueId].position
                              );
                              meshesUnderPointer[
                                controller.uniqueId
                              ].physicsImpostor.setLinearVelocity(
                                Vector3.Zero()
                              );
                              meshesUnderPointer[
                                controller.uniqueId
                              ].physicsImpostor.setAngularVelocity(
                                Vector3.Zero()
                              );
                            }
                          );
                        }
                      );
                    }
                  } else {
                    // throw the object
                    if (
                      observers[controller.uniqueId] &&
                      meshesUnderPointer[controller.uniqueId]
                    ) {
                      xr.baseExperience.sessionManager.onXRFrameObservable.remove(
                        observers[controller.uniqueId]
                      );
                      observers[controller.uniqueId] = null;
                      meshesUnderPointer[
                        controller.uniqueId
                      ].physicsImpostor.setLinearVelocity(tmpVec);
                    }
                  }
                }
              });
            }
          }
        });
      });
    })();
    return () => {
      xrRef.current.dispose();
    };
  }, []);

  return (
    <>
      {new Array(20).fill(null).map((n, i) => (
        <Snowall
          key={i}
          position={new Vector3(i * 0.01 * 3 - 3, 0.2 + i * 0.1, -3)}
        />
      ))}
      <Snowall position={new Vector3(0, 10, 0)} />
    </>
  );
}

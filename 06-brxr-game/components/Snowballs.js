import {
  Ray,
  Vector3,
  WebXRDefaultExperience,
  Animation,
  BezierCurveEase,
  Color3,
  FresnelParameters,
  WebXRState,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { Mesh, Texture, useBabylonScene } from "react-babylonjs";
import { PhysicsImpostor } from "@babylonjs/core";

let observers = {};
let meshesUnderPointer = {};

const PRECISION = 2;
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
    scene.meshes
      .filter((m) => m.name == "dude")
      .forEach((m) => {
        if (mesh.intersectsMesh(m, true)) {
          // onHit();
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

export default function Snowballs({ update }) {
  const scene = useBabylonScene();
  const xrRef = useRef();
  useEffect(() => {
    (async () => {
      const xr = await WebXRDefaultExperience.CreateAsync(scene);
      xrRef.current = xr;
      xr.baseExperience.onStateChangedObservable.add((state) => {
        if (state === WebXRState.IN_XR) {
          scene.onBeforeCameraRenderObservable.add(() => {
            if (xr.baseExperience.camera.rightCamera) {
              const {
                rotationQuaternion: rotation,
              } = xr.baseExperience.camera.rightCamera;
              update(() => ({
                hrx: rotation._x.toFixed(PRECISION),
                hry: rotation._y.toFixed(PRECISION),
                hrz: rotation._z.toFixed(PRECISION),
                // hpx: position._x.toFixed(PRECISION),
                // hpy: position._y.toFixed(PRECISION),
                // hpz: position._z.toFixed(PRECISION),
              }));
            }
          });
        }
      });
      // xr.input.on
      xr.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((motionController) => {
          // handle movement updates
          xr.baseExperience.sessionManager.onXRFrameObservable.add(() => {
            const prefix = motionController.handness[0]; // l or r
            const position = controller.grip
              ? controller.grip.position
              : controller.pointer.position;
            update(() => ({
              [`${prefix}px`]: position._x.toFixed(PRECISION),
              [`${prefix}py`]: position._y.toFixed(PRECISION),
              [`${prefix}pz`]: position._z.toFixed(PRECISION),
            }));
          });
          // handle squeeze trigger events
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

  return <Snowall position={new Vector3(0, 0.5, -4)} />;
  // return (
  //   <>
  //     {/* {new Array(15).fill(null).map((n, i) => (
  //       <Snowall
  //         key={i}
  //         position={new Vector3(-2 + i * 0.3, 0.5, -4)}
  //         // onHit={onHit}
  //       />
  //     ))} */}

  //   </>
  // );
}

import {
  Ray,
  Vector3,
  WebXRDefaultExperience,
  Animation,
  BezierCurveEase,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useBabylonScene } from "react-babylonjs";

let observers = {};
let meshesUnderPointer = {};

const tmpVec = new Vector3();
const tmpRay = new Ray();
tmpRay.origin = new Vector3();
tmpRay.direction = new Vector3();
let lastTimestamp = 0;
const oldPos = new Vector3();

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
                    tmpRay.direction.scaleInPlace(1.5);
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
                              tmpRay.direction.scaleInPlace(1.5);
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
      <box />
    </>
  );
}

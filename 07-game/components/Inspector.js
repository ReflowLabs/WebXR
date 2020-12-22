import { useEffect } from "react";
import { useBabylonScene } from "react-babylonjs";

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

const Inspector = () => {
  const scene = useBabylonScene();
  useEffect(() => {
    if (scene) {
      scene.debugLayer.show();
    }
  }, [scene]);
  return null;
};

export default Inspector;

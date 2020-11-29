import { Vector3 } from '@babylonjs/core';
import { Model } from 'react-babylonjs';

const Yellow = props => {
  return (
    <Model
      rootUrl="/"
      sceneFilename={props.black ? 'yellow-black.gltf' : 'yellow-white.gltf'}
      position={new Vector3(0, 6, 0)}
      rotation={new Vector3(0, Math.PI, 0)}
      scaling={new Vector3(40, 40, 40)}
      {...props}
    />
  );
};

export default Yellow;

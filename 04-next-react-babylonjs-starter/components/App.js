import { Vector3 } from '@babylonjs/core'
import { Engine, Scene } from 'react-babylonjs'

import Inspector from './Inspector'

const App = () => {
  return (
    <Engine canvasId="canvas">
      <Scene>
        <Inspector />
        <arcRotateCamera
          name="camera1"
          alpha={-Math.PI / 2}
          beta={0.5 + Math.PI / 4}
          radius={4}
          minZ={0.001}
          wheelPrecision={50}
          lowerRadiusLimit={8}
          upperRadiusLimit={20}
          upperBetaLimit={Math.PI / 2}
        />
        <hemisphericLight
          name="light1"
          intensity={1}
          direction={Vector3.Up()}
        />
        <box name="box" size={4} position={new Vector3(5, 2, 10)} />
      </Scene>
    </Engine>
  )
}

export default App

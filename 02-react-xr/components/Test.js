import { useState, useEffect, Fragment } from 'react'
import { VRCanvas, Hands } from '@react-three/xr'
import { useThree, useFrame } from 'react-three-fiber'
import {
  Box,
  OrbitControls,
  Plane,
  Sphere,
  Sky,
  useMatcapTexture,
} from '@react-three/drei'

import { usePlane, useBox, Physics, useSphere } from 'use-cannon'

// import './styles.css'

function Cube({ position, args = [0.06, 0.06, 0.06] }) {
  const [boxRef] = useBox(() => ({ position, mass: 1, args }))
  const [tex] = useMatcapTexture('C7C0AC_2E181B_543B30_6B6270')

  return (
    <Box ref={boxRef} args={args} castShadow>
      <meshMatcapMaterial attach="material" matcap={tex} />
    </Box>
  )
}

function JointCollider({ index, hand }) {
  const { gl } = useThree()
  const handObj = gl.xr.getHand(hand)
  const joint = handObj.joints[index]
  const size = joint.jointRadius ?? 0.001
  const [tipRef, api] = useSphere(() => ({
    args: size,
    position: [-1000, 0, 0],
  }))
  useFrame(() => {
    if (joint === undefined) return
    api.position.set(joint.position.x, joint.position.y, joint.position.z)
  })

  return (
    <Sphere ref={tipRef} args={[size]}>
      <meshBasicMaterial transparent opacity={0} attach="material" />
    </Sphere>
  )
}

function HandsReady(props) {
  const [ready, setReady] = useState(false)
  const { gl } = useThree()
  useEffect(() => {
    if (ready) return
    const joint = gl.xr.getHand(0).joints[4]
    if (joint?.jointRadius !== undefined) return
    const id = setInterval(() => {
      if (joint?.jointRadius !== undefined) {
        setReady(true)
      }
    }, 500)
    return () => clearInterval(id)
  }, [gl, ready])

  return ready ? props.children : null
}

const HandsColliders = () =>
  [...Array(25)].map((_, i) => (
    <Fragment key={i}>
      <JointCollider index={i} hand={0} />
      <JointCollider index={i} hand={1} />
    </Fragment>
  ))

function Scene() {
  const [floorRef] = usePlane(() => ({
    args: [10, 10],
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0.8, 0],
    type: 'Static',
  }))
  return (
    <>
      <Sky />
      <Plane ref={floorRef} args={[10, 10]} receiveShadow>
        <meshStandardMaterial attach="material" color="#fff" />
      </Plane>
      <Hands />
      <HandsReady>
        <HandsColliders />
      </HandsReady>
      {[...Array(7)].map((_, i) => (
        <Cube position={[0, 1.1 + 0.1 * i, -0.5]} />
      ))}
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <spotLight
        position={[1, 8, 1]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
    </>
  )
}

export default function Test() {
  return (
    <VRCanvas shadowMap>
      <Physics
        gravity={[0, -2, 0]}
        iterations={20}
        defaultContactMaterial={{
          friction: 0.09,
        }}
      >
        <Scene />
      </Physics>
    </VRCanvas>
  )
}

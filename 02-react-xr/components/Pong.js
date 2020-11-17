// react-three-fiber is a way to express threejs declaratively: https://github.com/pmndrs/react-three-fiber
import { useFrame, useLoader } from 'react-three-fiber'
// use-cannon is a hook around the cannon.js physics library: https://github.com/pmndrs/use-cannon
import { Physics, useSphere, useBox, usePlane } from 'use-cannon'
// zustand is a minimal state-manager: https://github.com/pmndrs/zustand
import create from 'zustand'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import React, { Suspense, useRef, useCallback, useMemo } from 'react'
import { VRCanvas, useXREvent, useXR, useController } from '@react-three/xr'
import clamp from 'lodash-es/clamp'
import Text from './Text'
import pingSound from '../resources/ping.mp3'
import earthImg from '../resources/cross.jpg'

// Create a store ...
const ping = new Audio(pingSound)
const [useStore] = create((set) => ({
  count: 0,
  welcome: true,
  api: {
    pong(velocity) {
      ping.currentTime = 0
      ping.volume = clamp(velocity / 20, 0, 1)
      ping.play()
      if (velocity > 1) set((state) => ({ count: state.count + 1 }))
    },
    reset: (welcome) =>
      set((state) => ({ welcome, count: welcome ? state.count : 0 })),
  },
}))

// The paddle was made in blender and auto-converted to JSX by https://github.com/pmndrs/gltfjsx
function Paddle() {
  // Load the gltf file
  const { nodes, materials } = useLoader(GLTFLoader, '/pingpong.glb')
  console.log(nodes, materials)
  // Fetch some reactive state
  const { pong, reset } = useStore((state) => state.api)
  const welcome = useStore((state) => state.welcome)
  const count = useStore((state) => state.count)
  const model = useRef()

  const rightController = useController('right')
  // Make it a physical object that adheres to gravitation and impact
  const [ref, api] = useBox(() => ({
    type: 'Kinematic',
    args: [0.17, 0.05, 0.175],
    onCollide: (e) => pong(e.contact.impactVelocity),
  }))

  useFrame((state) => {
    if (!rightController) {
      return
    }
    const { grip: controller } = rightController
    const forward = new THREE.Vector3(0, 0, -0.175)
    forward.applyQuaternion(controller.quaternion)
    const position = new THREE.Vector3().copy(controller.position).add(forward)
    api.position.set(position.x, position.y, position.z)
    api.rotation.set(
      controller.rotation.x,
      controller.rotation.y,
      controller.rotation.z,
    )
  })

  const onClick = useCallback(() => welcome && reset(false), [welcome, reset])
  useXREvent('select', onClick)

  return (
    <mesh ref={ref} dispose={null} scale={[0.1, 0.1, 0.1]}>
      <group
        ref={model}
        position={[-0.05, 0.37, 0.3]}
        scale={[0.15, 0.15, 0.15]}
      >
        <Text
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 1, 2]}
          size={1}
          children={count.toString()}
        />
        <group rotation={[1.88, -0.35, 2.32]} scale={[2.97, 2.97, 2.97]}>
          <primitive object={nodes.Bone} />
          <primitive object={nodes.Bone003} />
          <primitive object={nodes.Bone006} />
          <primitive object={nodes.Bone010} />
          <skinnedMesh
            castShadow
            receiveShadow
            material={materials.glove}
            material-roughness={1}
            geometry={nodes.arm.geometry}
            skeleton={nodes.arm.skeleton}
          />
        </group>
        <group rotation={[0, -0.04, 0]} scale={[141.94, 141.94, 141.94]}>
          <mesh
            castShadow
            receiveShadow
            material={materials.wood}
            geometry={nodes.mesh.geometry}
          />
          <mesh
            castShadow
            receiveShadow
            material={materials.side}
            geometry={nodes.mesh_1.geometry}
          />
          <mesh
            castShadow
            receiveShadow
            material={materials.foam}
            geometry={nodes.mesh_2.geometry}
          />
          <mesh
            castShadow
            receiveShadow
            material={materials.lower}
            geometry={nodes.mesh_3.geometry}
          />
          <mesh
            castShadow
            receiveShadow
            material={materials.upper}
            geometry={nodes.mesh_4.geometry}
          />
        </group>
      </group>
    </mesh>
  )
}

function Ball() {
  // Load texture (the black plus sign)
  const map = useLoader(THREE.TextureLoader, earthImg)

  const controller = useController('right')

  // Make the ball a physics object with a low mass
  const [ref] = useSphere(() => ({
    mass: 0.1,
    args: 0.1,
    position: controller
      ? [
          controller.grip.position.x,
          controller.grip.position.y + 0.5,
          controller.grip.position.z,
        ]
      : [0, 0, 0],
  }))

  return (
    <mesh castShadow ref={ref}>
      <sphereBufferGeometry attach="geometry" args={[0.1, 64, 64]} />
      <meshStandardMaterial attach="material" map={map} />
    </mesh>
  )
}

function ContactGround() {
  // When the ground was hit we reset the game ...
  const { reset } = useStore((state) => state.api)
  const [ref] = usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
    onCollide: () => reset(true),
  }))
  return <mesh ref={ref} />
}

export default function Pong() {
  const welcome = useStore((state) => state.welcome)
  return (
    <>
      <VRCanvas sRGB>
        <color attach="background" args={['#171720']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[-10, -10, -10]} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <Physics
          iterations={20}
          tolerance={0.0001}
          defaultContactMaterial={{
            friction: 0.9,
            restitution: 0.7,
            contactEquationStiffness: 1e7,
            contactEquationRelaxation: 1,
            frictionEquationStiffness: 1e7,
            frictionEquationRelaxation: 2,
          }}
          gravity={[0, -4, 0]}
          allowSleep={false}
          // Adjust to the headset refresh rate
          step={1 / 90}
        >
          <mesh position={[0, 0, -10]} receiveShadow>
            <planeBufferGeometry attach="geometry" args={[1000, 1000]} />
            <meshPhongMaterial attach="material" color="#172017" />
          </mesh>
          <ContactGround />
          {!welcome && <Ball />}
          <Suspense fallback={null}>
            <Paddle />
          </Suspense>
        </Physics>
      </VRCanvas>
      <div className="startup" style={{ display: welcome ? 'block' : 'none' }}>
        * once in vr press trigger to start
      </div>
    </>
  )
}

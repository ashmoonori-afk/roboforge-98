import type { DragEvent as RDragEvent } from 'react'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { CameraController } from './CameraController'
import { SurgicalModel } from './models/SurgicalModel'
import { AutomatonModel } from './models/AutomatonModel'
import { SceneRenderer } from './SceneRenderer'
import { useStore } from '../state/store'
import { partById } from '../data/parts'
import {
  C, ChassisPlate, Standoff, Wheel, Gearmotor, ControllerBoard, Servo, Bracket,
  UltrasonicEyes, BatteryPack,
} from './models/parts3d'

const WHEEL_POS: [number, number, number][] = [
  [0.5, 0, 0.52], [0.5, 0, -0.52], [-0.5, 0, 0.52], [-0.5, 0, -0.52],
]
const STANDOFF_POS: [number, number, number][] = [
  [0.3, 0.1, 0.2], [0.3, 0.1, -0.2], [-0.3, 0.1, 0.2], [-0.3, 0.1, -0.2],
]

function RoverModel({ driving }: { driving: boolean }) {
  const body = useRef<THREE.Group>(null)
  const wheels = useRef<THREE.Group[]>([])

  useFrame((_, dt) => {
    if (!driving) return
    if (body.current) {
      body.current.position.x += dt * 0.7
      if (body.current.position.x > 2.6) body.current.position.x = -2.6
    }
    wheels.current.forEach((w) => { if (w) w.rotation.z -= dt * 6 })
  })

  return (
    <group ref={body} position={[0, 0.22, 0]}>
      {WHEEL_POS.map((p, i) => (
        <group key={i} position={p} ref={(g) => { if (g) wheels.current[i] = g }}>
          <Wheel />
        </group>
      ))}

      <group position={[0, 0.16, 0]}>
        <ChassisPlate />
      </group>

      {/* drivetrain tucked under the deck */}
      <group position={[0, 0.04, 0.22]}><Gearmotor /></group>
      <group position={[0, 0.04, -0.22]}><Gearmotor /></group>

      {/* electronics deck on standoffs */}
      {STANDOFF_POS.map((p, i) => (
        <group key={i} position={p}><Standoff /></group>
      ))}
      <group position={[0.08, 0.22, 0]}><ControllerBoard /></group>
      <group position={[-0.4, 0.26, 0.0]}><BatteryPack /></group>

      {/* forward-facing range sensor */}
      <group position={[0.66, 0.18, 0]}><UltrasonicEyes /></group>
    </group>
  )
}

function ArmModel({ driving }: { driving: boolean }) {
  const j0 = useRef<THREE.Group>(null) // base yaw
  const j1 = useRef<THREE.Group>(null) // shoulder pitch
  const j2 = useRef<THREE.Group>(null) // elbow pitch
  const fA = useRef<THREE.Mesh>(null)
  const fB = useRef<THREE.Mesh>(null)
  const t = useRef(0)

  useFrame((_, dt) => {
    if (!driving) return
    t.current = (t.current + dt) % 1000
    const tt = t.current
    if (j0.current) j0.current.rotation.y = Math.sin(tt * 0.6) * 0.6
    if (j1.current) j1.current.rotation.z = Math.sin(tt * 0.9) * 0.4 - 0.15
    if (j2.current) j2.current.rotation.z = Math.sin(tt * 1.3) * 0.6 - 0.3
    const open = 0.05 + (Math.sin(tt * 2.2) * 0.5 + 0.5) * 0.12
    if (fA.current) fA.current.position.z = open
    if (fB.current) fB.current.position.z = -open
  })

  return (
    <group position={[0, 0, 0]}>
      {/* base turntable */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.1, 32]} />
        <meshStandardMaterial color={C.aluDark} metalness={0.6} roughness={0.4} />
      </mesh>

      <group ref={j0} position={[0, 0.1, 0]}>
        <group position={[0, 0.16, 0]}><Servo /></group>

        <group ref={j1} position={[0, 0.32, 0]}>
          <group position={[0, 0.45, 0]}><Bracket length={0.9} /></group>

          <group ref={j2} position={[0, 0.9, 0]}>
            <group position={[0, 0.05, 0]}><Servo color="#10243f" /></group>
            <group position={[0, 0.4, 0]}><Bracket length={0.6} /></group>

            {/* wrist + gripper */}
            <group position={[0, 0.74, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.26, 0.12, 0.3]} />
                <meshStandardMaterial color={C.chassis} metalness={0.3} roughness={0.5} />
              </mesh>
              <mesh ref={fA} position={[0, 0.16, 0.08]} castShadow>
                <boxGeometry args={[0.07, 0.26, 0.05]} />
                <meshStandardMaterial color={C.alu} metalness={0.8} roughness={0.35} />
              </mesh>
              <mesh ref={fB} position={[0, 0.16, -0.08]} castShadow>
                <boxGeometry args={[0.07, 0.26, 0.05]} />
                <meshStandardMaterial color={C.alu} metalness={0.8} roughness={0.35} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

export function Viewport3D() {
  const design = useStore((s) => s.design)
  const driving = useStore((s) => s.driving)
  const setDriving = useStore((s) => s.setDriving)
  const placePart = useStore((s) => s.placePart)
  const pushLog = useStore((s) => s.pushLog)
  const cam = useStore((s) => s.cam)
  const scene = useStore((s) => s.scene)
  const isArm = design?.archetype.id === 'n_dof_arm'
  const isMultiArm = design?.archetype.id === 'multi_arm_station'
  const isAutomaton = design?.archetype.id === 'humanoid_automaton'
  const clockwork = /clockwork|gear|brass|escapement|balance.?wheel|automaton/i.test(design?.spec.taskSummary ?? '')

  const onDrop = (e: RDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const part = id ? partById(id) : undefined
    if (part) placePart(part)
  }

  return (
    <div className="rf-viewport">
      <div className="rf-canvas-wrap" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [3.4, 2.5, 4], fov: 48 }}>
          <color attach="background" args={['#9aa6b2']} />
          <fog attach="fog" args={['#9aa6b2', 9, 18]} />
          <hemisphereLight args={['#ffffff', '#404a57', 0.55]} />
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[4, 7, 4]}
            intensity={1.15}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={22}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <directionalLight position={[-5, 3, -3]} intensity={0.35} />

          {scene
            ? <SceneRenderer scene={scene} driving={driving} />
            : isMultiArm
            ? <SurgicalModel driving={driving} arms={design?.spec.armCount ?? 4} />
            : isAutomaton
              ? <AutomatonModel driving={driving} clockwork={clockwork} />
              : isArm
                ? <ArmModel driving={driving} />
                : <RoverModel driving={driving} />}

          <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={11} blur={2.4} far={4} resolution={1024} color="#11161d" />
          <gridHelper args={[16, 16, '#7c8896', '#5b6573']} position={[0, -0.002, 0]} />
          <CameraController />
          <OrbitControls makeDefault enablePan screenSpacePanning minDistance={2.2} maxDistance={13} target={[0, 0.5, 0]} />
        </Canvas>
        <div className="rf-canvas-tag">
          {scene
            ? `Auto-generated: ${scene.name}`
            : isMultiArm
            ? `Multi-Arm Station — ${design?.spec.armCount ?? 4} arms`
            : isAutomaton
              ? (clockwork ? 'Clockwork Automaton' : 'Humanoid Automaton')
              : isArm ? 'N-DOF Arm — ROM + grasp' : 'Diff-Drive Rover — locomotion'}
        </div>
        <div className="rf-camnav">
          <button title="Pan up" onClick={() => cam('pan-up')}>↑</button>
          <div className="rf-camnav-row">
            <button title="Pan left" onClick={() => cam('pan-left')}>←</button>
            <button title="Reset view" onClick={() => cam('reset')}>⛶</button>
            <button title="Pan right" onClick={() => cam('pan-right')}>→</button>
          </div>
          <button title="Pan down" onClick={() => cam('pan-down')}>↓</button>
          <div className="rf-camnav-row">
            <button title="Zoom in" onClick={() => cam('zoom-in')}>＋</button>
            <button title="Zoom out" onClick={() => cam('zoom-out')}>－</button>
          </div>
        </div>
      </div>
      <div className="rf-drivebar">
        <button onClick={() => { const d = !driving; setDriving(d); pushLog('info', d ? 'Drive / animation started' : 'Drive stopped') }}>
          {driving ? '■ Stop' : '▶ Drive / Animate'}
        </button>
        <span className="rf-dim">
          {driving ? 'Simulating motion…' : 'Press to run the real-time mobility demo. Drag to orbit.'}
        </span>
      </div>
    </div>
  )
}

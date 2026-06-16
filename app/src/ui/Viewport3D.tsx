import type { DragEvent as RDragEvent, ReactNode, ChangeEvent } from 'react'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, SoftShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { CameraController } from './CameraController'
import { SceneRenderer } from './SceneRenderer'
import { robotHolder } from './robotRef'
import { exportGLB, exportSTL } from './exporters3d'
import { toBomCsv, toDesignJson, download, parseDesignJson } from '../core/export'
import { EffectComposer, N8AO, Bloom, ToneMapping, SMAA, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { suspend } from 'suspend-react'

// Self-hosted CC0 HDRI for image-based lighting (free, @pmndrs/assets MIT).
const cityHdri = import('@pmndrs/assets/hdri/city.exr') as Promise<{ default: string }>
import { useStore } from '../state/store'
import { partById } from '../data/parts'

// Locomotion: when driving, ground robots (roll) travel forward and loop across
// the floor; aerial robots (fly) hover-bob and slowly yaw in place. Wheels and
// propellers keep spinning via their per-node axis/spinRate.
function DrivingRig({ roll, fly, driving, children }: { roll: boolean; fly: boolean; driving: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    const o = ref.current
    if (!o) return
    const d = Math.min(dt, 0.05)
    if (driving && roll) {
      o.position.z -= d * 1.1                       // travel forward
      if (o.position.z < -3.2) o.position.z = 3.2   // loop back into view
    } else if (driving && fly) {
      o.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.18 + 0.18  // gentle hover bob
      o.rotation.y += d * 0.4                        // slow yaw
    } else {
      if (o.position.z !== 0) o.position.z = 0
      if (o.position.y !== 0) o.position.y = 0
    }
  })
  return <group ref={ref}>{children}</group>
}

export function Viewport3D() {
  const design = useStore((s) => s.design)
  const driving = useStore((s) => s.driving)
  const setDriving = useStore((s) => s.setDriving)
  const placePart = useStore((s) => s.placePart)
  const pushLog = useStore((s) => s.pushLog)
  const cam = useStore((s) => s.cam)
  const scene = useStore((s) => s.scene)
  const plan = useStore((s) => s.plan)
  const generating = useStore((s) => s.generating)
  const cliError = useStore((s) => s.cliError)
  const setDesign = useStore((s) => s.setDesign)
  const setScene = useStore((s) => s.setScene)
  const setPlan = useStore((s) => s.setPlan)
  const setStatus = useStore((s) => s.setStatus)
  const fileRef = useRef<HTMLInputElement>(null)
  const lt = design?.spec.locomotionType
  const roll = lt === 'wheeled_differential' || lt === 'wheeled_omni' || lt === 'tracked'
  const fly = lt === 'aerial_multirotor'

  const onDrop = (e: RDragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const part = id ? partById(id) : undefined
    if (part) placePart(part)
  }

  const onLoad = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    f.text().then((t) => {
      const { design: d, scene: sc, plan: pl } = parseDesignJson(t)
      setDesign(d); setScene(sc); setPlan(pl)
      pushLog('info', `loaded project: ${d.archetype.name}`); setStatus('Project loaded from design.json.')
    }).catch((err) => { pushLog('warn', `load failed: ${err.message}`); setStatus('Load failed — not a valid design.json.') })
    e.target.value = ''
  }

  return (
    <div className="rf-viewport">
      <div className="rf-canvas-wrap" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.NoToneMapping }} camera={{ position: [3.4, 2.5, 4], fov: 48 }}>
          <color attach="background" args={['#9aa6b2']} />
          <fog attach="fog" args={['#9aa6b2', 9, 18]} />
          <hemisphereLight args={['#ffffff', '#404a57', 0.55]} />
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[4, 7, 4]}
            intensity={1.15}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={22}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
            shadow-bias={-0.0004}
          />
          <directionalLight position={[-5, 3, -3]} intensity={0.35} />
          <SoftShadows size={26} samples={16} focus={0.9} />
          <Environment files={(suspend(cityHdri) as { default: string }).default} environmentIntensity={1.1} />

          <group ref={(g) => { robotHolder.current = g }}>
            {scene
              ? <DrivingRig roll={roll} fly={fly} driving={driving}><SceneRenderer scene={scene} driving={driving} /></DrivingRig>
              : (
                <Html center className="rf-empty3d">
                  {generating ? (
                    <div><b>Generating 3D…</b><br />the LLM is modeling your robot (~30–60s)</div>
                  ) : cliError ? (
                    <div>3D unavailable: {cliError}<br />3D generation needs the local CLI — run <code>npm run dev</code>.</div>
                  ) : design ? (
                    <div>No 3D scene returned.<br />3D generation needs the local CLI — run <code>npm run dev</code>, not a static preview.</div>
                  ) : (
                    <div>Press <b>Generate design</b> — the LLM builds the 3D model here.</div>
                  )}
                </Html>
              )}
          </group>

          <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={11} blur={2.6} far={4} resolution={1024} color="#0d1117" />
          <gridHelper args={[16, 16, '#7c8896', '#5b6573']} position={[0, -0.002, 0]} />
          <CameraController />
          <OrbitControls makeDefault enablePan screenSpacePanning minDistance={2.2} maxDistance={13} target={[0, 0.5, 0]} />
          <EffectComposer multisampling={0}>
            <N8AO aoRadius={0.6} intensity={1.5} distanceFalloff={1} />
            <Bloom luminanceThreshold={0.82} intensity={0.6} mipmapBlur />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <SMAA />
            <Vignette eskil={false} offset={0.25} darkness={0.5} />
          </EffectComposer>
        </Canvas>
        <div className="rf-canvas-tag">
          {scene ? `Auto-generated: ${scene.name}` : design ? 'Design ready — building 3D…' : 'No model yet'}
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
      <div className="rf-exportbar">
        <span className="rf-dim">Export / handoff:</span>
        <button disabled={!design} onClick={() => { if (exportGLB(scene?.name ?? design?.archetype.name ?? 'robot')) pushLog('info', 'exported .glb (3D mesh)') }}>.glb</button>
        <button disabled={!design} onClick={() => { if (exportSTL(scene?.name ?? design?.archetype.name ?? 'robot')) pushLog('info', 'exported .stl (3D print)') }}>.stl</button>
        <button disabled={!design} onClick={() => { if (design) { download('bom.csv', toBomCsv(design, plan), 'text/csv'); pushLog('info', 'exported BOM.csv') } }}>BOM.csv</button>
        <button disabled={!design} onClick={() => { if (design) { download('design.json', toDesignJson(design, scene, plan), 'application/json'); pushLog('info', 'exported design.json') } }}>design.json</button>
        <button onClick={() => fileRef.current?.click()}>Load .json</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onLoad} />
      </div>
    </div>
  )
}

import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { SceneNode, SceneSpec } from '../core/scene'

/** Physically-based material — clearcoat + IBL reflections make primitives read
 *  as real manufactured surfaces instead of flat blocks (drei/three, MIT). */
function Mat({ color, metalness, roughness }: { color: string; metalness: number; roughness: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      clearcoat={0.35}
      clearcoatRoughness={Math.min(0.6, roughness + 0.1)}
      envMapIntensity={1.25}
    />
  )
}

function Gear({ r, teeth, thickness, color, metalness, roughness }: {
  r: number; teeth: number; thickness: number; color: string; metalness: number; roughness: number
}) {
  const tn = Math.max(6, Math.min(28, Math.round(teeth)))
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, thickness, 32]} />
        <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={0.35} envMapIntensity={1.25} />
      </mesh>
      {Array.from({ length: tn }).map((_, i) => {
        const a = (i / tn) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (r + r * 0.12), Math.sin(a) * (r + r * 0.12), 0]} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[r * 0.3, r * 0.22, thickness]} />
            <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={0.35} envMapIntensity={1.25} />
          </mesh>
        )
      })}
    </group>
  )
}

function geom(node: SceneNode): ReactNode {
  const s = node.size ?? []
  const mat = <Mat color={node.color} metalness={node.metalness} roughness={node.roughness} />
  switch (node.shape) {
    case 'group':
      return null
    case 'box': {
      const w = s[0] ?? 0.3, h = s[1] ?? 0.3, d = s[2] ?? 0.3
      // soft beveled edges read as machined parts, not flat blocks
      const radius = Math.min(0.035, Math.min(w, h, d) * 0.24)
      return <RoundedBox args={[w, h, d]} radius={radius} smoothness={3} castShadow receiveShadow>{mat}</RoundedBox>
    }
    case 'cylinder':
      return <mesh castShadow><cylinderGeometry args={[s[0] ?? 0.2, s[1] ?? (s[0] ?? 0.2), s[2] ?? 0.4, 32]} />{mat}</mesh>
    case 'sphere':
      return <mesh castShadow><sphereGeometry args={[s[0] ?? 0.2, 32, 24]} />{mat}</mesh>
    case 'cone':
      return <mesh castShadow><coneGeometry args={[s[0] ?? 0.2, s[1] ?? 0.4, 32]} />{mat}</mesh>
    case 'torus':
      return <mesh castShadow><torusGeometry args={[s[0] ?? 0.2, s[1] ?? 0.05, 16, 32]} />{mat}</mesh>
    case 'gear':
      return <Gear r={s[0] ?? 0.2} teeth={s[1] ?? 12} thickness={s[2] ?? 0.06} color={node.color} metalness={node.metalness} roughness={node.roughness} />
  }
}

function NodeView({ node, driving }: { node: SceneNode; driving: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    const o = ref.current
    if (!o || !driving) return
    if (node.spin) {
      o.rotation.x += node.spin[0] * dt
      o.rotation.y += node.spin[1] * dt
      o.rotation.z += node.spin[2] * dt
    }
    if (node.swing) {
      const base = node.rot
      const b = node.swing.axis === 'x' ? base[0] : node.swing.axis === 'y' ? base[1] : base[2]
      const v = b + node.swing.amp * Math.sin(state.clock.elapsedTime * node.swing.freq)
      if (node.swing.axis === 'x') o.rotation.x = v
      else if (node.swing.axis === 'y') o.rotation.y = v
      else o.rotation.z = v
    }
  })
  return (
    <group ref={ref} position={node.pos} rotation={node.rot}>
      {geom(node)}
      {node.children?.map((c, i) => <NodeView key={i} node={c} driving={driving} />)}
    </group>
  )
}

/** Renders an LLM-authored primitive scene — the "automatic" text-to-3D path. */
export function SceneRenderer({ scene, driving }: { scene: SceneSpec; driving: boolean }) {
  return <group>{scene.nodes.map((nd, i) => <NodeView key={i} node={nd} driving={driving} />)}</group>
}

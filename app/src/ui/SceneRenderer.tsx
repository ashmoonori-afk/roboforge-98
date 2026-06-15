import { useRef } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneNode, SceneSpec } from '../core/scene'

function Gear({ r, teeth, thickness, color, metalness, roughness }: {
  r: number; teeth: number; thickness: number; color: string; metalness: number; roughness: number
}) {
  const tn = Math.max(6, Math.min(28, Math.round(teeth)))
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, thickness, 26]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
      </mesh>
      {Array.from({ length: tn }).map((_, i) => {
        const a = (i / tn) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (r + r * 0.12), Math.sin(a) * (r + r * 0.12), 0]} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[r * 0.3, r * 0.22, thickness]} />
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
          </mesh>
        )
      })}
    </group>
  )
}

function geom(node: SceneNode): ReactNode {
  const s = node.size ?? []
  const mat = <meshStandardMaterial color={node.color} metalness={node.metalness} roughness={node.roughness} />
  switch (node.shape) {
    case 'group':
      return null
    case 'box':
      return <mesh castShadow receiveShadow><boxGeometry args={[s[0] ?? 0.3, s[1] ?? 0.3, s[2] ?? 0.3]} />{mat}</mesh>
    case 'cylinder':
      return <mesh castShadow><cylinderGeometry args={[s[0] ?? 0.2, s[1] ?? (s[0] ?? 0.2), s[2] ?? 0.4, 24]} />{mat}</mesh>
    case 'sphere':
      return <mesh castShadow><sphereGeometry args={[s[0] ?? 0.2, 24, 16]} />{mat}</mesh>
    case 'cone':
      return <mesh castShadow><coneGeometry args={[s[0] ?? 0.2, s[1] ?? 0.4, 24]} />{mat}</mesh>
    case 'torus':
      return <mesh castShadow><torusGeometry args={[s[0] ?? 0.2, s[1] ?? 0.05, 12, 24]} />{mat}</mesh>
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

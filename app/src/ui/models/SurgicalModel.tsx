import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WHITE = '#eef2f6'
const WHITE2 = '#dde5ec'
const ACCENT = '#2b6cb0'
const STEEL = '#b8c0c8'

/**
 * Fixed-base multi-arm robot (Da Vinci-style surgical / workcell): white
 * medical-grade column + N radial articulated arms + a central camera.
 */
export function SurgicalModel({ driving, arms = 4 }: { driving: boolean; arms?: number }) {
  const j1s = useRef<THREE.Group[]>([])
  const j2s = useRef<THREE.Group[]>([])
  const t = useRef(0)
  const n = Math.max(2, Math.min(6, Math.round(arms) || 4))

  useFrame((_, dt) => {
    if (!driving) return
    t.current = (t.current + dt) % 1000
    j1s.current.forEach((g, i) => { if (g) g.rotation.z = -0.5 + Math.sin(t.current * 0.8 + i) * 0.12 })
    j2s.current.forEach((g, i) => { if (g) g.rotation.z = 0.85 + Math.sin(t.current * 1.1 + i * 1.3) * 0.15 })
  })

  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.85, 0.3, 48]} />
        <meshStandardMaterial color={WHITE} metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.42, 1.5, 40]} />
        <meshStandardMaterial color={WHITE} metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.1, 40]} />
        <meshStandardMaterial color={ACCENT} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <sphereGeometry args={[0.44, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={WHITE2} metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.0, 0.34]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.16, 24]} />
        <meshStandardMaterial color="#111111" metalness={0.6} roughness={0.3} />
      </mesh>

      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2
        return (
          <group key={i} rotation={[0, a, 0]}>
            <group position={[0.42, 1.62, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color={ACCENT} metalness={0.4} roughness={0.4} />
              </mesh>
              <group ref={(g) => { if (g) j1s.current[i] = g }} rotation={[0, 0, -0.5]}>
                <mesh position={[0.45, 0, 0]} castShadow>
                  <boxGeometry args={[0.9, 0.12, 0.12]} />
                  <meshStandardMaterial color={WHITE} metalness={0.2} roughness={0.4} />
                </mesh>
                <group ref={(g) => { if (g) j2s.current[i] = g }} position={[0.9, 0, 0]} rotation={[0, 0, 0.85]}>
                  <mesh position={[0.4, 0, 0]} castShadow>
                    <boxGeometry args={[0.8, 0.09, 0.09]} />
                    <meshStandardMaterial color={WHITE2} metalness={0.2} roughness={0.4} />
                  </mesh>
                  <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                    <cylinderGeometry args={[0.02, 0.012, 0.34, 10]} />
                    <meshStandardMaterial color={STEEL} metalness={0.85} roughness={0.3} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        )
      })}
    </group>
  )
}

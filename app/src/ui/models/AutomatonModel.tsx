import { useRef } from 'react'
import type { Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

function Gear({ r, teeth, thickness, color }: { r: number; teeth: number; thickness: number; color: string }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, thickness, 28]} />
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.35} />
      </mesh>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * (r + 0.025), Math.sin(a) * (r + 0.025), 0]} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[0.06, 0.045, thickness]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.35} />
          </mesh>
        )
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r * 0.22, r * 0.22, thickness + 0.02, 12]} />
        <meshStandardMaterial color="#2a2113" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  )
}

/**
 * Bipedal mechanical figure. With `clockwork`, it is rendered in brass with
 * exposed, continuously-turning gears, gear-eyes and a rocking balance wheel —
 * a clockwork automaton. Otherwise a plain steel android.
 */
export function AutomatonModel({ driving, clockwork = true }: { driving: boolean; clockwork?: boolean }) {
  const gears = useRef<THREE.Group[]>([])
  const balance = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const t = useRef(0)

  const BRASS = clockwork ? '#b5892f' : '#aeb6bd'
  const BRASS2 = clockwork ? '#caa24a' : '#c9d1d9'
  const COPPER = clockwork ? '#b87333' : '#8a929b'
  const DARK = clockwork ? '#4a3a1c' : '#3a4048'

  useFrame((_, dt) => {
    t.current = (t.current + dt) % 1000
    gears.current.forEach((g, i) => { if (g) g.rotation.z += dt * (1.2 + i * 0.5) * (i % 2 ? -1 : 1) })
    if (balance.current) balance.current.rotation.y = Math.sin(t.current * 6) * 0.5
    if (driving) {
      if (armL.current) armL.current.rotation.x = Math.sin(t.current * 1.5) * 0.25
      if (armR.current) armR.current.rotation.x = -Math.sin(t.current * 1.5) * 0.25
    }
  })

  const leg = (x: number) => (
    <group position={[x, 0.95, 0]}>
      <mesh position={[0, -0.25, 0]} castShadow><boxGeometry args={[0.18, 0.5, 0.18]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.4} /></mesh>
      <mesh position={[0, -0.7, 0]} castShadow><boxGeometry args={[0.15, 0.45, 0.15]} /><meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.45} /></mesh>
      <mesh position={[0, -0.95, 0.05]} castShadow><boxGeometry args={[0.2, 0.1, 0.34]} /><meshStandardMaterial color={DARK} metalness={0.6} roughness={0.5} /></mesh>
    </group>
  )

  const arm = (ref: Ref<THREE.Group>, x: number) => (
    <group ref={ref} position={[x, 1.7, 0]}>
      <mesh position={[0, -0.25, 0]} castShadow><boxGeometry args={[0.14, 0.5, 0.14]} /><meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.45} /></mesh>
      <mesh position={[0, -0.62, 0]} castShadow><boxGeometry args={[0.12, 0.42, 0.12]} /><meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.4} /></mesh>
      <mesh position={[0, -0.86, 0]} castShadow><boxGeometry args={[0.14, 0.12, 0.16]} /><meshStandardMaterial color={DARK} /></mesh>
    </group>
  )

  return (
    <group>
      <mesh position={[0, 0.98, 0]} castShadow><boxGeometry args={[0.5, 0.22, 0.3]} /><meshStandardMaterial color={DARK} metalness={0.7} roughness={0.45} /></mesh>
      {leg(-0.16)}
      {leg(0.16)}

      <RoundedBox args={[0.6, 0.7, 0.36]} radius={0.05} position={[0, 1.45, 0]} castShadow>
        <meshStandardMaterial color={BRASS} metalness={0.85} roughness={0.4} />
      </RoundedBox>
      <group position={[0, 1.5, 0.2]} ref={(g) => { if (g) gears.current[0] = g }}><Gear r={0.18} teeth={14} thickness={0.05} color={BRASS2} /></group>
      <group position={[0.16, 1.62, 0.21]} ref={(g) => { if (g) gears.current[1] = g }}><Gear r={0.1} teeth={10} thickness={0.05} color={COPPER} /></group>
      <group position={[-0.17, 1.3, 0.21]} ref={(g) => { if (g) gears.current[2] = g }}><Gear r={0.12} teeth={11} thickness={0.05} color={BRASS2} /></group>

      {arm(armL, -0.36)}
      {arm(armR, 0.36)}

      <mesh position={[0, 1.86, 0]} castShadow><cylinderGeometry args={[0.08, 0.08, 0.12, 16]} /><meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.4} /></mesh>
      <RoundedBox args={[0.34, 0.34, 0.34]} radius={0.05} position={[0, 2.08, 0]} castShadow>
        <meshStandardMaterial color={BRASS2} metalness={0.85} roughness={0.4} />
      </RoundedBox>
      <group position={[-0.08, 2.1, 0.18]} ref={(g) => { if (g) gears.current[3] = g }}><Gear r={0.05} teeth={8} thickness={0.03} color={DARK} /></group>
      <group position={[0.08, 2.1, 0.18]} ref={(g) => { if (g) gears.current[4] = g }}><Gear r={0.05} teeth={8} thickness={0.03} color={DARK} /></group>

      <group ref={balance} position={[0, 2.34, 0]}>
        <mesh castShadow><torusGeometry args={[0.16, 0.02, 8, 24]} /><meshStandardMaterial color={BRASS2} metalness={0.9} roughness={0.3} /></mesh>
        <mesh castShadow><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.4} /></mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow><boxGeometry args={[0.3, 0.02, 0.02]} /><meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.4} /></mesh>
      </group>
    </group>
  )
}

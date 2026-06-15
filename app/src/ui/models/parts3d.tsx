import { RoundedBox } from '@react-three/drei'

// Shared palette tuned to look like real maker hardware.
export const C = {
  chassis: '#2b3340',
  alu: '#b8c0c8',
  aluDark: '#8a929b',
  tire: '#15181d',
  rim: '#c9d1d9',
  hub: '#6b7480',
  motorGold: '#caa24a',
  motorCan: '#9aa3ad',
  pcb: '#15616d',
  header: '#0a0a0a',
  usb: '#c9d1d9',
  servo: '#1b4f8a',
  horn: '#e2e8f0',
  battery: '#7a1f2b',
  accent: '#48bb78',
}

/** Flat structural deck (acrylic/aluminium look). */
export function ChassisPlate({ w = 1.3, d = 0.95 }: { w?: number; d?: number }) {
  return (
    <RoundedBox args={[w, 0.05, d]} radius={0.045} smoothness={4} castShadow receiveShadow>
      <meshStandardMaterial color={C.chassis} metalness={0.35} roughness={0.5} />
    </RoundedBox>
  )
}

export function Standoff({ h = 0.18 }: { h?: number }) {
  return (
    <mesh castShadow>
      <cylinderGeometry args={[0.025, 0.025, h, 10]} />
      <meshStandardMaterial color={C.aluDark} metalness={0.85} roughness={0.3} />
    </mesh>
  )
}

/** Rubber tire + metal rim + hub + spokes. Axle runs along local Z. */
export function Wheel() {
  const spokes = [0, 1, 2, 3, 4].map((i) => (i * Math.PI) / 5)
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 30]} />
        <meshStandardMaterial color={C.tire} roughness={0.95} metalness={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.13, 26]} />
        <meshStandardMaterial color={C.rim} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 14]} />
        <meshStandardMaterial color={C.hub} roughness={0.4} metalness={0.85} />
      </mesh>
      {spokes.map((a, i) => (
        <mesh key={i} rotation={[0, 0, a]}>
          <boxGeometry args={[0.25, 0.028, 0.02]} />
          <meshStandardMaterial color={C.rim} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/** TT-style gearmotor: gearbox + motor can + output shaft. Shaft along local Z. */
export function Gearmotor() {
  return (
    <group>
      <RoundedBox args={[0.22, 0.22, 0.46]} radius={0.03} smoothness={3} castShadow>
        <meshStandardMaterial color={C.motorGold} metalness={0.25} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0, -0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.3, 22]} />
        <meshStandardMaterial color={C.motorCan} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 12]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  )
}

/** Arduino-style controller board: PCB + header rows + USB + chip + power LED. */
export function ControllerBoard() {
  const headers = Array.from({ length: 11 }, (_, i) => -0.33 + i * 0.066)
  return (
    <group>
      <RoundedBox args={[0.74, 0.04, 0.52]} radius={0.012} smoothness={2} castShadow receiveShadow>
        <meshStandardMaterial color={C.pcb} metalness={0.1} roughness={0.6} />
      </RoundedBox>
      {headers.map((x, i) => (
        <mesh key={'t' + i} position={[x, 0.05, 0.22]}>
          <boxGeometry args={[0.03, 0.07, 0.045]} />
          <meshStandardMaterial color={C.header} roughness={0.4} />
        </mesh>
      ))}
      {headers.map((x, i) => (
        <mesh key={'b' + i} position={[x, 0.05, -0.22]}>
          <boxGeometry args={[0.03, 0.07, 0.045]} />
          <meshStandardMaterial color={C.header} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.36, 0.07, 0.05]} castShadow>
        <boxGeometry args={[0.16, 0.11, 0.15]} />
        <meshStandardMaterial color={C.usb} metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0.06, 0.055, 0]}>
        <boxGeometry args={[0.18, 0.035, 0.18]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.05, 0.2]}>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
        <meshStandardMaterial color="#ff5252" emissive="#ff2020" emissiveIntensity={0.9} />
      </mesh>
    </group>
  )
}

/** Hobby servo body with mounting flange + output horn (horn faces +Y). */
export function Servo({ color = C.servo }: { color?: string }) {
  return (
    <group>
      <RoundedBox args={[0.4, 0.36, 0.2]} radius={0.02} smoothness={3} castShadow>
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.58, 0.04, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.21, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
        <meshStandardMaterial color={C.horn} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Aluminium U-channel bracket, long axis = local Y. */
export function Bracket({ length = 0.8 }: { length?: number }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.13, length, 0.12]} />
        <meshStandardMaterial color={C.alu} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.085]} castShadow>
        <boxGeometry args={[0.13, length, 0.02]} />
        <meshStandardMaterial color={C.aluDark} metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.085]} castShadow>
        <boxGeometry args={[0.13, length, 0.02]} />
        <meshStandardMaterial color={C.aluDark} metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  )
}

/** HC-SR04-style ultrasonic sensor; transducers face +X. */
export function UltrasonicEyes() {
  return (
    <group>
      <RoundedBox args={[0.06, 0.2, 0.46]} radius={0.01} smoothness={2} castShadow>
        <meshStandardMaterial color={C.pcb} metalness={0.1} roughness={0.6} />
      </RoundedBox>
      {[-0.12, 0.12].map((z, i) => (
        <mesh key={i} position={[0.06, 0, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.085, 0.085, 0.09, 22]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.5} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

/** LiPo battery pack with leads. */
export function BatteryPack() {
  return (
    <group>
      <RoundedBox args={[0.5, 0.16, 0.3]} radius={0.02} smoothness={3} castShadow>
        <meshStandardMaterial color={C.battery} metalness={0.1} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0.28, 0.02, 0.05]}>
        <boxGeometry args={[0.07, 0.04, 0.03]} />
        <meshStandardMaterial color={C.motorGold} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.02, -0.05]}>
        <boxGeometry args={[0.07, 0.04, 0.03]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}

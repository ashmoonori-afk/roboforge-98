import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../state/store'

const HOME = new THREE.Vector3(3.4, 2.5, 4)
const TARGET = new THREE.Vector3(0, 0.5, 0)

type Ctrl = { target: THREE.Vector3; update: () => void } | null

/** Applies discrete camera moves (pan/zoom/reset) requested from the UI buttons. */
export function CameraController() {
  const camCmd = useStore((s) => s.camCmd)
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls) as unknown as Ctrl

  useEffect(() => {
    if (!camCmd) return
    const target = controls?.target ?? TARGET.clone()
    const step = 0.4
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize()
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize()
    const dir = new THREE.Vector3().subVectors(target, camera.position).normalize()
    const move = (v: THREE.Vector3) => {
      camera.position.add(v)
      target.add(v)
    }
    switch (camCmd.kind) {
      case 'pan-left': move(right.multiplyScalar(-step)); break
      case 'pan-right': move(right.multiplyScalar(step)); break
      case 'pan-up': move(up.multiplyScalar(step)); break
      case 'pan-down': move(up.multiplyScalar(-step)); break
      case 'zoom-in': camera.position.addScaledVector(dir, step); break
      case 'zoom-out': camera.position.addScaledVector(dir, -step); break
      case 'reset': camera.position.copy(HOME); target.copy(TARGET); break
    }
    controls?.update?.()
    // Only react to a new command (camCmd.seq); camera/controls are stable refs.
  }, [camCmd]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

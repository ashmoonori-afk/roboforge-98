import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { robotHolder } from './robotRef'
import { download } from '../core/export'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'robot'

/** Export the current robot as a binary glTF (.glb) — for Blender / engines / viewers. */
export function exportGLB(name = 'robot'): boolean {
  const obj = robotHolder.current
  if (!obj) return false
  new GLTFExporter().parse(
    obj,
    (result) => download(`${slug(name)}.glb`, new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' })),
    () => undefined,
    { binary: true },
  )
  return true
}

/** Export the current robot as ASCII STL — for 3D printing / slicers. */
export function exportSTL(name = 'robot'): boolean {
  const obj = robotHolder.current
  if (!obj) return false
  const stl = new STLExporter().parse(obj, { binary: false })
  download(`${slug(name)}.stl`, new Blob([stl], { type: 'model/stl' }))
  return true
}

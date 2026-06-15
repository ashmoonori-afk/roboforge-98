import type * as THREE from 'three'

/** Live handle to the rendered robot Object3D, used by the 3D exporters. */
export const robotHolder: { current: THREE.Object3D | null } = { current: null }

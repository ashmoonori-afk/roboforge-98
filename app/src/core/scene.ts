// A primitive-based 3D scene the LLM emits so ANY prompt can be auto-modeled,
// then rendered generically by ui/SceneRenderer. Kept dependency-free + defensive
// (LLM output is untrusted: shapes validated, numbers clamped, node count capped).

export type Shape = 'box' | 'cylinder' | 'sphere' | 'cone' | 'torus' | 'gear' | 'group'
const SHAPES: Shape[] = ['box', 'cylinder', 'sphere', 'cone', 'torus', 'gear', 'group']

export interface Swing { axis: 'x' | 'y' | 'z'; amp: number; freq: number }

export interface SceneNode {
  shape: Shape
  size?: number[]
  pos: [number, number, number]
  rot: [number, number, number]
  color: string
  metalness: number
  roughness: number
  spin?: [number, number, number]
  swing?: Swing
  children?: SceneNode[]
}

export interface SceneSpec {
  name: string
  nodes: SceneNode[]
}

const NODE_BUDGET = 200
const MAX_DEPTH = 8

const n = (v: unknown, d: number) => (typeof v === 'number' && isFinite(v) ? v : d)
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const vec3 = (v: unknown, d: [number, number, number]): [number, number, number] =>
  Array.isArray(v) && v.length >= 3 ? [n(v[0], d[0]), n(v[1], d[1]), n(v[2], d[2])] : d
const hex = (v: unknown) => (typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : '#9aa3ad')

function node(raw: unknown, budget: { n: number }, depth: number): SceneNode | null {
  if (!raw || typeof raw !== 'object' || budget.n <= 0 || depth > MAX_DEPTH) return null
  budget.n--
  const r = raw as Record<string, unknown>
  const shape: Shape = SHAPES.includes(r.shape as Shape) ? (r.shape as Shape) : 'box'
  const out: SceneNode = {
    shape,
    size: Array.isArray(r.size) ? r.size.slice(0, 3).map((x) => n(x, 0.2)) : undefined,
    pos: vec3(r.pos, [0, 0, 0]),
    rot: vec3(r.rot, [0, 0, 0]),
    color: hex(r.color),
    metalness: clamp01(n(r.metalness, 0.6)),
    roughness: clamp01(n(r.roughness, 0.5)),
  }
  if (Array.isArray(r.spin)) out.spin = vec3(r.spin, [0, 0, 0])
  const sw = r.swing as Record<string, unknown> | undefined
  if (sw && (sw.axis === 'x' || sw.axis === 'y' || sw.axis === 'z')) {
    out.swing = { axis: sw.axis, amp: n(sw.amp, 0.2), freq: Math.max(0.1, n(sw.freq, 1)) }
  }
  if (Array.isArray(r.children)) {
    const kids = r.children.map((c) => node(c, budget, depth + 1)).filter(Boolean) as SceneNode[]
    if (kids.length) out.children = kids
  }
  return out
}

export function normalizeScene(raw: unknown): SceneSpec | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (!Array.isArray(r.nodes)) return null
  const budget = { n: NODE_BUDGET }
  const nodes = r.nodes.map((c) => node(c, budget, 0)).filter(Boolean) as SceneNode[]
  if (!nodes.length) return null
  return { name: typeof r.name === 'string' && r.name ? r.name : 'Generated robot', nodes }
}

import type { RequirementsSpec, LocomotionType, DesignPlan } from './types'
import { normalizeScene, type SceneSpec } from './scene'

const LOCO: LocomotionType[] = [
  'wheeled_differential', 'wheeled_omni', 'tracked', 'legged_quadruped',
  'arm_manipulator', 'stationary', 'humanoid', 'unknown',
]

/** Coerce an untrusted CLI JSON blob into a valid RequirementsSpec. */
function normalize(raw: Record<string, unknown>, prompt: string): RequirementsSpec {
  const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : null)
  const int = (v: unknown) => (typeof v === 'number' && isFinite(v) ? Math.round(v) : null)
  const locoRaw = raw.locomotionType
  const loco: LocomotionType = LOCO.includes(locoRaw as LocomotionType)
    ? (locoRaw as LocomotionType)
    : 'unknown'
  const ts = raw.taskSummary
  const ambig = raw.ambiguities
  return {
    taskSummary: typeof ts === 'string' && ts ? ts : prompt.trim(),
    locomotionType: loco === 'unknown' ? 'wheeled_differential' : loco,
    wheelCount: int(raw.wheelCount),
    armCount: int(raw.armCount),
    payloadKg: num(raw.payloadKg),
    manipulation: !!raw.manipulation,
    environmentIndoor: raw.environmentIndoor !== false,
    ambiguities: Array.isArray(ambig)
      ? (ambig as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 6)
      : [],
  }
}

function normalizePlan(raw: unknown): DesignPlan | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)
  const arr = (v: unknown) => (Array.isArray(v) ? v : [])
  const c = r.controller as Record<string, unknown> | undefined
  const controller = c && typeof c === 'object'
    ? {
        name: str(c.name, 'Microcontroller'),
        mcu: str(c.mcu) || undefined,
        pins: arr(c.pins).filter((x): x is string => typeof x === 'string').slice(0, 80),
      }
    : null
  const components = arr(r.components).slice(0, 48).map((x, i) => {
    const o = x as Record<string, unknown>
    return {
      id: str(o.id) || `c${i + 1}`,
      label: str(o.label) || `C${i + 1}`,
      name: str(o.name, 'Component'),
      category: str(o.category, 'OTHER'),
      iface: str(o.iface ?? o.interface, 'none'),
      specs: str(o.specs),
      qty: typeof o.qty === 'number' && isFinite(o.qty) ? Math.max(1, Math.round(o.qty)) : 1,
      note: str(o.note) || undefined,
    }
  })
  const connections = arr(r.connections)
    .slice(0, 120)
    .map((x, i) => {
      const o = x as Record<string, unknown>
      return { id: `w${i + 1}_${str(o.from)}`, from: str(o.from), pin: str(o.pin), net: str(o.net) || undefined, signal: str(o.signal) || undefined }
    })
    .filter((x) => x.from && x.pin)
  const steps = arr(r.steps).filter((x): x is string => typeof x === 'string').slice(0, 14)
  const summary = str(r.summary)
  if (!components.length && !summary) return null
  return { summary, controller, components, connections, steps }
}

export interface NlResult {
  spec: RequirementsSpec
  scene: SceneSpec | null
  durationMs: number | null
}

export interface PlanResult {
  plan: DesignPlan | null
  durationMs: number | null
}

/**
 * Natural-language → RequirementsSpec via the dev-server local-CLI endpoint
 * (`/api/nl-design`, which summons the local `claude` CLI). Throws when the
 * endpoint is unavailable (e.g. production/static build) so the caller can fall
 * back to the rule-based parser.
 */
// In-memory caches: re-generating the same prompt returns instantly (latency hedge).
const nlCache = new Map<string, NlResult>()
const planCache = new Map<string, PlanResult>()

export async function designFromCli(prompt: string, mode: 'fast' | 'quality' = 'quality'): Promise<NlResult> {
  const key = `${mode}|${prompt.trim()}`
  const hit = nlCache.get(key)
  if (hit) return hit
  const res = await fetch('/api/nl-design', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, mode }),
  })
  if (!res.ok) throw new Error(`endpoint ${res.status}`)
  const data = (await res.json()) as {
    ok: boolean; spec?: Record<string, unknown>; scene?: unknown; error?: string; durationMs?: number | null
  }
  if (!data.ok || !data.spec) throw new Error(data.error || 'cli failed')
  const result: NlResult = {
    spec: normalize(data.spec, prompt),
    scene: normalizeScene(data.scene),
    durationMs: data.durationMs ?? null,
  }
  nlCache.set(key, result)
  return result
}

/** LLM engineering design (controller + components + wiring + steps) via /api/design. */
export async function designPlanFromCli(prompt: string, mode: 'fast' | 'quality' = 'quality'): Promise<PlanResult> {
  const key = `${mode}|${prompt.trim()}`
  const hit = planCache.get(key)
  if (hit) return hit
  const res = await fetch('/api/design', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, mode }),
  })
  if (!res.ok) throw new Error(`endpoint ${res.status}`)
  const data = (await res.json()) as { ok: boolean; design?: unknown; error?: string; durationMs?: number | null }
  if (!data.ok) throw new Error(data.error || 'cli failed')
  const result: PlanResult = { plan: normalizePlan(data.design), durationMs: data.durationMs ?? null }
  planCache.set(key, result)
  return result
}

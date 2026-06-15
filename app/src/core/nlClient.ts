import type { RequirementsSpec, LocomotionType } from './types'
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

export interface NlResult {
  spec: RequirementsSpec
  scene: SceneSpec | null
  durationMs: number | null
}

/**
 * Natural-language → RequirementsSpec via the dev-server local-CLI endpoint
 * (`/api/nl-design`, which summons the local `claude` CLI). Throws when the
 * endpoint is unavailable (e.g. production/static build) so the caller can fall
 * back to the rule-based parser.
 */
export async function designFromCli(prompt: string): Promise<NlResult> {
  const res = await fetch('/api/nl-design', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  if (!res.ok) throw new Error(`endpoint ${res.status}`)
  const data = (await res.json()) as {
    ok: boolean; spec?: Record<string, unknown>; scene?: unknown; error?: string; durationMs?: number | null
  }
  if (!data.ok || !data.spec) throw new Error(data.error || 'cli failed')
  return { spec: normalize(data.spec, prompt), scene: normalizeScene(data.scene), durationMs: data.durationMs ?? null }
}

import type { Board, Part, PinKind } from './types'

export interface Assignment {
  pinId: string
  partId: string
}

export interface AssignResult {
  ok: boolean
  reason?: string
  assignments: Assignment[]   // new array (immutability); unchanged on failure
}

export function pinSupports(board: Board, pinId: string, kind: PinKind): boolean {
  const pin = board.pins.find((p) => p.id === pinId)
  return !!pin && pin.kinds.includes(kind)
}

/**
 * Try to wire `part` to `pinId`. Returns a NEW assignments array on success,
 * or the original array + a human reason on failure. Pure + deterministic.
 */
export function assignPart(
  board: Board,
  current: Assignment[],
  pinId: string,
  part: Part,
): AssignResult {
  const pin = board.pins.find((p) => p.id === pinId)
  if (!pin) return fail(current, `Unknown pin "${pinId}"`)
  if (current.some((a) => a.pinId === pinId))
    return fail(current, `Pin ${pinId} is already in use`)

  const need = part.pinKind
  if (!need) return fail(current, `${part.name} is mechanical — nothing to wire`)
  if (!pin.kinds.includes(need))
    return fail(current, `${part.name} needs a ${need} pin; ${pinId} can't provide it`)

  return { ok: true, assignments: [...current, { pinId, partId: part.id }] }
}

export function unassignPin(current: Assignment[], pinId: string): Assignment[] {
  return current.filter((a) => a.pinId !== pinId)
}

/** Count of pins that can host a signal (excludes pure POWER/GND rails). */
export function pinUsage(board: Board, assignments: Assignment[]) {
  const total = board.pins.filter(
    (p) => p.kinds.some((k) => k !== 'POWER' && k !== 'GND'),
  ).length
  const used = assignments.length
  return { used, total, free: Math.max(0, total - used) }
}

function fail(assignments: Assignment[], reason: string): AssignResult {
  return { ok: false, reason, assignments }
}

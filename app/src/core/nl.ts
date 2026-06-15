import type { RequirementsSpec, LocomotionType, Archetype, ArchetypeId } from './types'
import { round2 } from './math'
import { archetypes } from '../data/archetypes'

const HUMANOID_RE = /(automaton|android|humanoid|anthropomorphic|bipedal|biped|two legs|mechanical (man|figure)|clockwork (man|figure|robot|automaton))/

/**
 * Rule-based stand-in for the LLM requirement-extraction stage (F3 MVP fallback).
 * Deterministic + pure so it is unit-testable and offline-runnable. The real
 * product swaps this for the local `claude` CLI (dev) / Claude tool-use (prod)
 * with the same RequirementsSpec shape.
 */
export function extractSpec(input: string): RequirementsSpec {
  const text = input.toLowerCase()
  const ambiguities: string[] = []

  let armCount: number | null = null
  const armNum = text.match(/(\d+)\s*(?:highly\s+articulated\s+)?(?:robotic\s+)?(?:arm|manipulator)/)
  const multiArm = /multi[-\s]?arm/.test(text)
  if (armNum) armCount = parseInt(armNum[1], 10)
  else if (multiArm) armCount = 4

  const humanoidLike = HUMANOID_RE.test(text)
  const surgicalLike = /(surgical|surgery|da\s*vinci|operating|medical robot|laparoscop)/.test(text)
  const stationaryLike = surgicalLike || /(stationary|benchtop|bench top|desktop arm|mounted|fixed base|workcell)/.test(text)
  const mobile = /(wheel|rover|drive|driving|track|tank|legs?|walk|quadruped|omni|mecanum)/.test(text)

  let locomotionType: LocomotionType = 'unknown'
  if (humanoidLike) locomotionType = 'humanoid'
  else if (stationaryLike && !mobile) locomotionType = 'stationary'
  else if (/(\barm\b|manipulat|gripper|pick|grasp|grab)/.test(text) && armCount === null) locomotionType = 'arm_manipulator'
  else if (/(track|tank|caterpillar)/.test(text)) locomotionType = 'tracked'
  else if (/(omni|mecanum)/.test(text)) locomotionType = 'wheeled_omni'
  else if (/(wheel|rover|drive|driving)/.test(text)) locomotionType = 'wheeled_differential'
  else if (/(quadruped|legged|\bwalk|\bleg\b)/.test(text)) locomotionType = 'legged_quadruped'
  else if (armCount !== null) locomotionType = 'stationary'

  let wheelCount: number | null = null
  const wheelMatch = text.match(/(\d+)\s*[- ]?\s*wheel/)
  if (wheelMatch) wheelCount = parseInt(wheelMatch[1], 10)

  let payloadKg: number | null = null
  const kg = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilogram)/)
  const g = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram)\b/)
  const lb = text.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound)/)
  if (kg) payloadKg = parseFloat(kg[1])
  else if (lb) payloadKg = round2(parseFloat(lb[1]) * 0.453592)
  else if (g) payloadKg = parseFloat(g[1]) / 1000
  if (payloadKg === null && /(carry|payload|lift|haul|transport)/.test(text)) {
    payloadKg = 1
    ambiguities.push('payload mentioned but no mass given — assumed 1 kg')
  }

  const manipulation =
    armCount !== null || humanoidLike || /(\barm\b|gripper|pick|grasp|grab|manipulat|instrument|surgical|limb)/.test(text)
  const environmentIndoor = !/(outdoor|outside|garden|street|terrain|grass|gravel)/.test(text)

  if (locomotionType === 'unknown') {
    ambiguities.push('locomotion type unclear — defaulted to wheeled rover')
  }
  if (multiArm && !armNum) {
    ambiguities.push('"multi-arm" given without a count — assumed 4 arms')
  }

  return {
    taskSummary: input.trim(),
    locomotionType: locomotionType === 'unknown' ? 'wheeled_differential' : locomotionType,
    wheelCount,
    armCount,
    payloadKg,
    manipulation,
    environmentIndoor,
    ambiguities,
  }
}

/** Pick the best-fit archetype from the library. */
export function matchArchetype(spec: RequirementsSpec): Archetype {
  const ts = spec.taskSummary.toLowerCase()
  let id: ArchetypeId
  if (spec.locomotionType === 'humanoid' || HUMANOID_RE.test(ts)) {
    id = 'humanoid_automaton'
  } else if ((spec.armCount ?? 0) >= 2 || (spec.locomotionType === 'stationary' && spec.manipulation)) {
    id = 'multi_arm_station'
  } else if (spec.locomotionType === 'arm_manipulator') {
    id = 'n_dof_arm'
  } else {
    id = 'diff_drive_rover'
  }
  return archetypes.find((a) => a.id === id) ?? archetypes[0]
}

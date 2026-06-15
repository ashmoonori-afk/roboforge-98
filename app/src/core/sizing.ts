import type { RequirementsSpec, SizingResult } from './types'
import { round2, round3 } from './math'

// Constants carry a source (see docs/FEATURES/F3-nl-auto-design.md + research/03).
const G = 9.81                      // m/s^2
const ROLLING_FRICTION = 0.03       // flat hard floor, mid of 0.015–0.05
const DRIVETRAIN_EFFICIENCY = 0.8   // 0.7–0.85
const WHEEL_RADIUS_M = 0.04         // 40 mm default wheel
const SAFETY_FACTOR = 1.75          // 1.5–2.0
const BASE_ROBOT_MASS_KG = 1.2
const DRIVE_POWER_W = 10            // nominal drive power
const MISSION_MIN = 30              // nominal runtime target
const BATTERY_VOLTAGE = 7.4         // 2S LiPo nominal

/**
 * Closed-form sizing. Rolling-resistance-only torque at constant speed on flat
 * ground (MVP). This is a design sketch with a safety factor, NOT validated
 * engineering. Pure + deterministic so it can be unit-tested.
 */
export function sizeDesign(spec: RequirementsSpec): SizingResult {
  const payload = spec.payloadKg ?? 0
  const estMassKg = round2(BASE_ROBOT_MASS_KG + payload)
  const notes: string[] = []

  const wheeled =
    spec.locomotionType === 'wheeled_differential' ||
    spec.locomotionType === 'wheeled_omni' ||
    spec.locomotionType === 'tracked'
  // τ = (m·g·μ·r) / η  × SF  (drive torque only for wheeled/tracked bases)
  const torqueNm = (estMassKg * G * ROLLING_FRICTION * WHEEL_RADIUS_M) / DRIVETRAIN_EFFICIENCY
  const motorTorqueNm = wheeled ? round3(torqueNm * SAFETY_FACTOR) : 0

  // Battery: Ah = (P · t_h) / V ; mAh = Ah · 1000 · SF
  const hours = MISSION_MIN / 60
  const capacityAh = (DRIVE_POWER_W * hours) / BATTERY_VOLTAGE
  const batteryCapacityMah = Math.round(capacityAh * 1000 * SAFETY_FACTOR)

  notes.push(wheeled
    ? `Torque = rolling resistance only (μ=${ROLLING_FRICTION}), flat ground, SF=${SAFETY_FACTOR}.`
    : 'Stationary/arm design — drive-motor torque N/A; size joint actuators by reach & payload.')
  notes.push(`Battery sized for ${MISSION_MIN} min @ ${DRIVE_POWER_W} W on a ${BATTERY_VOLTAGE} V pack.`)
  if (payload === 0) notes.push('No payload given — used base chassis mass only.')

  return { motorTorqueNm, batteryCapacityMah, estMassKg, notes }
}

export const sizingConstants = {
  ROLLING_FRICTION, DRIVETRAIN_EFFICIENCY, WHEEL_RADIUS_M,
  SAFETY_FACTOR, BASE_ROBOT_MASS_KG, BATTERY_VOLTAGE,
}

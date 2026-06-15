import { describe, it, expect } from 'vitest'
import { sizeDesign } from './sizing'
import type { RequirementsSpec } from './types'

const base: RequirementsSpec = {
  taskSummary: 't', locomotionType: 'wheeled_differential', wheelCount: 4,
  armCount: null, payloadKg: null, manipulation: false, environmentIndoor: true, ambiguities: [],
}

describe('sizeDesign', () => {
  it('sizes a 1 kg payload rover deterministically', () => {
    const r = sizeDesign({ ...base, payloadKg: 1 })
    expect(r.estMassKg).toBe(2.2)
    expect(r.motorTorqueNm).toBe(0.057)
    expect(r.batteryCapacityMah).toBe(1182)
  })

  it('handles no payload (base chassis mass only)', () => {
    const r = sizeDesign({ ...base, payloadKg: null })
    expect(r.estMassKg).toBe(1.2)
    expect(r.motorTorqueNm).toBe(0.031)
    expect(r.notes.some((n) => n.includes('No payload'))).toBe(true)
  })

  it('torque grows with payload', () => {
    const light = sizeDesign({ ...base, payloadKg: 0.5 })
    const heavy = sizeDesign({ ...base, payloadKg: 5 })
    expect(heavy.motorTorqueNm).toBeGreaterThan(light.motorTorqueNm)
  })
})

import { describe, it, expect } from 'vitest'
import { assignPart, unassignPin, pinUsage, type Assignment } from './mcu'
import { boardById } from '../data/boards'
import { partById } from '../data/parts'

const uno = boardById('uno')
const servo = partById('srv-sg90')!  // pinKind PWM
const ir = partById('sen-ir')!       // pinKind ANALOG
const imu = partById('sen-mpu')!     // pinKind I2C
const wheel = partById('whl-65')!    // no pinKind (mechanical)

describe('assignPart', () => {
  it('wires a PWM servo to a PWM pin', () => {
    const r = assignPart(uno, [], 'D3', servo)
    expect(r.ok).toBe(true)
    expect(r.assignments).toHaveLength(1)
  })

  it('rejects a PWM servo on a digital-only pin', () => {
    const r = assignPart(uno, [], 'D2', servo)
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/PWM/)
  })

  it('rejects a mechanical part (no pin needed)', () => {
    const r = assignPart(uno, [], 'D3', wheel)
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/mechanical/)
  })

  it('rejects a second part on an occupied pin', () => {
    const first = assignPart(uno, [], 'D3', servo).assignments
    const second = assignPart(uno, first, 'D3', ir)
    expect(second.ok).toBe(false)
    expect(second.reason).toMatch(/already in use/)
  })

  it('routes I2C only to I2C-capable pins', () => {
    expect(assignPart(uno, [], 'A4', imu).ok).toBe(true)   // A4 = ANALOG+I2C
    expect(assignPart(uno, [], 'A0', imu).ok).toBe(false)  // A0 = ANALOG only
  })

  it('does not mutate the input array (immutability)', () => {
    const cur: Assignment[] = []
    assignPart(uno, cur, 'D3', servo)
    expect(cur).toHaveLength(0)
  })
})

describe('pinUsage / unassignPin', () => {
  it('counts signal pins and frees them on unassign', () => {
    const a1 = assignPart(uno, [], 'D3', servo).assignments
    const u1 = pinUsage(uno, a1)
    expect(u1.used).toBe(1)
    expect(u1.free).toBe(u1.total - 1)
    expect(unassignPin(a1, 'D3')).toHaveLength(0)
  })
})

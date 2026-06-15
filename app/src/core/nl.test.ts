import { describe, it, expect } from 'vitest'
import { extractSpec, matchArchetype } from './nl'

describe('extractSpec', () => {
  it('parses a 4-wheel rover carrying 2 kg', () => {
    const s = extractSpec('a small 4-wheel robot that can carry 2kg across a room')
    expect(s.locomotionType).toBe('wheeled_differential')
    expect(s.wheelCount).toBe(4)
    expect(s.payloadKg).toBe(2)
    expect(s.manipulation).toBe(false)
  })

  it('detects an arm with grasp and matches the arm archetype', () => {
    const s = extractSpec('a robotic arm that can grasp a soda can')
    expect(s.locomotionType).toBe('arm_manipulator')
    expect(s.manipulation).toBe(true)
    expect(matchArchetype(s).id).toBe('n_dof_arm')
  })

  it('flags an ambiguity when payload is mentioned without a mass', () => {
    const s = extractSpec('a rover that can carry things')
    expect(s.payloadKg).toBe(1)
    expect(s.ambiguities.length).toBeGreaterThan(0)
  })

  it('does not misread "carries" as a wheel and converts pounds', () => {
    const s = extractSpec('a walking robot that lifts 2 lb')
    expect(s.payloadKg).toBe(0.91)
    expect(s.locomotionType).toBe('legged_quadruped')
  })

  it('defaults vague wheeled hints to the rover archetype', () => {
    const s = extractSpec('something that drives around the office')
    expect(matchArchetype(s).id).toBe('diff_drive_rover')
  })
})

import type { Archetype } from '../core/types'

// MVP ships 2 archetypes; the data model supports more (see docs/ARCHITECTURE.md §1).
export const archetypes: Archetype[] = [
  {
    id: 'diff_drive_rover',
    name: 'Differential-Drive Rover',
    locomotion: 'wheeled_differential',
    description: '2–4 wheel mobile base. The classic maker rover.',
    partSlots: ['MICROCONTROLLER', 'MOTOR', 'WHEEL', 'BATTERY', 'SENSOR'],
  },
  {
    id: 'n_dof_arm',
    name: 'N-DOF Robotic Arm',
    locomotion: 'arm_manipulator',
    description: 'Multi-joint manipulator with a gripper.',
    partSlots: ['MICROCONTROLLER', 'SERVO', 'BRACKET', 'BATTERY', 'SENSOR'],
  },
  {
    id: 'multi_arm_station',
    name: 'Multi-Arm Stationary Robot',
    locomotion: 'stationary',
    description: 'Fixed-base platform with multiple articulated arms (e.g. surgical / workcell).',
    partSlots: ['MICROCONTROLLER', 'SERVO', 'BRACKET', 'SENSOR', 'CABLE'],
  },
  {
    id: 'humanoid_automaton',
    name: 'Humanoid Automaton',
    locomotion: 'humanoid',
    description: 'Bipedal figure with torso, head and articulated limbs (e.g. clockwork automaton, android).',
    partSlots: ['MICROCONTROLLER', 'SERVO', 'BRACKET', 'BATTERY', 'SENSOR'],
  },
]

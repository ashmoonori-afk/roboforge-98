// Shared domain types for RoboForge. Kept dependency-free and pure.

export type SourceName = 'AMAZON' | 'NEXAR' | 'MOUSER' | 'MANUAL'

export type PartCategory =
  | 'MOTOR' | 'SERVO' | 'MICROCONTROLLER' | 'SENSOR'
  | 'BATTERY' | 'WHEEL' | 'BRACKET' | 'CABLE' | 'OTHER'

export type Availability = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN'

export type PinKind =
  | 'DIGITAL' | 'ANALOG' | 'PWM' | 'POWER' | 'GND' | 'I2C' | 'SPI' | 'UART'

export type SpecValue = string | number
export interface PartSpecs { [key: string]: SpecValue }

export interface Part {
  id: string
  name: string
  category: PartCategory
  source: SourceName
  sourceId: string            // ASIN / MPN / Mouser part#
  priceUsd: number | null
  availability: Availability
  productUrl: string
  description: string
  specs: PartSpecs
  /** What kind of MCU pin this part needs when wired (if any). */
  pinKind?: PinKind
}

export interface Pin {
  id: string                  // e.g. "D3"
  label: string               // e.g. "D3 ~PWM"
  kinds: PinKind[]            // capabilities of this physical pin
}

export interface Board {
  id: string
  name: string
  vendor: string
  mcu: string
  voltage: string
  clockMhz: number
  flashKb: number
  ramKb: number
  priceUsd: number
  productUrl: string
  pins: Pin[]
  specs: PartSpecs
}

export type LocomotionType =
  | 'wheeled_differential' | 'wheeled_omni' | 'tracked'
  | 'legged_quadruped' | 'arm_manipulator' | 'stationary' | 'humanoid' | 'unknown'

export interface RequirementsSpec {
  taskSummary: string
  locomotionType: LocomotionType
  wheelCount: number | null
  armCount: number | null
  payloadKg: number | null
  manipulation: boolean
  environmentIndoor: boolean
  ambiguities: string[]
}

export type ArchetypeId =
  | 'diff_drive_rover' | 'n_dof_arm' | 'multi_arm_station' | 'humanoid_automaton'

export interface Archetype {
  id: ArchetypeId
  name: string
  locomotion: LocomotionType
  description: string
  partSlots: PartCategory[]
}

export interface SizingResult {
  motorTorqueNm: number
  batteryCapacityMah: number
  estMassKg: number
  notes: string[]
}

export interface DesignResult {
  spec: RequirementsSpec
  archetype: Archetype
  sizing: SizingResult
}

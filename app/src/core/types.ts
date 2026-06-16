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
  | 'legged_quadruped' | 'arm_manipulator' | 'stationary' | 'humanoid'
  | 'aerial_multirotor' | 'unknown'

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

// LLM-authored build design (the "design assistant" output): a complete,
// possibly complex configuration — controller + components + wiring + steps.
export interface DesignComponent {
  id: string
  label: string      // reference designator: U1, M1, R1, C1, D1, J1 ...
  name: string
  category: string
  iface: string      // PWM | I2C | SPI | UART | ANALOG | DIGITAL | POWER | GND | none
  specs: string      // key electrical specs the LLM matched (voltage/current/interface/value)
  qty: number
  note?: string
}
export interface DesignConnection {
  id: string         // stable row id (for editing/keys)
  from: string       // component id
  pin: string        // controller pin label
  net?: string       // named net: 5V, GND, I2C_SDA, PWM_M1A ...
  signal?: string
}
export interface DesignController {
  name: string
  mcu?: string
  pins: string[]
}
/** Buildability assessment for a design (LLM-judged). */
export type FeasibilityLevel = 'Prototype-ready' | 'Feasible' | 'Ambitious' | 'Speculative'
export interface Feasibility {
  level: FeasibilityLevel
  score: number        // 0-100 overall buildability
  factors: string[]    // what drives the rating (availability, power, complexity, cost)
}
export interface DesignPlan {
  summary: string
  controller: DesignController | null
  components: DesignComponent[]
  connections: DesignConnection[]
  steps: string[]
  warnings?: string[]
  feasibility?: Feasibility
}

import type { PartCategory } from '../core/types'

const TAGS: Record<PartCategory, string> = {
  MOTOR: 'MOT', SERVO: 'SRV', MICROCONTROLLER: 'MCU', SENSOR: 'SEN',
  BATTERY: 'BAT', WHEEL: 'WHL', BRACKET: 'BRK', CABLE: 'CAB', OTHER: 'OTH',
}

export const catTag = (c: PartCategory): string => TAGS[c]

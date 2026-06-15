import type { Board, Pin, PinKind } from '../core/types'

function pin(id: string, kinds: PinKind[]): Pin {
  const tag = kinds.includes('PWM') ? ' ~' : ''
  return { id, label: `${id}${tag}`, kinds }
}

const unoPins: Pin[] = [
  pin('D2', ['DIGITAL']), pin('D3', ['DIGITAL', 'PWM']), pin('D4', ['DIGITAL']),
  pin('D5', ['DIGITAL', 'PWM']), pin('D6', ['DIGITAL', 'PWM']), pin('D7', ['DIGITAL']),
  pin('D8', ['DIGITAL']), pin('D9', ['DIGITAL', 'PWM']), pin('D10', ['DIGITAL', 'PWM', 'SPI']),
  pin('D11', ['DIGITAL', 'PWM', 'SPI']), pin('D12', ['DIGITAL', 'SPI']), pin('D13', ['DIGITAL', 'SPI']),
  pin('A0', ['ANALOG']), pin('A1', ['ANALOG']), pin('A2', ['ANALOG']), pin('A3', ['ANALOG']),
  pin('A4', ['ANALOG', 'I2C']), pin('A5', ['ANALOG', 'I2C']),
  pin('5V', ['POWER']), pin('3V3', ['POWER']), pin('GND', ['GND']),
]

const picoPins: Pin[] = [
  pin('GP0', ['DIGITAL', 'PWM', 'UART']), pin('GP1', ['DIGITAL', 'PWM', 'UART']),
  pin('GP2', ['DIGITAL', 'PWM', 'SPI']), pin('GP3', ['DIGITAL', 'PWM', 'SPI']),
  pin('GP4', ['DIGITAL', 'PWM', 'I2C']), pin('GP5', ['DIGITAL', 'PWM', 'I2C']),
  pin('GP6', ['DIGITAL', 'PWM']), pin('GP7', ['DIGITAL', 'PWM']),
  pin('GP8', ['DIGITAL', 'PWM']), pin('GP9', ['DIGITAL', 'PWM']),
  pin('GP10', ['DIGITAL', 'PWM']), pin('GP11', ['DIGITAL', 'PWM']),
  pin('GP26', ['ANALOG', 'DIGITAL']), pin('GP27', ['ANALOG', 'DIGITAL']), pin('GP28', ['ANALOG', 'DIGITAL']),
  pin('3V3', ['POWER']), pin('VBUS', ['POWER']), pin('GND', ['GND']),
]

const esp32Pins: Pin[] = [
  pin('GPIO4', ['DIGITAL', 'PWM']), pin('GPIO5', ['DIGITAL', 'PWM', 'SPI']),
  pin('GPIO13', ['DIGITAL', 'PWM']), pin('GPIO14', ['DIGITAL', 'PWM']),
  pin('GPIO16', ['DIGITAL', 'PWM', 'UART']), pin('GPIO17', ['DIGITAL', 'PWM', 'UART']),
  pin('GPIO18', ['DIGITAL', 'PWM', 'SPI']), pin('GPIO19', ['DIGITAL', 'PWM', 'SPI']),
  pin('GPIO21', ['DIGITAL', 'PWM', 'I2C']), pin('GPIO22', ['DIGITAL', 'PWM', 'I2C']),
  pin('GPIO25', ['DIGITAL', 'PWM', 'ANALOG']), pin('GPIO26', ['DIGITAL', 'PWM', 'ANALOG']),
  pin('GPIO32', ['DIGITAL', 'PWM', 'ANALOG']), pin('GPIO33', ['DIGITAL', 'PWM', 'ANALOG']),
  pin('GPIO34', ['ANALOG']), pin('GPIO35', ['ANALOG']),
  pin('3V3', ['POWER']), pin('5V', ['POWER']), pin('GND', ['GND']),
]

export const boards: Board[] = [
  {
    id: 'uno', name: 'Arduino Uno R3', vendor: 'Arduino', mcu: 'ATmega328P',
    voltage: '5 V', clockMhz: 16, flashKb: 32, ramKb: 2, priceUsd: 27.6,
    productUrl: 'https://www.mouser.com/c/?q=arduino%20uno%20r3',
    pins: unoPins,
    specs: { 'Digital I/O': 14, 'PWM': 6, 'Analog In': 6, 'Logic': '5 V' },
  },
  {
    id: 'pico', name: 'Raspberry Pi Pico', vendor: 'Raspberry Pi', mcu: 'RP2040',
    voltage: '3.3 V', clockMhz: 133, flashKb: 2048, ramKb: 264, priceUsd: 4.0,
    productUrl: 'https://www.mouser.com/c/?q=raspberry%20pi%20pico',
    pins: picoPins,
    specs: { 'GPIO': 26, 'PWM ch': 16, 'ADC': 3, 'Logic': '3.3 V' },
  },
  {
    id: 'esp32', name: 'ESP32 DevKit v1', vendor: 'Espressif', mcu: 'ESP32-WROOM-32',
    voltage: '3.3 V', clockMhz: 240, flashKb: 4096, ramKb: 520, priceUsd: 9.0,
    productUrl: 'https://www.mouser.com/c/?q=esp32%20devkit',
    pins: esp32Pins,
    specs: { 'GPIO': 25, 'Wi-Fi': 'yes', 'Bluetooth': 'yes', 'Logic': '3.3 V' },
  },
]

export const boardById = (id: string): Board =>
  boards.find((b) => b.id === id) ?? boards[0]

import type { Part } from '../core/types'

/**
 * MVP curated/mock catalog (F2). Sources tagged AMAZON / NEXAR / MOUSER per the
 * "Amazon + 2 options" requirement. Prices/links are illustrative placeholders,
 * NOT live data — the real product fetches via official APIs (see docs/FEATURES/F2).
 */
export const parts: Part[] = [
  // ---- MOTOR ----
  {
    id: 'mot-tt', name: 'TT DC Gearmotor (pair)', category: 'MOTOR', source: 'AMAZON',
    sourceId: 'ASIN-B07GNFYGYQ', priceUsd: 9.99, availability: 'IN_STOCK', pinKind: 'PWM',
    productUrl: 'https://www.amazon.com/dp/B07GNFYGYQ?tag=roboforge-20',
    description: 'Yellow TT motor + gearbox, classic 2WD/4WD rover drive.',
    specs: { Voltage: '3–6 V', 'No-load RPM': 200, 'Stall torque': '0.8 kg·cm', 'Gear ratio': '1:48' },
  },
  {
    id: 'mot-n20', name: 'N20 Micro Gearmotor 6V 200RPM', category: 'MOTOR', source: 'MOUSER',
    sourceId: 'MPN-N20-200', priceUsd: 5.5, availability: 'IN_STOCK', pinKind: 'PWM',
    productUrl: 'https://www.mouser.com/c/?q=n20%20gearmotor',
    description: 'Compact metal-gear motor for small rovers.',
    specs: { Voltage: '6 V', 'No-load RPM': 200, 'Stall torque': '1.5 kg·cm', Shaft: '3 mm D' },
  },
  // ---- WHEEL ----
  {
    id: 'whl-65', name: '65mm Rubber Wheel (pair)', category: 'WHEEL', source: 'AMAZON',
    sourceId: 'ASIN-B08C2X1G7K', priceUsd: 6.99, availability: 'IN_STOCK',
    productUrl: 'https://www.amazon.com/dp/B08C2X1G7K?tag=roboforge-20',
    description: 'Fits TT motor D-shaft. Good all-round indoor traction.',
    specs: { Diameter: '65 mm', Width: '27 mm', Bore: 'TT D-shaft' },
  },
  {
    id: 'whl-mec', name: 'Mecanum Wheel Set (4)', category: 'WHEEL', source: 'NEXAR',
    sourceId: 'OCT-MEC-60', priceUsd: 23.99, availability: 'LOW_STOCK',
    productUrl: 'https://nexar.com/',
    description: 'Omni-directional mecanum wheels for holonomic bases.',
    specs: { Diameter: '60 mm', Rollers: 9, Load: '~3 kg ea' },
  },
  // ---- SERVO ----
  {
    id: 'srv-sg90', name: 'SG90 Micro Servo', category: 'SERVO', source: 'AMAZON',
    sourceId: 'ASIN-B07MLR1498', priceUsd: 3.99, availability: 'IN_STOCK', pinKind: 'PWM',
    productUrl: 'https://www.amazon.com/dp/B07MLR1498?tag=roboforge-20',
    description: '9g hobby servo for grippers and light joints.',
    specs: { Torque: '1.8 kg·cm', Voltage: '4.8–6 V', Speed: '0.1 s/60°', Signal: 'PWM 50 Hz' },
  },
  {
    id: 'srv-mg996', name: 'MG996R Metal-Gear Servo', category: 'SERVO', source: 'MOUSER',
    sourceId: 'MPN-MG996R', priceUsd: 4.5, availability: 'IN_STOCK', pinKind: 'PWM',
    productUrl: 'https://www.mouser.com/c/?q=mg996r',
    description: 'High-torque servo for arm joints.',
    specs: { Torque: '11 kg·cm', Voltage: '4.8–7.2 V', Gears: 'metal', Signal: 'PWM 50 Hz' },
  },
  // ---- BATTERY ----
  {
    id: 'bat-lipo', name: '2S LiPo 1300mAh 7.4V', category: 'BATTERY', source: 'NEXAR',
    sourceId: 'OCT-LIPO-1300', priceUsd: 11.99, availability: 'IN_STOCK', pinKind: 'POWER',
    productUrl: 'https://nexar.com/',
    description: 'Lightweight pack matching the sized capacity.',
    specs: { Voltage: '7.4 V', Capacity: '1300 mAh', 'C-rating': '25C', Connector: 'XT30' },
  },
  {
    id: 'bat-aa', name: '4×AA Battery Holder', category: 'BATTERY', source: 'AMAZON',
    sourceId: 'ASIN-B00YR3R3R', priceUsd: 4.5, availability: 'IN_STOCK', pinKind: 'POWER',
    productUrl: 'https://www.amazon.com/dp/B00YR3R3R?tag=roboforge-20',
    description: 'Simple 6V supply for beginners.',
    specs: { Output: '6 V', Cells: '4×AA', Leads: 'flying' },
  },
  // ---- SENSOR ----
  {
    id: 'sen-sr04', name: 'HC-SR04 Ultrasonic', category: 'SENSOR', source: 'AMAZON',
    sourceId: 'ASIN-B07SC12S6N', priceUsd: 2.99, availability: 'IN_STOCK', pinKind: 'DIGITAL',
    productUrl: 'https://www.amazon.com/dp/B07SC12S6N?tag=roboforge-20',
    description: 'Range finder for obstacle avoidance.',
    specs: { Range: '2–400 cm', Voltage: '5 V', Interface: 'trig/echo (digital)' },
  },
  {
    id: 'sen-mpu', name: 'MPU-6050 IMU', category: 'SENSOR', source: 'MOUSER',
    sourceId: 'MPN-MPU6050', priceUsd: 5.95, availability: 'IN_STOCK', pinKind: 'I2C',
    productUrl: 'https://www.mouser.com/c/?q=mpu6050',
    description: '6-axis accel + gyro for balance/orientation.',
    specs: { Axes: 6, Interface: 'I2C', Voltage: '3.3–5 V' },
  },
  {
    id: 'sen-ir', name: 'IR Line Sensor', category: 'SENSOR', source: 'NEXAR',
    sourceId: 'OCT-IR-TCRT', priceUsd: 2.5, availability: 'IN_STOCK', pinKind: 'ANALOG',
    productUrl: 'https://nexar.com/',
    description: 'Reflective sensor for line-following.',
    specs: { Output: 'analog', Voltage: '3.3–5 V', Range: '~1 cm' },
  },
  // ---- BRACKET (mechanical — not wireable) ----
  {
    id: 'brk-servo', name: 'Aluminum Servo Bracket', category: 'BRACKET', source: 'AMAZON',
    sourceId: 'ASIN-B0721M6L1S', priceUsd: 6.99, availability: 'IN_STOCK',
    productUrl: 'https://www.amazon.com/dp/B0721M6L1S?tag=roboforge-20',
    description: 'Multi-purpose bracket for joints. (Mechanical part.)',
    specs: { Material: 'aluminum', Fits: 'MG996R/MG995', Note: 'manual-entry mechanical' },
  },
  // ---- CABLE (mechanical) ----
  {
    id: 'cab-jmp', name: 'Jumper Wire Set (120pc)', category: 'CABLE', source: 'AMAZON',
    sourceId: 'ASIN-B01EV70C78', priceUsd: 4.99, availability: 'IN_STOCK',
    productUrl: 'https://www.amazon.com/dp/B01EV70C78?tag=roboforge-20',
    description: 'M-M / M-F / F-F Dupont wires.',
    specs: { Count: 120, Length: '20 cm', Type: 'Dupont' },
  },
]

export const partById = (id: string): Part | undefined => parts.find((p) => p.id === id)

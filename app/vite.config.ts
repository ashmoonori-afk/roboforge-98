import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'

// Dev-only: "summon" the local Claude CLI for NL design (no paid API). Two small,
// reliable calls — /api/nl-design (spec + 3D scene) and /api/design (engineering
// build design) — instead of one large, slow, error-prone combined call.

const SPEC_INSTRUCTION = [
  'You are a robot design + 3D modeling assistant. From the user\'s goal, output ONLY one',
  'minified JSON object (no prose, no markdown fences) with two keys: "spec" and "scene".',
  '"spec" = {"taskSummary":string,"locomotionType":"wheeled_differential"|"wheeled_omni"|"tracked"|"legged_quadruped"|"arm_manipulator"|"stationary"|"humanoid"|"unknown","wheelCount":integer|null,"armCount":integer|null,"payloadKg":number|null,"manipulation":boolean,"environmentIndoor":boolean,"ambiguities":string[]}.',
  'Use "stationary" for fixed-base/surgical/multi-arm (set armCount); "humanoid" for automaton/android/bipedal figures.',
  '"scene" = {"name":string,"nodes":[Node,...]} — a 3D model of the robot from primitives that the app renders directly.',
  'Node = {"shape":"box"|"cylinder"|"sphere"|"cone"|"torus"|"gear"|"group","size":[numbers],"pos":[x,y,z],"rot":[x,y,z],"color":"#hex","metalness":0..1,"roughness":0..1,"axis":[x,y,z]?,"spinRate":number?,"swing":{"axis":"x"|"y"|"z","amp":number,"freq":number}?,"children":[Node]?}.',
  'size by shape: box[w,h,d], cylinder[radiusTop,radiusBottom,height], sphere[r], cone[r,h], torus[r,tube], gear[r,teeth,thickness], group=none.',
  'DYNAMIC PARTS (wheels, gears, rotors, drums): the part is its OWN node and its geometry is CENTERED on the node origin (pos) so that origin is the rotation centre. Give "axis" = the unit vector the hub points along in the SCENE frame (Y is up, robot forward is -Z) i.e. the visible spin axis, and "spinRate" = signed rad/s (sign sets direction).',
  'The robot drives FORWARD along -Z. Ground wheels mount with their hub axis HORIZONTAL and across the robot (world X), so axis is [1,0,0] (model the cylinder lying on its side, e.g. rot=[0,0,1.5708]); for forward roll set spinRate so the wheel top moves toward -Z (typical |spinRate| 6-10). Use "swing" for limbs/arms instead of axis/spinRate.',
  'Compose a clearly RECOGNIZABLE model (~10-16 nodes); match colour/material (brass gears, white medical housing, black tires, dark joints). Units are meters; height ~1.5-2.5; lowest point near y=0. Output JSON only.',
].join('\n')

const DESIGN_INSTRUCTION = [
  'You are a senior robotics/electronics design engineer. From the user\'s robot goal, output ONLY one minified JSON object (no prose, no fences):',
  '{"summary":string,"controller":{"name":string,"mcu":string,"pins":[string]},"components":[{"id":string,"label":string,"name":string,"category":string,"iface":"PWM"|"I2C"|"SPI"|"UART"|"ANALOG"|"DIGITAL"|"POWER"|"GND"|"none","specs":string,"qty":integer,"note":string}],"connections":[{"from":componentId,"pin":controllerPin,"net":string,"signal":string}],"steps":[string]}.',
  'Include AS MANY components as a real build needs — typically 20-40: every sensor, actuator, motor driver, power source, voltage regulator, level shifter, decoupling/bulk capacitor, pull-up/current-limit resistor, connector, fuse, switch, indicator LED and mounting/mechanical part. Do not omit support parts.',
  'LABEL every component with a reference designator in "label" (U#, M#, R#, C#, D#, J#, SW#, LED#, REG#).',
  'For "specs", state the KEY electrical specs you SELECTED to MATCH the requirement (voltage, current, interface/I2C-address, value, torque, etc.); judge each part against the goal and justify the choice in "note".',
  'Design the WIRING STRUCTURE: give EVERY connection a "net" name so connections form coherent nets — power rails (5V, 3V3, VIN), grounds (GND), buses (I2C_SDA, I2C_SCL, SPI_MOSI/MISO/SCK, UART_TX/RX) and signal nets (PWM_M1A, etc.). Wire each electrical component to the right controller pins/nets for its iface.',
  'Give 5-10 assembly + wiring steps. Output JSON only.',
].join('\n')

const CLI_TIMEOUT_MS = 280_000

function runClaude(prompt: string, model: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', '--model', model, '--strict-mcp-config', '--setting-sources', 'project', '--output-format', 'json'], {
      shell: process.platform === 'win32',
      windowsHide: true,
    })
    let out = ''
    let err = ''
    const timer = setTimeout(() => { child.kill(); reject(new Error('claude CLI timeout')) }, CLI_TIMEOUT_MS)
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (err += d))
    child.on('error', (e) => { clearTimeout(timer); reject(e) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code !== 0) reject(new Error(`claude exit ${code}: ${err.slice(0, 200) || '(no stderr)'}`))
      else if (!out) reject(new Error('claude produced no output'))
      else resolve(out)
    })
    child.stdin.write(prompt)
    child.stdin.end()
  })
}

function extractJson(text: string): unknown {
  const t = text.replace(/```(?:json)?/gi, '').trim()
  const start = t.indexOf('{')
  if (start < 0) throw new Error('no JSON object in CLI output')
  let depth = 0, inStr = false, esc = false, end = -1
  for (let i = start; i < t.length; i++) {
    const ch = t[i]
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue }
    if (ch === '"') inStr = true
    else if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) { end = i; break }
  }
  const slice = (end >= 0 ? t.slice(start, end + 1) : t.slice(start)).replace(/,\s*([}\]])/g, '$1')
  return JSON.parse(slice)
}

/** Run the CLI once, parse + extract; retry once on transient/parse failure. */
async function runWithRetry(fullPrompt: string, model: string) {
  let lastErr: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await runClaude(fullPrompt, model)
      const wrap = JSON.parse(raw) as { result?: string; duration_ms?: number }
      const parsed = extractJson(typeof wrap.result === 'string' ? wrap.result : raw)
      return { parsed, ms: wrap.duration_ms ?? null, attempt }
    } catch (e) { lastErr = e }
  }
  throw lastErr
}

/** A POST handler that runs the CLI with `instruction` and replies { ok, ...map(parsed) }. */
function cliRoute(instruction: string, map: (parsed: any, ms: number | null) => Record<string, unknown>) {
  return (req: any, res: any) => {
    if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
    let body = ''
    req.on('data', (c: Buffer) => (body += c))
    req.on('end', async () => {
      res.setHeader('content-type', 'application/json')
      try {
        const { prompt, mode } = JSON.parse(body || '{}')
        if (!prompt || typeof prompt !== 'string') throw new Error('missing prompt')
        const model = mode === 'fast' ? 'haiku' : 'opus'
        const { parsed, ms, attempt } = await runWithRetry(`${instruction}\n\nUSER GOAL: ${prompt}`, model)
        res.end(JSON.stringify({ ok: true, attempt, ...map(parsed, ms) }))
      } catch (e) {
        res.end(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }))
      }
    })
  }
}

const REDESIGN_INSTRUCTION = [
  'You are a senior robotics/electronics design engineer REVISING an existing robot build design.',
  'You are given the ORIGINAL GOAL and the CURRENT DESIGN as JSON. Improve, validate and refine it:',
  'fix wiring errors, add missing support parts (regulators, decoupling/bulk caps, pull-ups, fuses, connectors, level shifters),',
  'remove redundant parts, correct interfaces/pins, and make every connection reference a real component id with a coherent net.',
  'Output ONLY one minified JSON object (no prose, no fences) in EXACTLY the same schema as the input design:',
  '{"summary":string,"controller":{"name":string,"mcu":string,"pins":[string]},"components":[{"id":string,"label":string,"name":string,"category":string,"iface":"PWM"|"I2C"|"SPI"|"UART"|"ANALOG"|"DIGITAL"|"POWER"|"GND"|"none","specs":string,"qty":integer,"note":string}],"connections":[{"from":componentId,"pin":controllerPin,"net":string,"signal":string}],"steps":[string]}.',
  'Keep stable component ids where the part is unchanged. Label every component with a reference designator (U#, M#, R#, C#, D#, J#, SW#, LED#, REG#).',
  'Give EVERY connection a "net" name so connections form coherent nets (power rails, grounds, buses, signal nets). Provide 5-10 assembly + wiring steps. Output JSON only.',
].join('\n')

/** Like cliRoute, but also forwards the CURRENT PLAN json to the CLI (redesign). */
function planCliRoute(instruction: string, map: (parsed: any, ms: number | null) => Record<string, unknown>) {
  return (req: any, res: any) => {
    if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
    let body = ''
    req.on('data', (c: Buffer) => (body += c))
    req.on('end', async () => {
      res.setHeader('content-type', 'application/json')
      try {
        const { prompt, plan, mode } = JSON.parse(body || '{}')
        if (!prompt || typeof prompt !== 'string') throw new Error('missing prompt')
        if (!plan || typeof plan !== 'object') throw new Error('missing plan')
        const model = mode === 'fast' ? 'haiku' : 'opus'
        const full = `${instruction}\n\nORIGINAL GOAL: ${prompt}\n\nCURRENT DESIGN (JSON):\n${JSON.stringify(plan)}`
        const { parsed, ms, attempt } = await runWithRetry(full, model)
        res.end(JSON.stringify({ ok: true, attempt, ...map(parsed, ms) }))
      } catch (e) {
        res.end(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }))
      }
    })
  }
}

function nlCliPlugin() {
  return {
    name: 'roboforge-nl-cli',
    configureServer(server: { middlewares: { use: (path: string, fn: (req: any, res: any) => void) => void } }) {
      server.middlewares.use('/api/nl-design', cliRoute(SPEC_INSTRUCTION, (p, ms) => ({
        spec: p?.spec ?? p,
        scene: p?.scene ?? null,
        durationMs: ms,
      })))
      server.middlewares.use('/api/design', cliRoute(DESIGN_INSTRUCTION, (p, ms) => ({
        design: p,
        durationMs: ms,
      })))
      server.middlewares.use('/api/redesign', planCliRoute(REDESIGN_INSTRUCTION, (p, ms) => ({
        design: p, durationMs: ms,
      })))
    },
  }
}

export default defineConfig({
  plugins: [react(), nlCliPlugin()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})

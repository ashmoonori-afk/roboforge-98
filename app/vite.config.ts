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
  'Node = {"shape":"box"|"cylinder"|"sphere"|"cone"|"torus"|"gear"|"group","size":[numbers],"pos":[x,y,z],"rot":[x,y,z],"color":"#hex","metalness":0..1,"roughness":0..1,"spin":[x,y,z]?,"swing":{"axis":"x"|"y"|"z","amp":number,"freq":number}?,"children":[Node]?}.',
  'size by shape: box[w,h,d], cylinder[radiusTop,radiusBottom,height], sphere[r], cone[r,h], torus[r,tube], gear[r,teeth,thickness], group=none.',
  'Compose a clearly RECOGNIZABLE model (~12-22 nodes); match colour/material (brass gears, white medical housing, black tires, dark joints). Units are meters; height ~1.5-2.5; lowest point near y=0. Use "spin" (rad/s) for wheels/gears/rotors and "swing" for limbs. Output JSON only.',
].join('\n')

const DESIGN_INSTRUCTION = [
  'You are a robotics design engineer. From the user\'s robot goal, output ONLY one minified JSON',
  'object (no prose, no fences): {"summary":string,"controller":{"name":string,"mcu":string,"pins":[string]},"components":[{"id":string,"name":string,"category":string,"iface":"PWM"|"I2C"|"SPI"|"UART"|"ANALOG"|"DIGITAL"|"POWER"|"GND"|"none","qty":integer,"note":string}],"connections":[{"from":componentId,"pin":controllerPin,"signal":string}],"steps":[string]}.',
  'Pick a real microcontroller; include the components the robot needs (sensors, motor drivers, actuators, power, regulators, comms); wire EACH electrical component to a specific controller pin in "connections" consistent with its iface; give 4-8 assembly steps. Output JSON only.',
].join('\n')

function runClaude(prompt: string, model: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', '--model', model, '--strict-mcp-config', '--setting-sources', 'project', '--output-format', 'json'], {
      shell: process.platform === 'win32',
      windowsHide: true,
    })
    let out = ''
    let err = ''
    const timer = setTimeout(() => { child.kill(); reject(new Error('claude CLI timeout')) }, 180000)
    child.stdout.on('data', (d) => (out += d))
    child.stderr.on('data', (d) => (err += d))
    child.on('error', (e) => { clearTimeout(timer); reject(e) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (!out) reject(new Error(`claude exit ${code}: ${err.slice(0, 200)}`))
      else resolve(out)
    })
    child.stdin.write(prompt)
    child.stdin.end()
  })
}

function extractJson(text: string): unknown {
  const a = text.indexOf('{')
  const b = text.lastIndexOf('}')
  if (a < 0 || b < 0) throw new Error('no JSON object in CLI output')
  return JSON.parse(text.slice(a, b + 1))
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
        const raw = await runClaude(`${instruction}\n\nUSER GOAL: ${prompt}`, model)
        const wrap = JSON.parse(raw) as { result?: string; duration_ms?: number }
        const parsed = extractJson(typeof wrap.result === 'string' ? wrap.result : raw)
        res.end(JSON.stringify({ ok: true, ...map(parsed, wrap.duration_ms ?? null) }))
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

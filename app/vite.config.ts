import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'

// --- Dev-only natural-language design via a LOCAL CLI (`claude`) ---
// During development we "summon" the local Claude Code CLI instead of a paid API.
// In production builds this route does not exist; the client falls back to the
// rule-based parser (see src/core/nl.ts / src/core/nlClient.ts).

const SPEC_INSTRUCTION = [
  'You are a robot design + 3D modeling assistant. From the user\'s goal, output ONLY one',
  'minified JSON object (no prose, no markdown fences) with two keys: "spec" and "scene".',
  '"spec" = {"taskSummary":string,"locomotionType":"wheeled_differential"|"wheeled_omni"|"tracked"|"legged_quadruped"|"arm_manipulator"|"stationary"|"humanoid"|"unknown","wheelCount":integer|null,"armCount":integer|null,"payloadKg":number|null,"manipulation":boolean,"environmentIndoor":boolean,"ambiguities":string[]}.',
  'Use "stationary" for fixed-base/surgical/multi-arm (set armCount); "humanoid" for automaton/android/bipedal figures.',
  '"scene" = {"name":string,"nodes":[Node,...]} — a 3D model of the robot from primitives that the app renders directly.',
  'Node = {"shape":"box"|"cylinder"|"sphere"|"cone"|"torus"|"gear"|"group","size":[numbers],"pos":[x,y,z],"rot":[x,y,z],"color":"#hex","metalness":0..1,"roughness":0..1,"spin":[x,y,z]?,"swing":{"axis":"x"|"y"|"z","amp":number,"freq":number}?,"children":[Node]?}.',
  'size by shape: box[w,h,d], cylinder[radiusTop,radiusBottom,height], sphere[r], cone[r,h], torus[r,tube], gear[r,teeth,thickness], group=none.',
  'Compose 14-40 nodes into a clearly RECOGNIZABLE model of the described robot; use color/material to match it (e.g. brass gears, white medical housing, black tires, dark metal joints).',
  'Units are meters; total height ~1.5-2.5; rest the lowest point near y=0 (on the ground). Use "spin" (rad/s) for wheels/gears/rotors and "swing" for limbs/arms. Transforms compose through "children". Output JSON only.',
].join('\n')

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Opus for best extraction quality; still skip MCP/global settings to cut startup overhead.
    const child = spawn('claude', ['-p', '--model', 'opus', '--strict-mcp-config', '--setting-sources', 'project', '--output-format', 'json'], {
      shell: process.platform === 'win32',
      windowsHide: true,
    })
    let out = ''
    let err = ''
    const timer = setTimeout(() => { child.kill(); reject(new Error('claude CLI timeout')) }, 90000)
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

function nlCliPlugin() {
  return {
    name: 'roboforge-nl-cli',
    configureServer(server: { middlewares: { use: (path: string, fn: (req: any, res: any) => void) => void } }) {
      server.middlewares.use('/api/nl-design', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (c: Buffer) => (body += c))
        req.on('end', async () => {
          res.setHeader('content-type', 'application/json')
          try {
            const { prompt } = JSON.parse(body || '{}')
            if (!prompt || typeof prompt !== 'string') throw new Error('missing prompt')
            const raw = await runClaude(`${SPEC_INSTRUCTION}\n\nUSER GOAL: ${prompt}`)
            const wrap = JSON.parse(raw) as { result?: string; duration_ms?: number }
            const parsed = extractJson(typeof wrap.result === 'string' ? wrap.result : raw) as Record<string, unknown>
            const spec = parsed.spec ?? parsed
            const scene = parsed.scene ?? null
            res.end(JSON.stringify({ ok: true, spec, scene, durationMs: wrap.duration_ms ?? null }))
          } catch (e) {
            res.end(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }))
          }
        })
      })
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

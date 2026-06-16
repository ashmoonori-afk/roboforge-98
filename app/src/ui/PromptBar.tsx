import { useState, useEffect } from 'react'
import { extractSpec, matchArchetype } from '../core/nl'
import { sizeDesign } from '../core/sizing'
import { designFromCli, designPlanFromCli } from '../core/nlClient'
import { useStore } from '../state/store'

const EXAMPLES = [
  'a small 4-wheel rover that carries 2kg across a room',
  'a robotic arm that can grasp a soda can',
  'an outdoor robot that drives over gravel',
  'a Da Vinci-style surgical robot with 4 articulated arms and a camera',
  'a clockwork brass automaton with exposed gears and articulated limbs',
]

export function PromptBar() {
  const [text, setText] = useState(EXAMPLES[0])
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'fast' | 'quality'>('quality')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p')
    if (p) setText(p)
  }, [])
  const setDesign = useStore((s) => s.setDesign)
  const setStatus = useStore((s) => s.setStatus)
  const setGenerating = useStore((s) => s.setGenerating)
  const pushLog = useStore((s) => s.pushLog)
  const setScene = useStore((s) => s.setScene)
  const setPlan = useStore((s) => s.setPlan)
  const setCliError = useStore((s) => s.setCliError)

  const generate = async () => {
    setBusy(true)
    setGenerating(true)
    setCliError(null)
    setStatus('Generating… (summoning local CLI)')
    setScene(null)
    setPlan(null)
    const trimmed = text.trim()
    pushLog('gen', `prompt: "${trimmed.slice(0, 44)}${trimmed.length > 44 ? '…' : ''}"`)

    let spec = extractSpec(text)
    // Instant draft: render the rule-based archetype right away, then upgrade
    // asynchronously when the CLI returns the richer spec + generated 3D scene.
    setDesign({ spec, archetype: matchArchetype(spec), sizing: sizeDesign(spec) })
    pushLog('gen', 'instant draft (rule-based archetype) — refining via local CLI…')
    pushLog('gen', `stage 1/2: modeling 3D scene (${mode === 'fast' ? 'haiku' : 'opus'})…`)
    pushLog('gen', 'stage 2/2: engineering design…')
    // Engineering design runs in parallel with the spec+scene call (separate, reliable endpoints).
    const planP = designPlanFromCli(text, mode).then((d) => d.plan).catch(() => null)
    try {
      const r = await designFromCli(text, mode)
      spec = r.spec
      if (r.scene) {
        setScene(r.scene)
        setStatus('3D model ready — engineering design still running…')
        pushLog('gen', `auto-modeled 3D: ${r.scene.nodes.length} parts ("${r.scene.name}")`)
      }
      pushLog('gen', `extracted via local claude CLI${r.durationMs ? ` (${Math.round(r.durationMs)}ms)` : ''}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const cause = /endpoint|fetch/i.test(msg) ? 'CLI endpoint offline (static build?)'
        : /timeout/i.test(msg) ? 'CLI timed out'
        : /JSON|parse/i.test(msg) ? 'CLI returned malformed JSON' : msg
      pushLog('warn', `3D model stage failed: ${cause} — kept rule-based draft`)
      setStatus(`Partial: rule-based draft only (${cause}).`)
      setCliError(cause)
    }

    pushLog('gen', `spec → locomotion=${spec.locomotionType}, payload=${spec.payloadKg ?? '—'}kg, manip=${spec.manipulation}`)
    const archetype = matchArchetype(spec)
    pushLog('gen', `archetype = ${archetype.name}`)
    const sizing = sizeDesign(spec)
    pushLog('gen', `sizing → torque=${sizing.motorTorqueNm} N·m, batt=${sizing.batteryCapacityMah} mAh, mass=${sizing.estMassKg} kg`)
    spec.ambiguities.forEach((a) => pushLog('note', `assumption: ${a}`))

    setDesign({ spec, archetype, sizing })
    const note = spec.ambiguities.length ? ` (${spec.ambiguities.length} assumption)` : ''
    setStatus(`Generated → ${archetype.name}${note}. Press Drive in the viewport.`)

    const plan = await planP
    if (plan) {
      setPlan(plan)
      pushLog('gen', `AI design: ${plan.components.length} components, ${plan.connections.length} connections, ${plan.steps.length} steps`)
      plan.warnings?.forEach((w) => pushLog('note', w))
    } else {
      pushLog('warn', 'engineering design stage failed — no AI design (CLI offline or malformed JSON)')
    }
    setBusy(false)
    setGenerating(false)
  }

  return (
    <div>
      <p style={{ marginTop: 0 }}>Describe your robot in plain language:</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !busy) { e.preventDefault(); generate() } }}
        rows={3}
        style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <div className="rf-prompt-controls">
        <button onClick={generate} disabled={busy} title="Ctrl/⌘+Enter">
          {busy ? '… generating' : '▶ Generate design'}
        </button>
        <select value={mode} onChange={(e) => setMode(e.target.value as 'fast' | 'quality')} title="fast = quick + cheap; quality = detailed">
          <option value="fast">fast</option>
          <option value="quality">quality</option>
        </select>
        <button
          title="Copy a shareable link with this prompt"
          onClick={() => {
            const url = `${window.location.origin}${window.location.pathname}?p=${encodeURIComponent(text)}`
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(url).then(
                () => setStatus('Shareable link copied to clipboard.'),
                () => setStatus('Copy failed — clipboard unavailable.'))
            } else setStatus('Copy unavailable in this context (needs HTTPS/localhost).')
          }}
        >
          Share
        </button>
      </div>
      <div className="rf-examples">
        {EXAMPLES.map((ex) => (
          <button key={ex} className="rf-link" onClick={() => setText(ex)} title={ex}>
            “{ex.slice(0, 26)}…”
          </button>
        ))}
      </div>
    </div>
  )
}

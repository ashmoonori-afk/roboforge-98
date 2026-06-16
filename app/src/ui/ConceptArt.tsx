import { useState } from 'react'
import { useStore } from '../state/store'
import { conceptFromCli } from '../core/nlClient'

/** Strip anything executable from untrusted Codex SVG before inlining it. */
function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

/** "상상도": ask the local Codex CLI to DRAW the assembled robot as an SVG concept. */
export function ConceptArt() {
  const design = useStore((s) => s.design)
  const plan = useStore((s) => s.plan)
  const conceptSvg = useStore((s) => s.conceptSvg)
  const setConceptSvg = useStore((s) => s.setConceptSvg)
  const pushLog = useStore((s) => s.pushLog)
  const [busy, setBusy] = useState(false)

  const draw = async () => {
    if (busy || !design) return
    setBusy(true)
    pushLog('gen', 'drawing assembled concept with Codex…')
    try {
      const parts = plan?.components.slice(0, 12).map((c) => `${c.label} ${c.name}`).join(', ')
      const prompt = [
        `Robot: ${design.spec.taskSummary}`,
        `Locomotion: ${design.spec.locomotionType}.`,
        parts ? `Key parts: ${parts}.` : '',
        `Show it fully assembled as it would look when built.`,
      ].filter(Boolean).join('\n')
      const { svg, durationMs } = await conceptFromCli(prompt)
      setConceptSvg(sanitizeSvg(svg))
      pushLog('gen', `concept drawn${durationMs ? ` (${Math.round(durationMs / 1000)}s)` : ''}`)
    } catch (e) {
      pushLog('warn', `concept failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rf-concept">
      <div className="rf-concept-bar">
        <button onClick={draw} disabled={busy || !design} title="Codex draws an as-assembled concept illustration">
          {busy ? '✎ Drawing…' : '✎ Draw concept (Codex)'}
        </button>
        {conceptSvg && <button onClick={() => setConceptSvg(null)} title="clear">✕</button>}
      </div>
      {conceptSvg ? (
        <div className="rf-concept-art" dangerouslySetInnerHTML={{ __html: conceptSvg }} />
      ) : (
        <p className="rf-dim">
          {design
            ? 'Press “Draw concept” — Codex sketches what this robot looks like fully assembled (vector art, ~30–90s).'
            : 'Generate a design first, then draw its assembled concept here.'}
        </p>
      )}
    </div>
  )
}

import { useStore } from '../state/store'

const WIRE = ['#d9480f', '#1971c2', '#2f9e44', '#9c36b5', '#e8590c', '#0c8599', '#c2255c']

/** Shows the LLM-authored build design: controller, components, wiring, steps. */
export function AiDesign() {
  const plan = useStore((s) => s.plan)

  if (!plan) {
    return (
      <p className="rf-dim">
        No AI design yet. Press <b>Generate</b> — the LLM proposes the controller, the full
        component list, the pin-by-pin wiring and assembly steps here.
      </p>
    )
  }

  const compName = (id: string) => plan.components.find((c) => c.id === id)?.name ?? id
  const conns = plan.connections
  const rowH = Math.min(26, Math.max(16, 300 / Math.max(1, conns.length)))
  const svgH = Math.max(110, conns.length * rowH + 16)

  return (
    <div className="rf-ai">
      {plan.summary && <p className="rf-ai-sum">{plan.summary}</p>}
      {plan.controller && (
        <p className="rf-dim" style={{ margin: '0 0 6px' }}>
          <b>Controller:</b> {plan.controller.name}
          {plan.controller.mcu ? ` (${plan.controller.mcu})` : ''} · {plan.controller.pins.length} pins
        </p>
      )}

      <fieldset>
        <legend>Components ({plan.components.length})</legend>
        <ul className="tree-view rf-ai-comp">
          {plan.components.map((c) => (
            <li key={c.id}>
              <b>{c.label}</b> <span className="rf-tag">{(c.iface || '—').slice(0, 4)}</span> {c.name}
              {c.qty > 1 ? ` ×${c.qty}` : ''}
              {c.specs ? <span className="rf-dim"> · {c.specs}</span> : null}
              {c.note ? <span className="rf-dim"> — {c.note}</span> : null}
            </li>
          ))}
        </ul>
      </fieldset>

      {conns.length > 0 && (
        <fieldset>
          <legend>Wiring ({conns.length})</legend>
          <svg viewBox={`0 0 300 ${svgH}`} style={{ width: '100%' }} preserveAspectRatio="xMidYMid meet">
            {conns.map((cn, i) => {
              const y = 14 + i * rowH + rowH / 2
              const color = WIRE[i % WIRE.length]
              const c0 = plan.components.find((c) => c.id === cn.from)
              const lbl = c0?.label ?? compName(cn.from)
              const net = cn.net ?? cn.signal ?? ''
              const label = `${lbl}${net ? ' · ' + net : ''}`
              return (
                <g key={i}>
                  <path d={`M150,${y} C175,${y} 195,${y} 214,${y}`} stroke={color} strokeWidth={2} fill="none" />
                  <rect x={6} y={y - 9} width={144} height={18} rx={3} fill="#f3f3f3" stroke={color} />
                  <text x={12} y={y + 3} fontSize={8.5} fill="#1a202c">{label}</text>
                  <rect x={214} y={y - 9} width={80} height={18} rx={3} fill="#dfe6ec" stroke="#333" />
                  <text x={254} y={y + 3} fontSize={9} textAnchor="middle" fontWeight="bold" fill="#1a202c">{cn.pin}</text>
                </g>
              )
            })}
          </svg>
        </fieldset>
      )}

      {plan.steps.length > 0 && (
        <fieldset>
          <legend>Assembly steps</legend>
          <ol className="rf-ai-steps">
            {plan.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </fieldset>
      )}
    </div>
  )
}

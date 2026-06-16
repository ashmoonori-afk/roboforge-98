import { parts } from '../data/parts'
import { boards } from '../data/boards'
import type { PartCategory, SpecValue } from '../core/types'
import { useStore } from '../state/store'
import { buyLinks } from '../core/export'

export function PartsSuggestion() {
  const design = useStore((s) => s.design)
  const setHover = useStore((s) => s.setHover)
  const plan = useStore((s) => s.plan)

  if (plan && plan.components.length > 0) {
    return (
      <div>
        <p style={{ marginTop: 0 }} className="rf-dim">
          AI-designed BOM ({plan.components.length} parts) — buy on <b>Amazon</b> · <b>Octopart</b> · <b>Mouser</b>.
        </p>
        {plan.components.map((c) => (
          <div key={c.id} className="rf-sug rf-bom">
            <span className="rf-tag">{(c.iface || '—').slice(0, 4)}</span> {c.name}{c.qty > 1 ? ` ×${c.qty}` : ''}{' '}
            {buyLinks(c.name).map((l) => (
              <a key={l.src} className={`rf-src rf-src-${l.src}`} href={l.url} target="_blank" rel="noreferrer" title={`search ${l.src}`}>{l.src}</a>
            ))}
          </div>
        ))}
      </div>
    )
  }

  const slots: PartCategory[] = design?.archetype.partSlots ?? ['MOTOR', 'BATTERY', 'SENSOR']

  return (
    <div>
      <p style={{ marginTop: 0 }} className="rf-dim">
        Buyable options — <b>Amazon</b> + <b>Nexar</b> + <b>Mouser</b>. Hover for specs.
      </p>
      {slots.map((slot) => {
        if (slot === 'MICROCONTROLLER') {
          return (
            <fieldset key={slot}>
              <legend>MICROCONTROLLER</legend>
              {boards.slice(0, 3).map((b) => {
                const mk = (e: { clientX: number; clientY: number }) => ({
                  title: b.name,
                  subtitle: `${b.mcu} · ${b.voltage}`,
                  specs: Object.entries(b.specs) as [string, SpecValue][],
                  x: e.clientX, y: e.clientY,
                })
                return (
                  <div
                    key={b.id}
                    className="rf-sug"
                    onMouseEnter={(e) => setHover(mk(e))}
                    onMouseMove={(e) => setHover(mk(e))}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="rf-src rf-src-M">M</span>
                    <a href={b.productUrl} target="_blank" rel="noreferrer">{b.name}</a>
                    <span className="rf-dim"> ${b.priceUsd.toFixed(2)}</span>
                  </div>
                )
              })}
            </fieldset>
          )
        }
        const opts = parts.filter((p) => p.category === slot).slice(0, 3)
        if (opts.length === 0) return null
        return (
          <fieldset key={slot}>
            <legend>{slot}</legend>
            {opts.map((p) => {
              const mk = (e: { clientX: number; clientY: number }) => ({
                title: p.name,
                subtitle: `${p.source} · ${p.availability}`,
                specs: Object.entries(p.specs) as [string, SpecValue][],
                x: e.clientX, y: e.clientY,
              })
              return (
                <div
                  key={p.id}
                  className="rf-sug"
                  onMouseEnter={(e) => setHover(mk(e))}
                  onMouseMove={(e) => setHover(mk(e))}
                  onMouseLeave={() => setHover(null)}
                >
                  <span className={`rf-src rf-src-${p.source[0]}`}>{p.source[0]}</span>
                  <a href={p.productUrl} target="_blank" rel="noreferrer">{p.name}</a>
                  <span className="rf-dim"> ${p.priceUsd?.toFixed(2)}</span>
                </div>
              )
            })}
          </fieldset>
        )
      })}
    </div>
  )
}

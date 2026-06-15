import { parts } from '../data/parts'
import { boards } from '../data/boards'
import type { PartCategory, SpecValue } from '../core/types'
import { useStore } from '../state/store'

export function PartsSuggestion() {
  const design = useStore((s) => s.design)
  const setHover = useStore((s) => s.setHover)
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

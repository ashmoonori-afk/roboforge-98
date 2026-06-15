import { parts } from '../data/parts'
import type { Part, SpecValue } from '../core/types'
import { useStore } from '../state/store'
import { catTag } from './icons'

function specsOf(p: Part): [string, SpecValue][] {
  return [
    ['Source', p.source],
    ['Price', p.priceUsd != null ? `$${p.priceUsd.toFixed(2)}` : '—'],
    ['Avail', p.availability],
    ['Wiring', p.pinKind ?? 'mechanical'],
    ...Object.entries(p.specs),
  ]
}

export function PartsBin() {
  const setHover = useStore((s) => s.setHover)

  return (
    <div>
      <p style={{ marginTop: 0 }}>
        Drag a part onto the <b>Robot Viewport</b> or an <b>MCU pin</b>. Hover for specs.
      </p>
      <ul className="tree-view rf-bin">
        {parts.map((p) => {
          const mk = (e: { clientX: number; clientY: number }) => ({
            title: p.name,
            subtitle: `${p.category} · ${p.pinKind ?? 'mechanical'}`,
            specs: specsOf(p),
            x: e.clientX,
            y: e.clientY,
          })
          return (
            <li
              key={p.id}
              className="rf-bin-item"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', p.id)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onMouseEnter={(e) => setHover(mk(e))}
              onMouseMove={(e) => setHover(mk(e))}
              onMouseLeave={() => setHover(null)}
            >
              <span className="rf-tag">{catTag(p.category)}</span> {p.name}
              <span className="rf-dim"> {p.priceUsd != null ? `$${p.priceUsd.toFixed(2)}` : '—'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import { boardById } from '../data/boards'
import { partById } from '../data/parts'
import type { SpecValue } from '../core/types'
import { useStore } from '../state/store'
import { catTag } from './icons'

const WIRE_COLORS = ['#d9480f', '#1971c2', '#2f9e44', '#9c36b5', '#e8590c', '#0c8599', '#c2255c']

/** SVG wiring diagram: each connection drawn as part-node ──▶ pin-node. */
export function WiringDiagram() {
  const boardId = useStore((s) => s.boardId)
  const assignments = useStore((s) => s.assignments)
  const setHover = useStore((s) => s.setHover)
  const board = boardById(boardId)

  const wired = assignments
    .map((a) => ({ pinId: a.pinId, part: partById(a.partId) }))
    .filter((w): w is { pinId: string; part: NonNullable<typeof w.part> } => !!w.part)

  if (wired.length === 0) {
    return (
      <svg viewBox="0 0 260 330" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
        <text x={130} y={160} fontSize={11} textAnchor="middle" fill="#667">No connections yet.</text>
        <text x={130} y={178} fontSize={9} textAnchor="middle" fill="#889">Drop a part on a pin in the map →</text>
      </svg>
    )
  }

  const rowH = Math.min(40, (330 - 24) / wired.length)
  const pinKindOf = (pinId: string) => board.pins.find((p) => p.id === pinId)?.kinds[0] ?? ''

  return (
    <svg viewBox="0 0 260 330" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      {wired.map((w, i) => {
        const yc = 18 + i * rowH + rowH / 2
        const color = WIRE_COLORS[i % WIRE_COLORS.length]
        const hov = (e: { clientX: number; clientY: number }) =>
          setHover({
            title: w.part.name,
            subtitle: `→ ${w.pinId} (${pinKindOf(w.pinId)})`,
            specs: Object.entries(w.part.specs) as [string, SpecValue][],
            x: e.clientX, y: e.clientY,
          })
        return (
          <g key={w.pinId}>
            <path d={`M128,${yc} C156,${yc} 168,${yc} 192,${yc}`} stroke={color} strokeWidth={2.4} fill="none" />
            <circle cx={128} cy={yc} r={3} fill={color} />
            <circle cx={192} cy={yc} r={3} fill={color} />
            <g
              style={{ cursor: 'help' }}
              onMouseEnter={hov}
              onMouseMove={hov}
              onMouseLeave={() => setHover(null)}
            >
              <rect x={8} y={yc - 11} width={120} height={22} rx={3} fill="#f3f3f3" stroke={color} strokeWidth={1.4} />
              <text x={14} y={yc + 4} fontSize={9} fill="#1a202c">
                <tspan fontWeight="bold" fill={color}>{catTag(w.part.category)} </tspan>
                {w.part.name.length > 16 ? w.part.name.slice(0, 15) + '…' : w.part.name}
              </text>
            </g>
            <rect x={192} y={yc - 10} width={58} height={20} rx={3} fill="#dfe6ec" stroke="#333" />
            <text x={221} y={yc + 4} fontSize={10} textAnchor="middle" fill="#1a202c" fontWeight="bold">{w.pinId}</text>
          </g>
        )
      })}
    </svg>
  )
}

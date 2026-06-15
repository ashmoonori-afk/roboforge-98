import type { DragEvent as RDragEvent } from 'react'
import { boardById } from '../data/boards'
import { partById } from '../data/parts'
import { assignPart, unassignPin } from '../core/mcu'
import type { SpecValue } from '../core/types'
import { useStore } from '../state/store'
import { catTag } from './icons'

// Solderless-breadboard layout (viewBox 360x300). The MCU is "inserted" as a
// dark strip straddling the centre channel; each pin = one tie-point column.
const X0 = 26
const X1 = 334
const TOP_ROWS = [58, 72, 86, 100, 114] // tie holes you wire a part into
const BOT_ROWS = [186, 200, 214]        // (decorative) lower half
const STRIP_Y = 150
const STRIP_H = 24
const PIN_Y = STRIP_Y + STRIP_H / 2

/** Breadboard wiring base with the microprocessor inserted across the centre. */
export function Breadboard() {
  const boardId = useStore((s) => s.boardId)
  const assignments = useStore((s) => s.assignments)
  const setAssignments = useStore((s) => s.setAssignments)
  const setStatus = useStore((s) => s.setStatus)
  const setHover = useStore((s) => s.setHover)
  const pushLog = useStore((s) => s.pushLog)

  const board = boardById(boardId)
  const pins = board.pins
  const colW = (X1 - X0) / pins.length
  const cx = (i: number) => X0 + i * colW + colW / 2
  const partAt = (pinId: string) => {
    const a = assignments.find((x) => x.pinId === pinId)
    return a ? partById(a.partId) : undefined
  }

  const onDrop = (pinId: string, e: RDragEvent<SVGGElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const part = id ? partById(id) : undefined
    if (!part) return
    const res = assignPart(board, assignments, pinId, part)
    if (res.ok) {
      setAssignments(res.assignments)
      setStatus(`Wired ${part.name} → ${pinId} (breadboard).`)
      pushLog('wire', `${part.name} → ${pinId} via breadboard`)
    } else {
      setStatus(`✖ ${res.reason}`)
      pushLog('warn', `rejected: ${res.reason}`)
    }
  }

  const railHoles = Array.from({ length: 26 }, (_, i) => 20 + i * 13)

  return (
    <svg viewBox="0 0 360 300" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <rect x={8} y={8} width={344} height={284} rx={8} fill="#e9dcc1" stroke="#b9a87f" strokeWidth={1.5} />

      {/* power rails */}
      <line x1={16} y1={22} x2={344} y2={22} stroke="#d23b3b" strokeWidth={1} />
      <line x1={16} y1={30} x2={344} y2={30} stroke="#2f6fd2" strokeWidth={1} />
      <line x1={16} y1={262} x2={344} y2={262} stroke="#2f6fd2" strokeWidth={1} />
      <line x1={16} y1={270} x2={344} y2={270} stroke="#d23b3b" strokeWidth={1} />
      {railHoles.map((rx, i) => (
        <g key={i}>
          <circle cx={rx} cy={26} r={1.6} fill="#8a7c5e" />
          <circle cx={rx} cy={266} r={1.6} fill="#8a7c5e" />
        </g>
      ))}

      {/* centre channel + inserted MCU */}
      <rect x={12} y={STRIP_Y} width={336} height={STRIP_H} fill="#cdbf9c" />
      <rect x={X0 - 6} y={STRIP_Y + 3} width={(X1 - X0) + 12} height={STRIP_H - 6} rx={2} fill="#1f2933" />
      <text x={(X0 + X1) / 2} y={PIN_Y + 3} fontSize={8} textAnchor="middle" fill="#9fd3da">
        {board.name} — inserted
      </text>

      {pins.map((pin, i) => {
        const x = cx(i)
        const part = partAt(pin.id)
        const used = !!part
        const power = pin.kinds.includes('POWER') || pin.kinds.includes('GND')
        const pinColor = used ? '#3fae3f' : power ? '#e6b800' : '#c9cdd2'
        const holeColor = used ? '#3fae3f' : '#8a7c5e'
        const hov = (e: { clientX: number; clientY: number }) =>
          setHover({
            title: `Pin ${pin.id} — breadboard col ${i + 1}`,
            subtitle: part ? `→ ${part.name}` : pin.kinds.join(', '),
            specs: part
              ? (Object.entries(part.specs) as [string, SpecValue][])
              : pin.kinds.map((k) => [k, '✓'] as [string, SpecValue]),
            x: e.clientX,
            y: e.clientY,
          })
        return (
          <g
            key={pin.id}
            style={{ cursor: 'pointer' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(pin.id, e)}
            onClick={() => {
              if (used) {
                setAssignments(unassignPin(assignments, pin.id))
                setStatus(`Unwired ${pin.id}.`)
                pushLog('wire', `unwired ${pin.id}`)
              }
            }}
            onMouseEnter={hov}
            onMouseMove={hov}
            onMouseLeave={() => setHover(null)}
          >
            <rect x={x - colW / 2} y={36} width={colW} height={104} fill="transparent" />
            {TOP_ROWS.map((ty, r) => <circle key={r} cx={x} cy={ty} r={2.4} fill={holeColor} />)}
            <line x1={x} y1={STRIP_Y + 1} x2={x} y2={TOP_ROWS[TOP_ROWS.length - 1]} stroke={used ? '#3fae3f' : '#5a6b7b'} strokeWidth={used ? 1.6 : 0.7} />
            <rect x={x - 2.5} y={STRIP_Y - 1.5} width={5} height={5} fill={pinColor} stroke="#111" strokeWidth={0.4} />
            <text x={x} y={STRIP_Y + STRIP_H + 2} fontSize={6.5} textAnchor="start" fill="#1a202c" transform={`rotate(90 ${x} ${STRIP_Y + STRIP_H + 2})`}>{pin.id}</text>
            {BOT_ROWS.map((by, r) => <circle key={r} cx={x} cy={by} r={2.2} fill="#8a7c5e" />)}
            {part && (
              <g>
                <rect x={x - 10} y={40} width={20} height={11} rx={2} fill="#fff" stroke="#3fae3f" strokeWidth={1} />
                <text x={x} y={48} fontSize={6.5} textAnchor="middle" fill="#1a202c">{catTag(part.category)}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

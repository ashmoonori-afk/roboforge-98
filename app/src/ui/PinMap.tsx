import type { DragEvent as RDragEvent } from 'react'
import { boardById } from '../data/boards'
import { partById } from '../data/parts'
import { assignPart, unassignPin } from '../core/mcu'
import type { Pin, SpecValue } from '../core/types'
import { useStore } from '../state/store'

const BX = 110, BY = 30, BW = 80, BH = 270

function padColor(pin: Pin, used: boolean): string {
  if (used) return '#7cc47c'
  if (pin.kinds.includes('POWER') || pin.kinds.includes('GND')) return '#e6b800'
  return '#cfd6dd'
}
const yFor = (count: number, i: number) =>
  count <= 1 ? BY + BH / 2 : BY + 16 + i * ((BH - 32) / (count - 1))

/** SVG pinout "map" of the selected board. Pins are live drop targets. */
export function PinMap() {
  const boardId = useStore((s) => s.boardId)
  const assignments = useStore((s) => s.assignments)
  const setAssignments = useStore((s) => s.setAssignments)
  const setStatus = useStore((s) => s.setStatus)
  const setHover = useStore((s) => s.setHover)
  const pushLog = useStore((s) => s.pushLog)
  const board = boardById(boardId)

  const half = Math.ceil(board.pins.length / 2)
  const left = board.pins.slice(0, half)
  const right = board.pins.slice(half)
  const partAt = (pinId: string) => {
    const a = assignments.find((x) => x.pinId === pinId)
    return a ? partById(a.partId) : undefined
  }

  const onPinDrop = (pinId: string, e: RDragEvent<SVGGElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const part = id ? partById(id) : undefined
    if (!part) return
    const res = assignPart(board, assignments, pinId, part)
    if (res.ok) {
      setAssignments(res.assignments)
      setStatus(`Wired ${part.name} → ${pinId}.`)
      pushLog('wire', `${part.name} → ${pinId} (${part.pinKind})`)
    } else {
      setStatus(`✖ ${res.reason}`)
      pushLog('warn', `rejected: ${res.reason}`)
    }
  }

  const renderPin = (pin: Pin, y: number, side: 'L' | 'R') => {
    const part = partAt(pin.id)
    const used = !!part
    const padX = side === 'L' ? BX - 7 : BX + BW - 7
    const labelX = side === 'L' ? BX - 14 : BX + BW + 14
    const anchor = side === 'L' ? 'end' : 'start'
    const hov = (e: { clientX: number; clientY: number }) =>
      setHover({
        title: `Pin ${pin.id}`,
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
        onDrop={(e) => onPinDrop(pin.id, e)}
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
        <rect x={side === 'L' ? padX - 16 : padX} y={y - 9} width={23} height={18} fill="transparent" />
        <rect x={padX} y={y - 6} width={14} height={12} rx={2} fill={padColor(pin, used)} stroke="#333" strokeWidth={used ? 1.4 : 0.8} />
        <text x={labelX} y={y + 3} fontSize={9} textAnchor={anchor} fill="#1a202c">{pin.id}</text>
      </g>
    )
  }

  return (
    <svg viewBox="0 0 300 330" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <rect x={BX} y={BY} width={BW} height={BH} rx={6} fill="#15616d" stroke="#0c3a42" strokeWidth={1.5} />
      <rect x={BX + BW / 2 - 14} y={BY + BH / 2 - 14} width={28} height={28} rx={2} fill="#0a0a0a" />
      <rect x={BX + BW / 2 - 12} y={BY - 6} width={24} height={12} rx={2} fill="#c9d1d9" stroke="#888" />
      <text x={BX + BW / 2} y={BY + 22} fontSize={9} textAnchor="middle" fill="#cfe8ec">USB</text>
      <text x={BX + BW / 2} y={BY + BH - 10} fontSize={8} textAnchor="middle" fill="#9fd3da">{board.name}</text>
      {left.map((p, i) => renderPin(p, yFor(left.length, i), 'L'))}
      {right.map((p, i) => renderPin(p, yFor(right.length, i), 'R'))}
    </svg>
  )
}

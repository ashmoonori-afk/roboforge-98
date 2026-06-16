import type { DragEvent as RDragEvent } from 'react'
import { boardById } from '../data/boards'
import { partById } from '../data/parts'
import { assignPart, unassignPin } from '../core/mcu'
import type { SpecValue, DesignPlan } from '../core/types'
import { useStore } from '../state/store'
import { catTag } from './icons'

// Breadboard *assembly base* (viewBox 360x320). The MCU is inserted as a strip
// across the centre; each pin is a tie-point column. When the LLM has produced a
// design (store.plan) the board auto-wires that design; otherwise it's a manual
// drag-drop board.
const X0 = 28
const X1 = 332
const TOP_ROWS = [52, 64, 76, 88, 100]
const STRIP_Y = 116
const STRIP_H = 24
const PIN_Y = STRIP_Y + STRIP_H / 2
const COMP_Y = 182
const COMP_H = 24
const BOT_ROWS = [224, 236]
const WIRE = ['#d9480f', '#1971c2', '#2f9e44', '#9c36b5', '#e8590c', '#0c8599', '#c2255c', '#5f3dc4']

/** Colour a jumper wire by its net type so the wiring structure reads at a glance. */
function netColor(net: string | undefined, fallback: string): string {
  const n = (net || '').toUpperCase()
  if (/GND|GROUND/.test(n)) return '#333333'
  if (/5V|3V3|3\.3|VIN|VCC|VBAT|PWR|POWER|BATT/.test(n)) return '#d23b3b'
  if (/I2C|SDA|SCL/.test(n)) return '#1971c2'
  if (/SPI|MOSI|MISO|SCK/.test(n)) return '#7048e8'
  if (/UART|TX|RX/.test(n)) return '#2f9e44'
  return fallback
}

function rail(y: number, color: string) {
  return (
    <g>
      <line x1={16} y1={y} x2={344} y2={y} stroke={color} strokeWidth={1} />
      {Array.from({ length: 26 }, (_, i) => 20 + i * 13).map((rx, i) => (
        <circle key={i} cx={rx} cy={y + 5} r={1.5} fill="#8a7c5e" />
      ))}
    </g>
  )
}

/** Picks the plan-driven view when the LLM has designed wiring, else the manual board. */
export function Breadboard() {
  const plan = useStore((s) => s.plan)
  return plan && plan.connections.length > 0 ? <PlanBreadboard plan={plan} /> : <ManualBreadboard />
}

/** Auto-reflects the LLM design: controller + connected components + jumper wiring. */
function PlanBreadboard({ plan }: { plan: DesignPlan }) {
  const setHover = useStore((s) => s.setHover)

  const pins = [...new Set(plan.connections.map((c) => c.pin))].slice(0, 36)
  const order: string[] = []
  for (const c of plan.connections) if (!order.includes(c.from)) order.push(c.from)
  const comps = order.slice(0, 16)
  const colW = (X1 - X0) / Math.max(1, pins.length)
  const cx = (i: number) => X0 + i * colW + colW / 2
  const compW = (X1 - X0) / Math.max(1, comps.length)
  const compX = (i: number) => X0 + i * compW + compW / 2
  const comp = (id: string) => plan.components.find((c) => c.id === id)
  const color = (id: string) => WIRE[Math.max(0, comps.indexOf(id)) % WIRE.length]

  return (
    <svg viewBox="0 0 360 320" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <rect x={8} y={10} width={344} height={300} rx={8} fill="#e9dcc1" stroke="#b9a87f" strokeWidth={1.5} />
      {rail(22, '#d23b3b')}
      {rail(30, '#2f6fd2')}
      {rail(286, '#2f6fd2')}
      {rail(294, '#d23b3b')}

      <rect x={12} y={STRIP_Y} width={336} height={STRIP_H} fill="#cdbf9c" />
      <rect x={X0 - 6} y={STRIP_Y + 3} width={(X1 - X0) + 12} height={STRIP_H - 6} rx={2} fill="#1f2933" />
      <text x={(X0 + X1) / 2} y={PIN_Y + 3} fontSize={8} textAnchor="middle" fill="#9fd3da">
        {plan.controller?.name ?? 'Controller'} — AI-designed
      </text>

      {/* jumper wires: each connection pin-column → component block */}
      {plan.connections.slice(0, 120).map((cn, i) => {
        const pi = pins.indexOf(cn.pin)
        const ci = comps.indexOf(cn.from)
        if (pi < 0 || ci < 0) return null
        const x1 = cx(pi)
        const x2 = compX(ci)
        return (
          <path
            key={i}
            d={`M${x1},${STRIP_Y + STRIP_H} C${x1},${STRIP_Y + STRIP_H + 22} ${x2},${COMP_Y - 22} ${x2},${COMP_Y}`}
            stroke={netColor(cn.net, color(cn.from))}
            strokeWidth={1.6}
            fill="none"
            opacity={0.85}
          />
        )
      })}

      {/* pin columns */}
      {pins.map((pin, i) => {
        const x = cx(i)
        return (
          <g key={pin}>
            {TOP_ROWS.map((ty, r) => <circle key={r} cx={x} cy={ty} r={2.2} fill="#8a7c5e" />)}
            <rect x={x - 2.5} y={STRIP_Y - 1.5} width={5} height={5} fill="#3fae3f" stroke="#111" strokeWidth={0.4} />
            <text x={x} y={STRIP_Y - 3} fontSize={6} textAnchor="end" fill="#1a202c" transform={`rotate(-90 ${x} ${STRIP_Y - 3})`}>{pin}</text>
          </g>
        )
      })}

      {/* component blocks */}
      {comps.map((id, i) => {
        const c = comp(id)
        const x = compX(i)
        const w = Math.min(compW - 4, 40)
        const hov = (e: { clientX: number; clientY: number }) =>
          setHover({
            title: c?.name ?? id,
            subtitle: `${c?.iface ?? ''} ${c?.note ? '· ' + c.note : ''}`.trim(),
            specs: plan.connections.filter((cn) => cn.from === id).map((cn) => [cn.pin, cn.signal ?? '✓'] as [string, SpecValue]),
            x: e.clientX,
            y: e.clientY,
          })
        return (
          <g key={id} onMouseEnter={hov} onMouseMove={hov} onMouseLeave={() => setHover(null)} style={{ cursor: 'help' }}>
            <rect x={x - w / 2} y={COMP_Y} width={w} height={COMP_H} rx={2} fill="#ffffff" stroke={color(id)} strokeWidth={1.4} />
            <text x={x} y={COMP_Y + 10} fontSize={6.5} textAnchor="middle" fontWeight="bold" fill={color(id)}>{c?.label ?? '—'}</text>
            <text x={x} y={COMP_Y + 19} fontSize={5.4} textAnchor="middle" fill="#1a202c">{(c?.name ?? id).split(' ')[0].slice(0, 8)}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Manual board: drop catalog parts onto pin columns to wire them. */
function ManualBreadboard() {
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
      setStatus(`Assembled ${part.name} → ${pinId} on the breadboard.`)
      pushLog('wire', `${part.name} → ${pinId} (breadboard)`)
    } else {
      setStatus(`✖ ${res.reason}`)
      pushLog('warn', `rejected: ${res.reason}`)
    }
  }

  return (
    <svg viewBox="0 0 360 320" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <rect x={8} y={10} width={344} height={300} rx={8} fill="#e9dcc1" stroke="#b9a87f" strokeWidth={1.5} />
      {rail(22, '#d23b3b')}
      {rail(30, '#2f6fd2')}
      {rail(286, '#2f6fd2')}
      {rail(294, '#d23b3b')}

      <rect x={12} y={STRIP_Y} width={336} height={STRIP_H} fill="#cdbf9c" />
      <rect x={X0 - 6} y={STRIP_Y + 3} width={(X1 - X0) + 12} height={STRIP_H - 6} rx={2} fill="#1f2933" />
      <text x={(X0 + X1) / 2} y={PIN_Y + 3} fontSize={8} textAnchor="middle" fill="#9fd3da">{board.name}</text>

      {pins.map((pin, i) => {
        const x = cx(i)
        const part = partAt(pin.id)
        const used = !!part
        const power = pin.kinds.includes('POWER') || pin.kinds.includes('GND')
        const wireColor = WIRE[i % WIRE.length]
        const pinColor = used ? wireColor : power ? '#e6b800' : '#c9cdd2'
        const holeColor = used ? wireColor : '#8a7c5e'
        const hov = (e: { clientX: number; clientY: number }) =>
          setHover({
            title: `Pin ${pin.id} — column ${i + 1}`,
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
                setStatus(`Removed ${pin.id}.`)
                pushLog('wire', `unwired ${pin.id}`)
              }
            }}
            onMouseEnter={hov}
            onMouseMove={hov}
            onMouseLeave={() => setHover(null)}
          >
            <rect x={x - colW / 2} y={44} width={colW} height={104} fill="transparent" />
            {TOP_ROWS.map((ty, r) => <circle key={r} cx={x} cy={ty} r={2.4} fill={holeColor} />)}
            <line x1={x} y1={STRIP_Y + 1} x2={x} y2={TOP_ROWS[TOP_ROWS.length - 1]} stroke={used ? wireColor : '#5a6b7b'} strokeWidth={used ? 1.6 : 0.7} />
            <rect x={x - 2.5} y={STRIP_Y - 1.5} width={5} height={5} fill={pinColor} stroke="#111" strokeWidth={0.4} />
            <text x={x} y={STRIP_Y + STRIP_H + 2} fontSize={6.5} textAnchor="start" fill="#1a202c" transform={`rotate(90 ${x} ${STRIP_Y + STRIP_H + 2})`}>{pin.id}</text>

            {used ? (
              <g>
                <path d={`M${x},${STRIP_Y + STRIP_H} C${x},${STRIP_Y + STRIP_H + 14} ${x},${COMP_Y - 14} ${x},${COMP_Y}`} stroke={wireColor} strokeWidth={2} fill="none" />
                <circle cx={x} cy={STRIP_Y + STRIP_H} r={2} fill={wireColor} />
                <rect x={x - 13} y={COMP_Y} width={26} height={22} rx={2} fill="#ffffff" stroke={wireColor} strokeWidth={1.3} />
                <text x={x} y={COMP_Y + 9} fontSize={6.5} textAnchor="middle" fontWeight="bold" fill={wireColor}>{catTag(part.category)}</text>
                <text x={x} y={COMP_Y + 17} fontSize={5.3} textAnchor="middle" fill="#1a202c">{part.name.split(' ')[0].slice(0, 7)}</text>
              </g>
            ) : (
              BOT_ROWS.map((by, r) => <circle key={r} cx={x} cy={by} r={2.2} fill="#8a7c5e" />)
            )}
          </g>
        )
      })}
    </svg>
  )
}

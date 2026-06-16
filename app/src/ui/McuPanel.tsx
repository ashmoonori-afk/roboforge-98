import { boards, boardById } from '../data/boards'
import { pinUsage } from '../core/mcu'
import { useStore } from '../state/store'
import { Breadboard } from './Breadboard'
import { WiringDiagram } from './WiringDiagram'

export function McuPanel() {
  const boardId = useStore((s) => s.boardId)
  const setBoard = useStore((s) => s.setBoard)
  const assignments = useStore((s) => s.assignments)
  const board = boardById(boardId)
  const usage = pinUsage(board, assignments)

  return (
    <div className="rf-mcu">
      <div className="rf-mcu-head">
        <label htmlFor="board">Board:&nbsp;</label>
        <select id="board" value={boardId} onChange={(e) => setBoard(e.target.value)}>
          {boards.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <span className="rf-dim">
          &nbsp;{board.mcu} · {board.voltage} · {board.clockMhz} MHz · pins {usage.used}/{usage.total}
        </span>
      </div>

      <div className="rf-mcu-cols">
        <fieldset className="rf-mcu-col">
          <legend>Breadboard — assembly base</legend>
          <Breadboard />
        </fieldset>
        <fieldset className="rf-mcu-col">
          <legend>Wiring diagram</legend>
          <WiringDiagram />
        </fieldset>
      </div>

      <p className="rf-dim" style={{ margin: '2px 0 0' }}>
        Drop a part onto a pin column — it's <b>assembled on the breadboard</b> and jumper-wired to that pin; the <b>wiring diagram</b> updates live.
        A PWM servo needs a ~PWM pin, I2C needs an I2C pin. Click a wired pin to remove.
      </p>
    </div>
  )
}

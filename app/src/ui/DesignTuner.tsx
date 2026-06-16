import { useStore } from '../state/store'
import type { DesignComponent, DesignConnection } from '../core/types'

const IFACES = ['PWM', 'I2C', 'SPI', 'UART', 'ANALOG', 'DIGITAL', 'POWER', 'GND', 'none']

/**
 * Tune / tweak the AI design: edit component specs and the wiring connections
 * in place. Every edit updates the shared plan, so the wiring diagram, the
 * breadboard, the BOM and the exports all reflect the changes live.
 */
export function DesignTuner() {
  const plan = useStore((s) => s.plan)
  const editPlan = useStore((s) => s.editPlan)
  const resetPlan = useStore((s) => s.resetPlan)
  const pushLog = useStore((s) => s.pushLog)

  if (!plan) {
    return (
      <p className="rf-dim">
        No design to tune yet. Press <b>Generate design</b>, then tweak component specs and
        the wiring here — changes flow into the diagram, breadboard and BOM live.
      </p>
    )
  }

  const setComp = (i: number, k: keyof DesignComponent, v: string | number) =>
    editPlan((p) => ({ ...p, components: p.components.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)) }))
  const removeComp = (i: number) =>
    editPlan((p) => {
      const id = p.components[i]?.id
      return {
        ...p,
        components: p.components.filter((_, idx) => idx !== i),
        connections: p.connections.filter((cn) => cn.from !== id && cn.from !== ''),
      }
    })
  const addComp = () =>
    editPlan((p) => ({
      ...p,
      components: [
        ...p.components,
        { id: crypto.randomUUID().slice(0, 8), label: `X${p.components.length + 1}`, name: 'New part', category: 'OTHER', iface: 'none', specs: '', qty: 1 },
      ],
    }))

  const setConn = (i: number, k: keyof DesignConnection, v: string) =>
    editPlan((p) => ({ ...p, connections: p.connections.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)) }))
  const removeConn = (i: number) =>
    editPlan((p) => ({ ...p, connections: p.connections.filter((_, idx) => idx !== i) }))
  const addConn = () =>
    editPlan((p) => ({ ...p, connections: [...p.connections, { id: crypto.randomUUID().slice(0, 8), from: p.components[0]?.id ?? '', pin: '', net: '', signal: '' }] }))

  const setControllerName = (v: string) =>
    editPlan((p) => ({ ...p, controller: p.controller ? { ...p.controller, name: v } : p.controller }))
  const setPins = (v: string) =>
    editPlan((p) => ({ ...p, controller: p.controller ? { ...p.controller, pins: v.split(',').map((s) => s.trim()).filter(Boolean) } : p.controller }))

  const compOptions = (current: string) => {
    const ids = plan.components.map((c) => c.id)
    const opts = plan.components.map((c) => ({ id: c.id, label: `${c.label} ${c.name}`.slice(0, 22) }))
    if (current && !ids.includes(current)) opts.unshift({ id: current, label: current })
    return opts
  }

  return (
    <div className="rf-tuner">
      <div className="rf-tuner-bar">
        <span className="rf-dim">{plan.components.length} parts · {plan.connections.length} wires</span>
        <button onClick={() => { resetPlan(); pushLog('info', 'design tweaks reset to AI design') }} title="Discard tweaks">↺ Reset to AI</button>
      </div>

      {plan.controller && (
        <fieldset>
          <legend>Controller</legend>
          <input className="rf-in rf-in-wide" value={plan.controller.name} onChange={(e) => setControllerName(e.target.value)} placeholder="controller name" />
          <input className="rf-in rf-in-wide" value={plan.controller.pins.join(', ')} onChange={(e) => setPins(e.target.value)} placeholder="pins, comma-separated" title="controller pins (comma-separated)" />
        </fieldset>
      )}

      <fieldset>
        <legend>Component specs ({plan.components.length})</legend>
        <div className="rf-tuner-list">
          {plan.components.map((c, i) => (
            <div key={c.id} className="rf-tuner-row">
              <input className="rf-in rf-in-lbl" value={c.label} onChange={(e) => setComp(i, 'label', e.target.value)} title="reference designator" />
              <input className="rf-in rf-in-name" value={c.name} onChange={(e) => setComp(i, 'name', e.target.value)} title="part name" />
              <select className="rf-in" value={c.iface} onChange={(e) => setComp(i, 'iface', e.target.value)} title="interface">
                {IFACES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <input className="rf-in rf-in-qty" type="number" min={1} value={c.qty} onChange={(e) => setComp(i, 'qty', Math.max(1, Math.round(Number(e.target.value) || 1)))} title="quantity" />
              <input className="rf-in rf-in-spec" value={c.specs} onChange={(e) => setComp(i, 'specs', e.target.value)} placeholder="key specs (V / A / value / address)" title="tune the spec" />
              <button className="rf-x" onClick={() => removeComp(i)} title="remove component">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addComp}>+ component</button>
      </fieldset>

      <fieldset>
        <legend>Wiring ({plan.connections.length})</legend>
        <div className="rf-tuner-list">
          {plan.connections.map((cn, i) => (
            <div key={cn.id} className="rf-tuner-row">
              <select className="rf-in rf-in-from" value={cn.from} onChange={(e) => setConn(i, 'from', e.target.value)} title="from component">
                {compOptions(cn.from).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <input className="rf-in rf-in-pin" value={cn.pin} onChange={(e) => setConn(i, 'pin', e.target.value)} placeholder="pin" title="controller pin" />
              <input className="rf-in rf-in-net" value={cn.net ?? ''} onChange={(e) => setConn(i, 'net', e.target.value)} placeholder="net" title="named net (5V, GND, I2C_SDA…)" />
              <input className="rf-in rf-in-sig" value={cn.signal ?? ''} onChange={(e) => setConn(i, 'signal', e.target.value)} placeholder="signal" title="signal" />
              <button className="rf-x" onClick={() => removeConn(i)} title="remove wire">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addConn}>+ wire</button>
      </fieldset>
    </div>
  )
}

import { useStore } from '../state/store'

export function PropertiesPanel() {
  const design = useStore((s) => s.design)
  const placed = useStore((s) => s.placed)

  if (!design) {
    return <p className="rf-dim">No design yet. Use “Design Prompt” → Generate.</p>
  }
  const { spec, archetype, sizing } = design

  return (
    <div className="rf-props">
      <fieldset>
        <legend>Archetype</legend>
        <p style={{ margin: 0 }}><strong>{archetype.name}</strong></p>
        <p className="rf-dim" style={{ margin: '2px 0 0' }}>{archetype.description}</p>
      </fieldset>

      <fieldset>
        <legend>Requirements</legend>
        <table className="rf-spec">
          <tbody>
            <tr><td>Locomotion</td><td>{spec.locomotionType}</td></tr>
            <tr><td>Payload</td><td>{spec.payloadKg ?? '—'} kg</td></tr>
            <tr><td>Manipulation</td><td>{spec.manipulation ? 'yes' : 'no'}</td></tr>
            <tr><td>Wheels</td><td>{spec.wheelCount ?? '—'}</td></tr>
            <tr><td>Indoor</td><td>{spec.environmentIndoor ? 'yes' : 'no'}</td></tr>
          </tbody>
        </table>
      </fieldset>

      <fieldset>
        <legend>Sizing (design sketch)</legend>
        <table className="rf-spec">
          <tbody>
            <tr><td>Est. mass</td><td>{sizing.estMassKg} kg</td></tr>
            <tr><td>Motor torque</td><td>{sizing.motorTorqueNm} N·m</td></tr>
            <tr><td>Battery</td><td>{sizing.batteryCapacityMah} mAh</td></tr>
            <tr><td>Placed parts</td><td>{placed.length}</td></tr>
          </tbody>
        </table>
      </fieldset>

      {spec.ambiguities.length > 0 && (
        <fieldset>
          <legend>Assumptions</legend>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {spec.ambiguities.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </fieldset>
      )}
    </div>
  )
}

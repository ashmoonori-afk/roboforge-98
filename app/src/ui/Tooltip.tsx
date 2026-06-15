import { useStore } from '../state/store'

/** Single global "mouse-over spec" balloon, fed by store.hover. */
export function Tooltip() {
  const hover = useStore((s) => s.hover)
  if (!hover) return null

  const width = 214
  const left = Math.min(hover.x + 16, window.innerWidth - width - 8)
  const top = Math.min(hover.y + 16, window.innerHeight - 200)

  return (
    <div
      className="window rf-tooltip"
      style={{ position: 'fixed', left, top, width, zIndex: 9999, pointerEvents: 'none' }}
    >
      <div className="title-bar">
        <div className="title-bar-text">{hover.title}</div>
      </div>
      <div className="window-body" style={{ margin: 4 }}>
        {hover.subtitle && (
          <p style={{ margin: '0 0 4px' }}>
            <strong>{hover.subtitle}</strong>
          </p>
        )}
        <table className="rf-spec">
          <tbody>
            {hover.specs.map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td style={{ textAlign: 'right' }}>{String(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { useStore } from '../state/store'

/** Scrollable, copyable activity/generation log. Auto-scrolls to newest. */
export function LogWindow() {
  const logs = useStore((s) => s.logs)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  const copy = () => {
    const text = logs.map((l) => `${l.time} ${l.kind.toUpperCase()} ${l.text}`).join('\n')
    if (navigator.clipboard) navigator.clipboard.writeText(text)
  }

  return (
    <div className="rf-logroot">
      <div className="rf-logbar">
        <button onClick={copy} disabled={!logs.length}>Copy</button>
        <button onClick={() => useStore.setState({ logs: [] })} disabled={!logs.length}>Clear</button>
        <span className="rf-dim">{logs.length} entries</span>
      </div>
      <div className="rf-logwrap" ref={ref}>
        {logs.length === 0 ? (
          <div className="rf-dim">No activity yet. Generate a design, place a part, or wire a pin.</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className={`rf-log rf-log-${l.kind}`}>
              <span className="rf-log-t">{l.time}</span>
              <span className="rf-log-k">{l.kind.toUpperCase()}</span>
              <span className="rf-log-x">{l.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { useStore } from '../state/store'

export function Taskbar() {
  const status = useStore((s) => s.status)
  return (
    <div className="rf-taskbar">
      <button className="rf-start">
        <span className="rf-start-logo">⊞</span> Start
      </button>
      <div className="rf-status">{status}</div>
      <div className="rf-tray">RoboForge&nbsp;98</div>
    </div>
  )
}

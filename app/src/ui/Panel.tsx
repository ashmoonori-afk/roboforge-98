import type { ReactNode } from 'react'

interface PanelProps {
  title: string
  children: ReactNode
  /** how many grid columns to span (clamped by CSS to available columns) */
  span?: number
  /** taller body (3D viewport, AI design) */
  tall?: boolean
}

/** A responsive Windows-98 panel (grid item). Replaces the absolute draggable
 *  windows so the layout reflows and never clips. */
export function Panel({ title, children, span = 1, tall = false }: PanelProps) {
  return (
    <section className="window rf-panel" style={{ gridColumn: `span ${span}` }}>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <div className={`window-body rf-panel-body${tall ? ' rf-panel-tall' : ''}`}>{children}</div>
    </section>
  )
}

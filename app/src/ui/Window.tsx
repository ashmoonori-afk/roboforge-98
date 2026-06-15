import { useRef, useState } from 'react'
import type { ReactNode, PointerEvent as RPointerEvent, DragEvent as RDragEvent } from 'react'

interface WindowProps {
  title: string
  children: ReactNode
  x: number
  y: number
  width?: number
  height?: number
  minW?: number
  minH?: number
  /** If set, the whole window becomes a drop target for a dragged part id. */
  onDropPart?: (partId: string) => void
}

/** A draggable + resizable Windows-98 window. Drag the title bar to move,
 *  drag the bottom-right grip to resize. `height` is the body height. */
export function Window({
  title, children, x, y, width = 280, height = 180, minW = 170, minH = 90, onDropPart,
}: WindowProps) {
  const [pos, setPos] = useState({ x, y })
  const [size, setSize] = useState({ w: width, h: height })
  const moving = useRef<{ dx: number; dy: number } | null>(null)
  const resizing = useRef<{ x: number; y: number; w: number; h: number } | null>(null)

  const onTitleDown = (e: RPointerEvent<HTMLDivElement>) => {
    moving.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onTitleMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!moving.current) return
    setPos({ x: e.clientX - moving.current.dx, y: e.clientY - moving.current.dy })
  }
  const onTitleUp = (e: RPointerEvent<HTMLDivElement>) => {
    moving.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const onGripDown = (e: RPointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    resizing.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onGripMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!resizing.current) return
    const r = resizing.current
    setSize({
      w: Math.max(minW, r.w + (e.clientX - r.x)),
      h: Math.max(minH, r.h + (e.clientY - r.y)),
    })
  }
  const onGripUp = (e: RPointerEvent<HTMLDivElement>) => {
    resizing.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const onDrop = (e: RDragEvent<HTMLDivElement>) => {
    if (!onDropPart) return
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onDropPart(id)
  }

  return (
    <div
      className="window rf-window"
      style={{ position: 'absolute', left: pos.x, top: pos.y, width: size.w }}
      onDragOver={onDropPart ? (e) => e.preventDefault() : undefined}
      onDrop={onDropPart ? onDrop : undefined}
    >
      <div
        className="title-bar"
        style={{ cursor: 'move', touchAction: 'none' }}
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={onTitleUp}
      >
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" />
          <button aria-label="Maximize" />
          <button aria-label="Close" />
        </div>
      </div>
      <div
        className="window-body rf-body"
        style={{ height: size.h, display: 'flex', flexDirection: 'column', overflow: 'auto' }}
      >
        {children}
      </div>
      <div
        className="rf-resize"
        title="Drag to resize"
        style={{ touchAction: 'none' }}
        onPointerDown={onGripDown}
        onPointerMove={onGripMove}
        onPointerUp={onGripUp}
      />
    </div>
  )
}

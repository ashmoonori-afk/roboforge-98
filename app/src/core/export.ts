import type { DesignResult } from './types'
import type { SceneSpec } from './scene'
import { parts } from '../data/parts'
import { boards } from '../data/boards'

/** Trigger a browser download of text or a Blob. */
export function download(filename: string, data: Blob | string, mime = 'text/plain'): void {
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface BomRow {
  slot: string
  name: string
  source: string
  sku: string
  priceUsd: number | null
  url: string
}

/** Bill of materials for a design — the top suggested part per archetype slot. */
export function bomRows(design: DesignResult): BomRow[] {
  const rows: BomRow[] = []
  for (const slot of design.archetype.partSlots) {
    if (slot === 'MICROCONTROLLER') {
      for (const b of boards.slice(0, 3)) {
        rows.push({ slot, name: b.name, source: 'BOARD', sku: b.id, priceUsd: b.priceUsd, url: b.productUrl })
      }
    } else {
      for (const p of parts.filter((x) => x.category === slot).slice(0, 3)) {
        rows.push({ slot, name: p.name, source: p.source, sku: p.sourceId, priceUsd: p.priceUsd, url: p.productUrl })
      }
    }
  }
  return rows
}

export function toBomCsv(design: DesignResult): string {
  const esc = (s: unknown) => `"${String(s).replace(/"/g, '""')}"`
  const head = 'slot,name,source,sku,price_usd,url'
  const lines = bomRows(design).map((r) =>
    [r.slot, r.name, r.source, r.sku, r.priceUsd ?? '', r.url].map(esc).join(','),
  )
  return [head, ...lines].join('\n')
}

/** Portable project file: requirements spec + sizing + the generated 3D scene. */
export function toDesignJson(design: DesignResult, scene: SceneSpec | null): string {
  return JSON.stringify(
    { spec: design.spec, archetype: design.archetype.id, sizing: design.sizing, bom: bomRows(design), scene },
    null,
    2,
  )
}

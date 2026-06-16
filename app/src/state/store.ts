import { create } from 'zustand'
import type { Part, DesignResult, SpecValue, DesignPlan } from '../core/types'
import type { Assignment } from '../core/mcu'
import type { SceneSpec } from '../core/scene'

export interface PlacedPart {
  instanceId: string
  part: Part
}

export interface HoverInfo {
  title: string
  subtitle?: string
  specs: [string, SpecValue][]
  x: number
  y: number
}

export type LogKind = 'info' | 'gen' | 'wire' | 'warn' | 'note'
export interface LogEntry {
  id: string
  time: string
  kind: LogKind
  text: string
}

const stamp = (): string => new Date().toLocaleTimeString([], { hour12: false })
const append = (logs: LogEntry[], kind: LogKind, text: string): LogEntry[] =>
  [...logs, { id: crypto.randomUUID(), time: stamp(), kind, text }].slice(-250)

export type CamKind =
  | 'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'zoom-in' | 'zoom-out' | 'reset'
export interface CamCmd { kind: CamKind; seq: number }

interface AppState {
  design: DesignResult | null
  placed: PlacedPart[]
  boardId: string
  assignments: Assignment[]
  driving: boolean
  generating: boolean
  status: string
  hover: HoverInfo | null
  logs: LogEntry[]
  camCmd: CamCmd | null
  scene: SceneSpec | null
  plan: DesignPlan | null

  setDesign: (d: DesignResult) => void
  placePart: (part: Part) => void
  removePlaced: (instanceId: string) => void
  setBoard: (id: string) => void
  setAssignments: (a: Assignment[]) => void
  setDriving: (b: boolean) => void
  setGenerating: (b: boolean) => void
  setStatus: (s: string) => void
  setHover: (h: HoverInfo | null) => void
  pushLog: (kind: LogKind, text: string) => void
  cam: (kind: CamKind) => void
  setScene: (scene: SceneSpec | null) => void
  setPlan: (plan: DesignPlan | null) => void
}

export const useStore = create<AppState>((set) => ({
  design: null,
  placed: [],
  boardId: 'uno',
  assignments: [],
  driving: false,
  generating: false,
  status: 'Ready. Describe a robot, then press Drive.',
  hover: null,
  logs: [],
  camCmd: null,
  scene: null,
  plan: null,

  setDesign: (design) => set({ design }),
  placePart: (part) =>
    set((s) => ({
      placed: [...s.placed, { instanceId: crypto.randomUUID(), part }],
      status: `Placed ${part.name} on the robot.`,
      logs: append(s.logs, 'info', `Placed ${part.name} on the robot`),
    })),
  removePlaced: (instanceId) =>
    set((s) => ({ placed: s.placed.filter((p) => p.instanceId !== instanceId) })),
  setBoard: (boardId) =>
    set((s) => ({
      boardId,
      assignments: [],
      status: 'Board changed. Wiring cleared.',
      logs: append(s.logs, 'wire', `Board → ${boardId}; wiring cleared`),
    })),
  setAssignments: (assignments) => set({ assignments }),
  setDriving: (driving) => set({ driving }),
  setGenerating: (generating) => set({ generating }),
  setStatus: (status) => set({ status }),
  setHover: (hover) => set({ hover }),
  pushLog: (kind, text) => set((s) => ({ logs: append(s.logs, kind, text) })),
  cam: (kind) => set((s) => ({ camCmd: { kind, seq: (s.camCmd?.seq ?? 0) + 1 } })),
  setScene: (scene) => set({ scene }),
  setPlan: (plan) => set({ plan }),
}))

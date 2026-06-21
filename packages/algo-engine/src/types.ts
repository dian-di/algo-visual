import type { CodeLine } from '../../core/src/scene/code'

/** Variable entry in the watch panel */
export interface VariableEntry {
  name: string
  value: string
  changed?: boolean
}

/** Composite scene captured at each snapshot */
export interface AlgoScene {
  /** Named datasets — key is the registered name */
  datasets: Record<string, unknown>
  /** Registered pointers — key is pointer id */
  pointers: Record<string, unknown>
  /** Variable watch panel */
  variables: VariableEntry[]
  /** Optional pseudocode with active-line highlighting */
  code?: {
    lines: CodeLine[]
    activeLines: number[]
  }
}

/** Options when calling snapshot() */
export interface SnapshotOptions {
  title?: string
  message?: string
  tag?: string
  duration?: number
}

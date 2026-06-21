import type { CodeLine } from '../../core/src'
import type { Frame } from '../../timeline/src'
import { Timeline } from '../../timeline/src'
import { DatasetStore } from './store/dataset-store'
import { PointerStore } from './store/pointer-store'
import { VariableStore } from './store/variable-store'
import type { AlgoScene, SnapshotOptions } from './types'

/**
 * AlgoBuilder — the single entry-point for algorithm developers.
 *
 * Usage:
 *   const b = new AlgoBuilder()
 *   b.dataset('nums', [3, 1, 4])
 *   b.pointer(pivot)
 *   b.variable('target', 9)
 *   b.snapshot({ title: 'Initial' })
 *
 *   pivot.index = 2
 *   b.snapshot({ title: 'Moved pivot' })
 *
 *   const timeline = b.build()  // → Timeline<AlgoScene>
 */
export class AlgoBuilder {
  readonly datasets = new DatasetStore()
  readonly pointers = new PointerStore()
  readonly variables = new VariableStore()

  private frames: Frame<AlgoScene>[] = []
  private codeLines: CodeLine[] = []
  private codeActiveLines: number[] = []
  private inTransaction = false

  // ---- dataset ----

  /** Register (or replace) a named dataset */
  dataset<T>(name: string, data: T): this {
    this.datasets.register(name, data)
    return this
  }

  // ---- pointer ----

  /** Register a pointer (keyed by its `id` field) */
  pointer(ptr: { id: string } & Record<string, unknown>): this {
    this.pointers.register(ptr)
    return this
  }

  // ---- variable ----

  /** Set a named variable */
  variable(name: string, value: unknown): this {
    this.variables.set(name, value)
    return this
  }

  // ---- code ----

  /** Set the pseudocode listing (persists across snapshots until changed) */
  code(lines: CodeLine[], activeLines?: number[]): this {
    this.codeLines = lines.map((l) => ({ ...l }))
    this.codeActiveLines = activeLines ?? []
    return this
  }

  /** Set which code lines are highlighted for the next snapshot */
  codeHighlight(...lines: number[]): this {
    this.codeActiveLines = lines
    return this
  }

  // ---- snapshot ----

  /** Capture the current state of all stores as a new Frame */
  snapshot(opts?: SnapshotOptions): this {
    if (this.inTransaction) return this

    const scene: AlgoScene = {
      datasets: this.datasets.snapshot(),
      pointers: this.pointers.snapshot(),
      variables: this.variables.snapshot(),
      code:
        this.codeLines.length > 0
          ? { lines: this.codeLines, activeLines: [...this.codeActiveLines] }
          : undefined,
    }

    this.frames.push({
      id: crypto.randomUUID(),
      scene,
      title: opts?.title,
      message: opts?.message,
      tag: opts?.tag,
      duration: opts?.duration,
    })

    return this
  }

  // ---- transaction ----

  /**
   * Run multiple mutations inside a transaction.
   * Only one Frame is produced when the callback finishes.
   */
  transaction(fn: () => void, opts?: SnapshotOptions): this {
    this.inTransaction = true
    try {
      fn()
    } finally {
      this.inTransaction = false
    }
    return this.snapshot(opts)
  }

  // ---- build ----

  /** Produce a Timeline from all collected frames */
  build(): Timeline<AlgoScene> {
    if (this.frames.length === 0) {
      throw new Error('AlgoBuilder.build(): no frames — call snapshot() at least once')
    }
    const timeline = new Timeline<AlgoScene>()
    timeline.append(...this.frames)
    return timeline
  }

  /** Reset the builder for reuse (clears frames, keeps registrations) */
  reset(): this {
    this.frames = []
    return this
  }
}

import type { VariableEntry } from '../types'

/**
 * Stores algorithm variables displayed in a watch panel.
 *
 * Tracks which variables changed since the last snapshot so renderers
 * can highlight them.
 */
export class VariableStore {
  private readonly map = new Map<string, VariableEntry>()
  private changedSinceLastSnapshot = new Set<string>()

  /** Set (or update) a variable's value */
  set(name: string, value: unknown): void {
    const strValue = String(value)
    const existing = this.map.get(name)
    const changed = existing !== undefined && existing.value !== strValue

    this.map.set(name, { name, value: strValue, changed })
    if (changed) {
      this.changedSinceLastSnapshot.add(name)
    }
  }

  get(name: string): VariableEntry | undefined {
    return this.map.get(name)
  }

  has(name: string): boolean {
    return this.map.has(name)
  }

  remove(name: string): boolean {
    this.changedSinceLastSnapshot.delete(name)
    return this.map.delete(name)
  }

  /** Return VariableEntry[] with `changed` flags, then reset flags */
  snapshot(): VariableEntry[] {
    const entries = Array.from(this.map.values()).map((e) => ({
      ...e,
      changed: this.changedSinceLastSnapshot.has(e.name),
    }))
    this.changedSinceLastSnapshot.clear()
    return entries
  }
}

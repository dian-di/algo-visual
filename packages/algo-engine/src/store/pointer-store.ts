/**
 * Stores pointers registered by the algorithm developer.
 *
 * Pointers are stored by reference so the developer can mutate them
 * directly between snapshots. snapshot() deep-copies current state.
 */
export class PointerStore {
  private readonly map = new Map<string, unknown>()

  /** Register a pointer. The pointer's `id` field is used as the key. */
  register(pointer: { id: string } & Record<string, unknown>): void {
    this.map.set(pointer.id, pointer)
  }

  /** Get a pointer by id */
  get<T = unknown>(id: string): T | undefined {
    return this.map.get(id) as T | undefined
  }

  has(id: string): boolean {
    return this.map.has(id)
  }

  remove(id: string): boolean {
    return this.map.delete(id)
  }

  /** Return a deep-cloned snapshot of every registered pointer */
  snapshot(): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [key, value] of this.map) {
      out[key] = structuredClone(value)
    }
    return out
  }
}

/**
 * Stores named datasets registered by the algorithm developer.
 *
 * Datasets are stored by reference — the developer mutates them between
 * snapshots, and the store deep-copies on snapshot().
 */
export class DatasetStore {
  private readonly map = new Map<string, unknown>()

  /** Register (or replace) a dataset under the given name */
  register<T>(name: string, dataset: T): void {
    this.map.set(name, dataset)
  }

  /** Get the current dataset by name */
  get<T = unknown>(name: string): T | undefined {
    return this.map.get(name) as T | undefined
  }

  /** Check whether a dataset is registered */
  has(name: string): boolean {
    return this.map.has(name)
  }

  /** Remove a dataset */
  remove(name: string): boolean {
    return this.map.delete(name)
  }

  /** Return a deep-cloned snapshot of every registered dataset */
  snapshot(): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const [key, value] of this.map) {
      out[key] = structuredClone(value)
    }
    return out
  }
}

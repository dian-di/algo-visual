import type { RendererPlugin } from './types'

/**
 * Registry that maps dataset shapes to renderer plugins.
 *
 * Plugins are tried in registration order — the first whose
 * supports() returns true wins.
 */
export class RendererRegistry {
  private readonly plugins: RendererPlugin[] = []

  /** Register a renderer plugin */
  register(plugin: RendererPlugin): void {
    if (this.plugins.some((p) => p.id === plugin.id)) {
      throw new Error(`RendererRegistry: plugin "${plugin.id}" already registered`)
    }
    this.plugins.push(plugin)
  }

  /** Find the first plugin that can handle the given data */
  resolve(data: unknown): RendererPlugin | undefined {
    return this.plugins.find((p) => p.supports(data))
  }

  /** Return all registered plugins */
  all(): readonly RendererPlugin[] {
    return this.plugins
  }

  /** Remove a plugin by id */
  unregister(id: string): boolean {
    const idx = this.plugins.findIndex((p) => p.id === id)
    if (idx < 0) return false
    this.plugins.splice(idx, 1)
    return true
  }
}

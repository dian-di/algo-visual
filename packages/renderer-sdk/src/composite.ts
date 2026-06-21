import type { AlgoScene } from '../../algo-engine/src/types'
import type { Frame } from '../../timeline/src'
import { node } from './helpers'
import { RendererRegistry } from './registry'
import { ArrayRenderer } from './renderers/array'
import { CodeRenderer } from './renderers/code'
import { GraphRenderer } from './renderers/graph'
import { TreeRenderer } from './renderers/tree'
import { VariableRenderer } from './renderers/variable'
import type { RenderNode } from './types'

/**
 * Creates a registry pre-loaded with all built-in renderers.
 */
export function createDefaultRegistry(): RendererRegistry {
  const registry = new RendererRegistry()
  registry.register(ArrayRenderer)
  registry.register(TreeRenderer)
  registry.register(GraphRenderer)
  registry.register(CodeRenderer)
  registry.register(VariableRenderer)
  return registry
}

/**
 * CompositeRenderer — the top-level entry point for rendering a frame.
 *
 * Given a Frame<AlgoScene>, it resolves the right renderer for each
 * dataset via the registry, then appends code and variable panels,
 * producing a single RenderNode tree.
 *
 * Usage:
 *   const renderer = new CompositeRenderer()
 *   const tree = renderer.renderFrame(frame)
 */
export class CompositeRenderer {
  private readonly registry: RendererRegistry

  constructor(registry?: RendererRegistry) {
    this.registry = registry ?? createDefaultRegistry()
  }

  /**
   * Render a full frame into a RenderNode tree.
   *
   * Layout of the output:
   *   container
   *   ├─ [dataset nodes resolved via registry]
   *   ├─ code-panel  (if frame.scene.code exists)
   *   └─ variable-panel (if frame.scene.variables is non-empty)
   */
  renderFrame(frame: Frame<AlgoScene>): RenderNode {
    const { scene } = frame
    const children: RenderNode[] = []

    // 1. Render each named dataset
    for (const [name, data] of Object.entries(scene.datasets)) {
      const plugin = this.registry.resolve(data)
      if (!plugin) continue

      // Only pass pointers whose `dataset` matches this dataset name,
      // plus pointers with no `dataset` (broadcast to all).
      const datasetPointers: Record<string, unknown> = {}
      for (const [pid, ptr] of Object.entries(scene.pointers)) {
        const p = ptr as Record<string, unknown>
        if (!('dataset' in p) || p.dataset === name) {
          datasetPointers[pid] = ptr
        }
      }

      const rendered = plugin.render(data, datasetPointers)
      children.push(rendered)
    }

    // 2. Render code (if present)
    if (scene.code) {
      const codePlugin = this.registry.resolve(scene.code)
      if (codePlugin) {
        children.push(codePlugin.render(scene.code, {}))
      }
    }

    // 3. Render variables
    if (scene.variables.length > 0) {
      const varPlugin = this.registry.resolve(scene.variables)
      if (varPlugin) {
        children.push(varPlugin.render(scene.variables, {}))
      }
    }

    return node(
      'frame',
      {
        id: frame.id,
        title: frame.title,
        message: frame.message,
        tag: frame.tag,
      },
      children,
    )
  }
}

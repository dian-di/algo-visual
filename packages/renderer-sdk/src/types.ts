/**
 * Framework-agnostic visual tree node.
 *
 * Every renderer produces RenderNode trees. Host frameworks (React, Vue,
 * Canvas, SVG) interpret these into actual DOM / drawing calls.
 */
export interface RenderNode {
  /** Node kind — e.g. 'container', 'array', 'cell', 'tree', 'edge', 'text' */
  type: string
  /** Type-specific properties (layout hints, data, variant, etc.) */
  props?: Record<string, unknown>
  /** Child nodes */
  children?: RenderNode[]
}

/**
 * Plugin contract for data-structure renderers.
 *
 * Renderers are pure functions — they must not maintain state.
 */
export interface RendererPlugin {
  /** Unique renderer identifier */
  id: string

  /** Duck-type check: can this renderer handle the given dataset? */
  supports(data: unknown): boolean

  /** Produce a RenderNode tree for the dataset + its pointers */
  render(data: unknown, pointers: Record<string, unknown>): RenderNode
}

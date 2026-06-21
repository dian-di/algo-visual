import type { RenderNode } from './types'

/** Shorthand for creating a RenderNode */
export function node(
  type: string,
  props?: Record<string, unknown>,
  children?: RenderNode[],
): RenderNode {
  const n: RenderNode = { type }
  if (props !== undefined && Object.keys(props).length > 0) n.props = props
  if (children !== undefined && children.length > 0) n.children = children
  return n
}

/** Create a text leaf node */
export function text(value: string, props?: Record<string, unknown>): RenderNode {
  return node('text', { value, ...props })
}

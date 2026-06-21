import type { PointPointer, PathPointer } from '../../pointer'

export interface GraphNode {
  id: string
  label: string
  /** Normalised position for layout (0-1) */
  x?: number
  y?: number
}

export interface GraphEdge {
  from: string
  to: string
  weight?: number
  /** Whether this edge is currently highlighted / active */
  active?: boolean
}

/** Scene for visualizing graph structures */
export interface GraphScene {
  nodes: GraphNode[]
  edges: GraphEdge[]
  pointers?: PointPointer[]
  paths?: PathPointer[]
  directed?: boolean
}

export function createGraphScene(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed = false,
): GraphScene {
  return { nodes: nodes.map((n) => ({ ...n })), edges: edges.map((e) => ({ ...e })), directed }
}

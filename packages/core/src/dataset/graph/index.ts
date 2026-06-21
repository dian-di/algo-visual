import type { PointPointer } from '../../pointer'

export interface GraphNode {
  id: string
  label: string
}

export interface GraphEdge {
  from: string
  to: string
  weight?: number
}

export interface GraphDataset {
  nodes: GraphNode[]
  edges: GraphEdge[]
  directed?: boolean
  pointers?: PointPointer[]
}

export function createGraphDataset(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed = false,
): GraphDataset {
  return {
    nodes: nodes.map((n) => ({ ...n })),
    edges: edges.map((e) => ({ ...e })),
    directed,
  }
}

export function addNode(graph: GraphDataset, node: GraphNode): GraphDataset {
  return { ...graph, nodes: [...graph.nodes, node] }
}

export function addEdge(graph: GraphDataset, edge: GraphEdge): GraphDataset {
  return { ...graph, edges: [...graph.edges, edge] }
}

export function neighbors(graph: GraphDataset, nodeId: string): string[] {
  const result: string[] = []
  for (const e of graph.edges) {
    if (e.from === nodeId) result.push(e.to)
    if (!graph.directed && e.to === nodeId) result.push(e.from)
  }
  return result
}

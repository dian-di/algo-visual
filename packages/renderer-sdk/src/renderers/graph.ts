import type { RendererPlugin, RenderNode } from '../types'
import { node, text } from '../helpers'

interface GraphNodeData {
  id: string
  label: string
  x?: number
  y?: number
}

interface GraphEdgeData {
  from: string
  to: string
  weight?: number
  active?: boolean
}

function isGraphLike(
  data: unknown,
): data is { nodes: GraphNodeData[]; edges: GraphEdgeData[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'nodes' in data &&
    'edges' in data &&
    Array.isArray((data as Record<string, unknown>).nodes) &&
    Array.isArray((data as Record<string, unknown>).edges)
  )
}

export const GraphRenderer: RendererPlugin = {
  id: 'graph',

  supports(data) {
    return isGraphLike(data)
  },

  render(data, pointers) {
    const { nodes, edges, directed, highlights } = data as {
      nodes: GraphNodeData[]
      edges: GraphEdgeData[]
      directed?: boolean
      highlights?: { indices: number[]; variant: string }[]
    }

    // Build a variant map from highlights (index → variant)
    const nodeVariants = new Map<number, string>()
    if (Array.isArray(highlights)) {
      for (const h of highlights) {
        for (const idx of h.indices) {
          nodeVariants.set(idx, h.variant)
        }
      }
    }

    // Collect point pointers with string targets (node ids)
    const ptrList = Object.values(pointers).filter(
      (p): p is { id: string; target: string; label: string; variant?: string } =>
        typeof p === 'object' &&
        p !== null &&
        'type' in p &&
        (p as Record<string, unknown>).type === 'point' &&
        typeof (p as Record<string, unknown>).target === 'string',
    )
    const ptrMap = new Map<string, { id: string; label: string; variant?: string }[]>()
    for (const p of ptrList) {
      const arr = ptrMap.get(p.target) ?? []
      arr.push(p)
      ptrMap.set(p.target, arr)
    }

    const graphNodes: RenderNode[] = nodes.map((n, i) => {
      const ptrs = ptrMap.get(n.id)
      const ptrChildren = ptrs
        ? [
            node(
              'pointers',
              {},
              ptrs.map((p) => text(p.label, { variant: p.variant })),
            ),
          ]
        : undefined

      return node(
        'graph-node',
        {
          id: n.id,
          label: n.label,
          x: n.x,
          y: n.y,
          ...(nodeVariants.has(i) ? { variant: nodeVariants.get(i) } : {}),
        },
        ptrChildren,
      )
    })

    const edgeNodes: RenderNode[] = edges.map((e) =>
      node('graph-edge', {
        from: e.from,
        to: e.to,
        weight: e.weight,
        active: e.active,
        directed: directed ?? false,
      }),
    )

    // Collect path pointers
    const pathList = Object.values(pointers).filter(
      (p): p is { id: string; nodes: string[]; activeIndex?: number; variant?: string } =>
        typeof p === 'object' &&
        p !== null &&
        'type' in p &&
        (p as Record<string, unknown>).type === 'path',
    )
    const pathNodes: RenderNode[] = pathList.map((p) =>
      node('path', {
        id: p.id,
        nodes: p.nodes,
        activeIndex: p.activeIndex,
        variant: p.variant,
      }),
    )

    return node(
      'graph',
      { nodeCount: nodes.length, edgeCount: edges.length, directed: directed ?? false },
      [...graphNodes, ...edgeNodes, ...pathNodes],
    )
  },
}

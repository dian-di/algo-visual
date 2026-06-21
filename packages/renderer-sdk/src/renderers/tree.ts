import { node, text } from '../helpers'
import type { RendererPlugin, RenderNode } from '../types'

interface TreeNodeData {
  id: string
  value: string
  left?: string
  right?: string
}

function isTreeLike(data: unknown): data is { nodes: TreeNodeData[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'nodes' in data &&
    Array.isArray((data as Record<string, unknown>).nodes) &&
    !('edges' in (data as Record<string, unknown>))
  )
}

export const TreeRenderer: RendererPlugin = {
  id: 'tree',

  supports(data) {
    return isTreeLike(data)
  },

  render(data, pointers) {
    const { nodes } = data as { nodes: TreeNodeData[] }

    // Collect point pointers with string targets (node ids)
    const ptrList = Object.values(pointers).filter(
      (p): p is { id: string; target: string; label: string; variant?: string } =>
        typeof p === 'object' &&
        p !== null &&
        'type' in p &&
        (p as Record<string, unknown>).type === 'point' &&
        typeof (p as Record<string, unknown>).target === 'string',
    )

    // Map: nodeId -> pointers[]
    const ptrMap = new Map<string, { id: string; label: string; variant?: string }[]>()
    for (const p of ptrList) {
      const arr = ptrMap.get(p.target) ?? []
      arr.push(p)
      ptrMap.set(p.target, arr)
    }

    const byId = new Map(nodes.map((n) => [n.id, n]))

    const treeNodes: RenderNode[] = nodes.map((n) => {
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
        'tree-node',
        { id: n.id, value: n.value, left: n.left, right: n.right },
        ptrChildren,
      )
    })

    const edges: RenderNode[] = []
    for (const n of nodes) {
      if (n.left && byId.has(n.left)) {
        edges.push(node('edge', { from: n.id, to: n.left, side: 'left' }))
      }
      if (n.right && byId.has(n.right)) {
        edges.push(node('edge', { from: n.id, to: n.right, side: 'right' }))
      }
    }

    return node('tree', { nodeCount: nodes.length }, [...treeNodes, ...edges])
  },
}

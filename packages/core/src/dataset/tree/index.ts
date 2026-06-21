import type { PointPointer } from '../../pointer'

export interface TreeNode {
  id: string
  value: string
  left?: string
  right?: string
}

export interface TreeDataset {
  nodes: TreeNode[]
  pointers?: PointPointer[]
}

export function createTreeDataset(nodes: TreeNode[]): TreeDataset {
  return { nodes: nodes.map((n) => ({ ...n })) }
}

export function findNode(tree: TreeDataset, id: string): TreeNode | undefined {
  return tree.nodes.find((n) => n.id === id)
}

export function addChild(
  tree: TreeDataset,
  parentId: string,
  child: TreeNode,
  side: 'left' | 'right',
): TreeDataset {
  const nodes = tree.nodes.map((n) => {
    if (n.id !== parentId) return n
    return side === 'left' ? { ...n, left: child.id } : { ...n, right: child.id }
  })
  return { ...tree, nodes: [...nodes, child] }
}

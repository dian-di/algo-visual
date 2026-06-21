import type { PointPointer } from '../../pointer'

export interface TreeNode {
  id: string
  value: string
  left?: string
  right?: string
}

/** Scene for visualizing tree structures (binary tree, BST, trie, etc.) */
export interface TreeScene {
  nodes: TreeNode[]
  pointers?: PointPointer[]
}

export function createTreeScene(nodes: TreeNode[]): TreeScene {
  return { nodes: nodes.map((n) => ({ ...n })) }
}

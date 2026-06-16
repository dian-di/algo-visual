import type { Variant } from '@/global'

export interface TreeNode {
  id: string

  value: string

  left?: string

  right?: string
}

export interface TreeScene {
  nodes: TreeNode[]

  pointers?: {
    nodeId: string

    text: string

    variant?: Variant
  }[]
}

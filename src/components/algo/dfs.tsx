import { AlgoBuilder } from '@packages/algo-engine/src'
import { TimelinePlayer } from '@packages/react-player/src'
import { PlaybackController } from '@packages/timeline/src'

/*
  Tree:
        A
       / \
      B   C
     / \   \
    D   E   F
*/

function buildDFS() {
  const b = new AlgoBuilder()

  const tree = {
    nodes: [
      { id: 'A', value: 'A', left: 'B', right: 'C' },
      { id: 'B', value: 'B', left: 'D', right: 'E' },
      { id: 'C', value: 'C', right: 'F' },
      { id: 'D', value: 'D' },
      { id: 'E', value: 'E' },
      { id: 'F', value: 'F' },
    ],
  }

  const treeData: {
    nodes: { id: string; value: string; left?: string; right?: string }[]
    highlights: { indices: number[]; variant: string }[]
  } = { nodes: [...tree.nodes], highlights: [] }

  b.dataset('tree', treeData)

  // Stack shown as a dataset
  const stackData: {
    values: string[]
    highlights: { indices: number[]; variant: string }[]
  } = { values: [], highlights: [] }

  b.dataset('stack', stackData)

  const visited = new Set<string>()
  const visitedList: string[] = []

  // Visited group pointer
  const visitedPtr = {
    id: 'visited',
    type: 'group' as const,
    targets: [] as string[],
    label: 'visited',
    variant: 'success' as const,
    dataset: 'tree',
  }
  b.pointer(visitedPtr)

  // Current node pointer
  const currentPtr = {
    id: 'current',
    type: 'point' as const,
    target: 'A',
    label: 'current',
    variant: 'primary' as const,
    dataset: 'tree',
  }
  b.pointer(currentPtr)

  b.snapshot({ title: 'DFS', message: '深度优先遍历，从 A 开始' })

  // Iterative DFS
  const stack: string[] = ['A']
  stackData.values = [...stack]
  b.variable('stack', `[${stack}]`)

  b.snapshot({ title: 'Push', message: `将 A 入栈` })

  while (stack.length > 0) {
    const nodeId = stack.pop()!
    stackData.values = [...stack]
    stackData.highlights = [{ indices: [], variant: 'primary' }]

    if (visited.has(nodeId)) {
      b.variable('stack', `[${stack}]`)
      b.snapshot({
        title: 'Skip',
        message: `${nodeId} 已访问，跳过`,
      })
      continue
    }

    visited.add(nodeId)
    visitedList.push(nodeId)
    visitedPtr.targets = [...visitedList]
    currentPtr.target = nodeId

    b.variable('stack', `[${stack}]`)
    b.variable('visited', `[${visitedList}]`)

    data_highlights_reset(treeData)
    treeData.highlights = [{ indices: [tree.nodes.findIndex((n) => n.id === nodeId)], variant: 'primary' }]

    b.snapshot({
      title: 'Visit',
      message: `访问节点 ${nodeId}`,
    })

    // Push children (right first, so left is processed first)
    const node = tree.nodes.find((n) => n.id === nodeId)
    if (node) {
      const children: string[] = []
      if (node.right && !visited.has(node.right)) {
        stack.push(node.right)
        children.push(node.right)
      }
      if (node.left && !visited.has(node.left)) {
        stack.push(node.left)
        children.push(node.left)
      }
      stackData.values = [...stack]

      if (children.length > 0) {
        b.variable('stack', `[${stack}]`)
        b.snapshot({
          title: 'Push children',
          message: `将 ${children.join(', ')} 入栈`,
        })
      }
    }

    treeData.highlights = []
  }

  b.snapshot({
    title: 'Done',
    message: `遍历顺序: ${visitedList.join(' → ')}`,
  })

  return b.build()
}

function data_highlights_reset(data: { highlights: unknown[] }) {
  data.highlights = []
}

const controller = new PlaybackController(buildDFS())

export default function DFSDemo() {
  return <TimelinePlayer controller={controller} />
}

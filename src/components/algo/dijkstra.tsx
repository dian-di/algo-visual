import { AlgoBuilder } from '@packages/algo-engine/src'
import { TimelinePlayer } from '@packages/react-player/src'
import { PlaybackController } from '@packages/timeline/src'

/*
  Graph:
    A --1-- B --2-- C
    |       |       |
    4       3       1
    |       |       |
    D --1-- E --5-- F

  Shortest path from A to all nodes.
*/

function buildDijkstra() {
  const b = new AlgoBuilder()

  const graph = {
    nodes: [
      { id: 'A', label: 'A' },
      { id: 'B', label: 'B' },
      { id: 'C', label: 'C' },
      { id: 'D', label: 'D' },
      { id: 'E', label: 'E' },
      { id: 'F', label: 'F' },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'A', to: 'D', weight: 4 },
      { from: 'B', to: 'C', weight: 2 },
      { from: 'B', to: 'E', weight: 3 },
      { from: 'C', to: 'F', weight: 1 },
      { from: 'D', to: 'E', weight: 1 },
      { from: 'E', to: 'F', weight: 5 },
    ],
    directed: false,
  }

  const graphData: {
    nodes: { id: string; label: string }[]
    edges: { from: string; to: string; weight: number; active?: boolean }[]
    directed: boolean
    highlights: { indices: number[]; variant: string }[]
  } = { nodes: [...graph.nodes], edges: graph.edges.map((e) => ({ ...e })), directed: false, highlights: [] }

  b.dataset('graph', graphData)

  const dist: Record<string, number> = {}
  const prev: Record<string, string | null> = {}
  const unvisited = new Set<string>()

  for (const n of graph.nodes) {
    dist[n.id] = Infinity
    prev[n.id] = null
    unvisited.add(n.id)
  }
  dist['A'] = 0

  // Current node pointer
  const currentPtr = {
    id: 'current',
    type: 'point' as const,
    target: 'A',
    label: 'current',
    variant: 'primary' as const,
    dataset: 'graph',
  }
  b.pointer(currentPtr)

  // Path pointer for shortest path
  const pathPtr = {
    id: 'sp',
    type: 'path' as const,
    nodes: ['A'],
    label: 'path',
    variant: 'success' as const,
    activeIndex: 0,
    dataset: 'graph',
  }
  b.pointer(pathPtr)

  b.snapshot({ title: 'Dijkstra', message: `从 A 出发，求最短路径` })

  // Initialize distances
  b.variable('dist(A)', 0)
  b.variable('dist(B)', '∞')
  b.variable('dist(C)', '∞')
  b.variable('dist(D)', '∞')
  b.variable('dist(E)', '∞')
  b.variable('dist(F)', '∞')
  b.snapshot({ title: 'Init', message: `初始化距离表，dist[A] = 0，其余为 ∞` })

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let u = ''
    let minDist = Infinity
    for (const id of unvisited) {
      if (dist[id] < minDist) {
        minDist = dist[id]
        u = id
      }
    }

    if (minDist === Infinity) break

    unvisited.delete(u)
    currentPtr.target = u

    b.variable('dist(A)', dist['A'] === Infinity ? '∞' : dist['A'])
    b.variable('dist(B)', dist['B'] === Infinity ? '∞' : dist['B'])
    b.variable('dist(C)', dist['C'] === Infinity ? '∞' : dist['C'])
    b.variable('dist(D)', dist['D'] === Infinity ? '∞' : dist['D'])
    b.variable('dist(E)', dist['E'] === Infinity ? '∞' : dist['E'])
    b.variable('dist(F)', dist['F'] === Infinity ? '∞' : dist['F'])

    // Highlight current node
    const nodeIdx = graphData.nodes.findIndex((n) => n.id === u)
    graphData.highlights = [{ indices: [nodeIdx], variant: 'primary' }]

    b.snapshot({
      title: 'Pick min',
      message: `选择未访问节点中距离最小的 ${u} (dist = ${dist[u]})`,
    })

    // Relax neighbors
    const neighbors = graph.edges.filter((e) => e.from === u || e.to === u)
    for (const edge of neighbors) {
      const v = edge.from === u ? edge.to : edge.from
      if (!unvisited.has(v)) continue

      const newDist = dist[u] + edge.weight
      const oldDist = dist[v]

      // Highlight the edge being relaxed
      const edgeIdx = graphData.edges.findIndex(
        (e) => (e.from === u && e.to === v) || (e.from === v && e.to === u),
      )
      graphData.edges = graphData.edges.map((e, idx) => ({
        ...e,
        active: idx === edgeIdx,
      }))

      if (newDist < oldDist) {
        dist[v] = newDist
        prev[v] = u
        b.variable('dist(A)', dist['A'] === Infinity ? '∞' : dist['A'])
        b.variable('dist(B)', dist['B'] === Infinity ? '∞' : dist['B'])
        b.variable('dist(C)', dist['C'] === Infinity ? '∞' : dist['C'])
        b.variable('dist(D)', dist['D'] === Infinity ? '∞' : dist['D'])
        b.variable('dist(E)', dist['E'] === Infinity ? '∞' : dist['E'])
        b.variable('dist(F)', dist['F'] === Infinity ? '∞' : dist['F'])

        b.snapshot({
          title: 'Relax',
          message: `${u} → ${v}: ${oldDist === Infinity ? '∞' : oldDist} → ${newDist}`,
        })
      } else {
        b.snapshot({
          title: 'Relax',
          message: `${u} → ${v}: ${newDist} >= ${oldDist === Infinity ? '∞' : oldDist}，不更新`,
        })
      }
    }

    graphData.edges = graphData.edges.map((e) => ({ ...e, active: false }))
    graphData.highlights = []
  }

  // Show shortest path to F
  const pathTo: string[] = []
  let node: string | null = 'F'
  while (node) {
    pathTo.unshift(node)
    node = prev[node] ?? null
  }
  pathPtr.nodes = pathTo
  pathPtr.activeIndex = pathTo.length - 1

  b.snapshot({
    title: 'Done',
    message: `A 到 F 最短路径: ${pathTo.join(' → ')}，距离 = ${dist['F']}`,
  })

  return b.build()
}

const controller = new PlaybackController(buildDijkstra())

export default function DijkstraDemo() {
  return <TimelinePlayer controller={controller} />
}

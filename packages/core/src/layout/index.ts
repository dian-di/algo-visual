// Layout configuration for arranging visualization elements

export interface LayoutConfig {
  /** Gap between items in px */
  gap: number
  /** Item size in px (width for horizontal, height for vertical) */
  itemSize: number
  /** Direction of the main axis */
  direction: 'horizontal' | 'vertical'
}

export const defaultLayout: LayoutConfig = {
  gap: 8,
  itemSize: 48,
  direction: 'horizontal',
}

/** Calculate the position (x or y) of an item at the given index */
export function itemPosition(index: number, config: LayoutConfig = defaultLayout): number {
  return index * (config.itemSize + config.gap)
}

/** Calculate the total span of n items including gaps */
export function totalSpan(count: number, config: LayoutConfig = defaultLayout): number {
  if (count <= 0) return 0
  return count * config.itemSize + (count - 1) * config.gap
}

// --- Tree layout helpers ---

export interface TreeLayoutParams {
  /** Horizontal gap between sibling subtrees */
  siblingGap: number
  /** Vertical gap between levels */
  levelGap: number
  /** Node diameter in px */
  nodeSize: number
}

export const defaultTreeLayout: TreeLayoutParams = {
  siblingGap: 24,
  levelGap: 64,
  nodeSize: 40,
}

export interface TreeNodePosition {
  id: string
  x: number
  y: number
}

/**
 * Simple binary-tree layout: BFS level-order, evenly spaced within each level.
 * Returns a map of nodeId -> {x, y} (center coordinates).
 */
export function layoutBinaryTree(
  nodes: { id: string; left?: string; right?: string }[],
  params: TreeLayoutParams = defaultTreeLayout,
): Map<string, TreeNodePosition> {
  if (nodes.length === 0) return new Map()

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const positions = new Map<string, TreeNodePosition>()
  const root = nodes[0]

  // BFS
  const queue: { id: string; level: number; order: number }[] = [
    { id: root.id, level: 0, order: 0 },
  ]

  let maxLevel = 0
  const levelCounts = new Map<number, number>()

  while (queue.length > 0) {
    const { id, level, order } = queue.shift()!
    positions.set(id, { id, x: order, y: level })
    maxLevel = Math.max(maxLevel, level)
    levelCounts.set(level, (levelCounts.get(level) ?? 0) + 1)

    const node = byId.get(id)
    if (!node) continue

    const nextOrder = order * 2
    if (node.left) queue.push({ id: node.left, level: level + 1, order: nextOrder })
    if (node.right) queue.push({ id: node.right, level: level + 1, order: nextOrder + 1 })
  }

  // Normalize x positions per level
  for (const pos of positions.values()) {
    const count = levelCounts.get(pos.y) ?? 1
    pos.x = pos.x * (params.nodeSize + params.siblingGap)
    pos.y = pos.y * (params.nodeSize + params.levelGap)
  }

  return positions
}

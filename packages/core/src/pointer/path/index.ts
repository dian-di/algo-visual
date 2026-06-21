import type { PathPointer } from '../types'

export function createPath(
  nodes: string[],
  label: string,
  opts?: { color?: string; description?: string },
): PathPointer {
  return { id: crypto.randomUUID(), type: 'path', nodes, label, activeIndex: -1, ...opts }
}

/** Return a new path with the active index advanced by one */
export function advancePath(path: PathPointer): PathPointer {
  const next = (path.activeIndex ?? -1) + 1
  return next < path.nodes.length ? { ...path, activeIndex: next } : path
}

/** Whether the path has been fully traversed */
export function isPathComplete(path: PathPointer): boolean {
  return (path.activeIndex ?? -1) >= path.nodes.length - 1
}

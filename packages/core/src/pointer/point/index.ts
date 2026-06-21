import type { PointPointer } from '../types'

export function createPoint(
  target: string | number,
  label: string,
  opts?: { color?: string; description?: string },
): PointPointer {
  return { id: crypto.randomUUID(), type: 'point', target, label, ...opts }
}

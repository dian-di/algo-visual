import type { Highlight, RangePointer } from '../types'

export function createRange(
  start: number,
  end: number,
  label: string,
  opts?: { color?: string; description?: string },
): RangePointer {
  return { id: crypto.randomUUID(), type: 'range', start, end, label, ...opts }
}

export function createHighlight(indices: number[], variant: Highlight['variant']): Highlight {
  return { id: crypto.randomUUID(), indices, variant }
}

/** Check whether a given index falls inside a range (inclusive) */
export function inRange(range: RangePointer, index: number): boolean {
  return index >= range.start && index <= range.end
}

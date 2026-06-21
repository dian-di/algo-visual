import type { Variant } from '../../types'

/**
 * Unified base for all pointer types.
 *
 * Pointer is the attention system — it tells the user where to look.
 * Every pointer carries an id, label, and optional rendering hints.
 */
export interface BasePointer {
  id: string
  label: string
  color?: string
  description?: string
  /** Semantic variant from the design system (primary, danger, etc.) */
  variant?: Variant
  /**
   * Which dataset this pointer belongs to.
   * When set, only the renderer for that dataset will receive this pointer.
   * When omitted, the pointer is broadcast to all dataset renderers.
   */
  dataset?: string
}

/** Discriminated union of all pointer types */
export type AnyPointer = PointPointer | RangePointer | PathPointer | GroupPointer

// --- Pointer types (spec: pointer.md) ---

/** Points at a single element — an index (number) or a node id (string) */
export interface PointPointer extends BasePointer {
  type: 'point'
  target: string | number
}

/** Highlights a contiguous range */
export interface RangePointer extends BasePointer {
  type: 'range'
  start: number
  end: number
}

/** An ordered sequence of node ids representing a traversal path */
export interface PathPointer extends BasePointer {
  type: 'path'
  nodes: string[]
  /** Index of the currently active node along the path (-1 = none) */
  activeIndex?: number
}

/** A set of element identifiers (visited, frontier, closed set, ...) */
export interface GroupPointer extends BasePointer {
  type: 'group'
  targets: string[]
}

// --- Extra: non-contiguous highlight (not in spec, used by ArrayRenderer) ---

export interface Highlight {
  id: string
  indices: number[]
  variant: Variant
}

// --- Type guards ---

export function isPointPointer(p: AnyPointer): p is PointPointer {
  return p.type === 'point'
}

export function isRangePointer(p: AnyPointer): p is RangePointer {
  return p.type === 'range'
}

export function isPathPointer(p: AnyPointer): p is PathPointer {
  return p.type === 'path'
}

export function isGroupPointer(p: AnyPointer): p is GroupPointer {
  return p.type === 'group'
}

import type { Highlight, PointPointer, RangePointer } from '../../pointer'

/** Scene for visualizing array / linear structures */
export interface ArrayScene<T = number> {
  values: T[]
  pointers?: PointPointer[]
  highlights?: Highlight[]
  ranges?: RangePointer[]
}

export function createArrayScene<T = number>(values: T[]): ArrayScene<T> {
  return { values: [...values] }
}

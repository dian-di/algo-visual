import type { Highlight, PointPointer } from '../../pointer'

export interface ArrayDataset<T = number> {
  values: T[]
  pointers?: PointPointer[]
  highlights?: Highlight[]
}

export function createArrayDataset<T = number>(values: T[]): ArrayDataset<T> {
  return { values: [...values] }
}

export function swap<T>(arr: ArrayDataset<T>, i: number, j: number): ArrayDataset<T> {
  const next = [...arr.values]
  ;[next[i], next[j]] = [next[j], next[i]]
  return { ...arr, values: next }
}

export function setValue<T>(arr: ArrayDataset<T>, index: number, value: T): ArrayDataset<T> {
  const next = [...arr.values]
  next[index] = value
  return { ...arr, values: next }
}

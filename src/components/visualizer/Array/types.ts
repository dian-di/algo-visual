import type { Variant } from '@/global'

export interface ArrayPointer {
  id: string

  index: number

  text: string

  variant?: Variant
}

export interface ArrayHighlight {
  indices: number[]

  variant: Variant
}

export interface ArrayRange {
  start: number

  end: number

  label?: string

  variant?: 'primary' | 'secondary'
}

export interface ArrayScene<T = number> {
  values: T[]

  pointers?: ArrayPointer[]

  highlights?: ArrayHighlight[]
}

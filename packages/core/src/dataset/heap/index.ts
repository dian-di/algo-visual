export interface HeapDataset<T = number> {
  items: T[]
  /** 'min' = min-heap, 'max' = max-heap */
  type: 'min' | 'max'
}

export function createHeapDataset<T = number>(type: 'min' | 'max' = 'min'): HeapDataset<T> {
  return { items: [], type }
}

function shouldSwap<T>(a: T, b: T, type: 'min' | 'max'): boolean {
  return type === 'min' ? a < b : a > b
}

function siftUp<T>(items: T[], index: number, type: 'min' | 'max'): T[] {
  const next = [...items]
  let i = index
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2)
    if (!shouldSwap(next[i], next[parent], type)) break
    ;[next[i], next[parent]] = [next[parent], next[i]]
    i = parent
  }
  return next
}

function siftDown<T>(items: T[], index: number, type: 'min' | 'max'): T[] {
  const next = [...items]
  const n = next.length
  let i = index
  while (true) {
    let target = i
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < n && shouldSwap(next[left], next[target], type)) target = left
    if (right < n && shouldSwap(next[right], next[target], type)) target = right
    if (target === i) break
    ;[next[i], next[target]] = [next[target], next[i]]
    i = target
  }
  return next
}

export function insert<T>(heap: HeapDataset<T>, value: T): HeapDataset<T> {
  const items = siftUp([...heap.items, value], heap.items.length, heap.type)
  return { ...heap, items }
}

export function extract<T>(heap: HeapDataset<T>): { heap: HeapDataset<T>; value: T } {
  if (heap.items.length === 0) throw new Error('Heap is empty')
  const value = heap.items[0]
  const last = heap.items[heap.items.length - 1]
  const rest = heap.items.slice(0, -1)
  const items = rest.length > 0 ? siftDown([last, ...rest.slice(0)], 0, heap.type) : []
  return { heap: { ...heap, items }, value }
}

export function peek<T>(heap: HeapDataset<T>): T | undefined {
  return heap.items[0]
}

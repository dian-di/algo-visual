export interface StackDataset<T = number> {
  items: T[]
  /** Max capacity, undefined = unbounded */
  capacity?: number
}

export function createStackDataset<T = number>(capacity?: number): StackDataset<T> {
  return { items: [], capacity }
}

export function push<T>(stack: StackDataset<T>, value: T): StackDataset<T> {
  if (stack.capacity !== undefined && stack.items.length >= stack.capacity) {
    throw new Error('Stack overflow')
  }
  return { ...stack, items: [...stack.items, value] }
}

export function pop<T>(stack: StackDataset<T>): { stack: StackDataset<T>; value: T } {
  if (stack.items.length === 0) {
    throw new Error('Stack underflow')
  }
  const items = [...stack.items]
  const value = items.pop()!
  return { stack: { ...stack, items }, value }
}

export function peek<T>(stack: StackDataset<T>): T | undefined {
  return stack.items[stack.items.length - 1]
}

export function isEmpty<T>(stack: StackDataset<T>): boolean {
  return stack.items.length === 0
}

export interface QueueDataset<T = number> {
  items: T[]
  capacity?: number
}

export function createQueueDataset<T = number>(capacity?: number): QueueDataset<T> {
  return { items: [], capacity }
}

export function enqueue<T>(queue: QueueDataset<T>, value: T): QueueDataset<T> {
  if (queue.capacity !== undefined && queue.items.length >= queue.capacity) {
    throw new Error('Queue overflow')
  }
  return { ...queue, items: [...queue.items, value] }
}

export function dequeue<T>(queue: QueueDataset<T>): { queue: QueueDataset<T>; value: T } {
  if (queue.items.length === 0) {
    throw new Error('Queue underflow')
  }
  const [value, ...rest] = queue.items
  return { queue: { ...queue, items: rest }, value }
}

export function front<T>(queue: QueueDataset<T>): T | undefined {
  return queue.items[0]
}

export function isEmpty<T>(queue: QueueDataset<T>): boolean {
  return queue.items.length === 0
}

import type { GroupPointer } from '../types'

export function createGroup(
  targets: string[],
  label: string,
  opts?: { color?: string; description?: string },
): GroupPointer {
  return { id: crypto.randomUUID(), type: 'group', targets, label, ...opts }
}

export function addToGroup(group: GroupPointer, target: string): GroupPointer {
  return { ...group, targets: [...group.targets, target] }
}

export function removeFromGroup(group: GroupPointer, target: string): GroupPointer {
  return { ...group, targets: group.targets.filter((t) => t !== target) }
}

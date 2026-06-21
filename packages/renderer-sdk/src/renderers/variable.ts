import { node } from '../helpers'
import type { RendererPlugin, RenderNode } from '../types'

interface VariableEntry {
  name: string
  value: string
  changed?: boolean
}

function isVariableLike(data: unknown): data is VariableEntry[] {
  return (
    Array.isArray(data) &&
    data.every((v) => typeof v === 'object' && v !== null && 'name' in v && 'value' in v)
  )
}

export const VariableRenderer: RendererPlugin = {
  id: 'variable',

  supports(data) {
    return isVariableLike(data)
  },

  render(data) {
    const entries = data as VariableEntry[]

    const varNodes: RenderNode[] = entries.map((v) =>
      node('variable', {
        name: v.name,
        value: v.value,
        changed: v.changed ?? false,
      }),
    )

    return node('variable-panel', { count: entries.length }, varNodes)
  },
}

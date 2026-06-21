import type { RendererPlugin, RenderNode } from '../types'
import { node, text } from '../helpers'

function isArrayLike(data: unknown): data is { values: unknown[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'values' in data &&
    Array.isArray((data as Record<string, unknown>).values)
  )
}

export const ArrayRenderer: RendererPlugin = {
  id: 'array',

  supports(data) {
    return isArrayLike(data)
  },

  render(data, pointers) {
    const { values, highlights, ranges } = data as {
      values: unknown[]
      highlights?: { indices: number[]; variant: string }[]
      ranges?: { start: number; end: number; label?: string; variant?: string }[]
    }

    // Collect point pointers with numeric targets
    const ptrList = Object.values(pointers).filter(
      (p): p is { id: string; target: number; label: string; variant?: string } =>
        typeof p === 'object' &&
        p !== null &&
        'type' in p &&
        (p as Record<string, unknown>).type === 'point' &&
        typeof (p as Record<string, unknown>).target === 'number',
    )

    // Map: index -> pointers[]
    const ptrMap = new Map<number, { id: string; label: string; variant?: string }[]>()
    for (const p of ptrList) {
      const arr = ptrMap.get(p.target) ?? []
      arr.push(p)
      ptrMap.set(p.target, arr)
    }

    // Map: index -> highlight variant
    const hlMap = new Map<number, string>()
    for (const h of highlights ?? []) {
      for (const i of h.indices) hlMap.set(i, h.variant)
    }

    // Build cells
    const cells: RenderNode[] = values.map((val, i) => {
      const cellChildren: RenderNode[] = [text(String(val), { align: 'center' })]

      const ptrs = ptrMap.get(i)
      if (ptrs) {
        cellChildren.push(
          node(
            'pointers',
            {},
            ptrs.map((p) => text(p.label, { variant: p.variant })),
          ),
        )
      }

      return node(
        'cell',
        { index: i, value: val, highlight: hlMap.get(i) },
        cellChildren,
      )
    })

    // Ranges
    const rangeNodes = (ranges ?? []).map((r) =>
      node('range', { start: r.start, end: r.end, label: r.label, variant: r.variant }),
    )

    return node('array', { length: values.length }, [...cells, ...rangeNodes])
  },
}

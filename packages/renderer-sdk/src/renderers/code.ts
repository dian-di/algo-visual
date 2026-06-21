import type { RendererPlugin, RenderNode } from '../types'
import { node, text } from '../helpers'

interface CodeData {
  lines: { line: number; text: string }[]
  activeLines: number[]
}

function isCodeLike(data: unknown): data is CodeData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'lines' in data &&
    'activeLines' in data &&
    Array.isArray((data as Record<string, unknown>).lines) &&
    Array.isArray((data as Record<string, unknown>).activeLines)
  )
}

export const CodeRenderer: RendererPlugin = {
  id: 'code',

  supports(data) {
    return isCodeLike(data)
  },

  render(data) {
    const { lines, activeLines } = data as CodeData
    const activeSet = new Set(activeLines)

    const lineNodes: RenderNode[] = lines.map((l) =>
      node('code-line', {
        line: l.line,
        text: l.text,
        active: activeSet.has(l.line),
      }),
    )

    return node('code', { lineCount: lines.length, activeLines }, lineNodes)
  },
}

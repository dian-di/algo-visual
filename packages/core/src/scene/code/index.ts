/** A single line in a code / pseudocode listing */
export interface CodeLine {
  /** 1-based line number */
  line: number
  text: string
}

/** Scene for displaying algorithm pseudocode with active-line highlighting */
export interface CodeScene {
  title?: string
  lines: CodeLine[]
  /** Currently highlighted line numbers */
  activeLines: number[]
}

export function createCodeScene(lines: CodeLine[], title?: string): CodeScene {
  return { lines: lines.map((l) => ({ ...l })), activeLines: [], title }
}

export function highlightLine(scene: CodeScene, ...lines: number[]): CodeScene {
  return { ...scene, activeLines: lines }
}

import type { Actor, FlowEvent, FlowScene, Message } from '@packages/flow-engine/src'
import { useCallback, useEffect, useRef } from 'react'
import type { FlowRendererProps } from './flow-renderers'

// ---- FlowScene -> Mermaid Sequence Diagram DSL ----

function formatPayload(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  return Object.entries(payload as Record<string, number>)
    .map(([k, v]) => k + '=' + v)
    .join(', ')
}

function messageToLine(m: Message, actors: Actor[]): string {
  const from = actors.find((a) => a.id === m.from)?.name ?? m.from
  const to = actors.find((a) => a.id === m.to)?.name ?? m.to
  const payload = formatPayload(m.payload)
  const label = payload ? m.type + ' (' + payload + ')' : m.type

  switch (m.status) {
    case 'sent':
      return from + '->>' + to + ': ' + label
    case 'delivered':
      return from + '-->>' + to + ': ' + label
    case 'timeout':
      return from + '--x' + to + ': ' + label + ' TIMEOUT'
    default:
      return ''
  }
}

function eventToNote(evt: FlowEvent, actors: Actor[]): string | null {
  const actor = actors.find((a) => a.id === evt.actor)?.name ?? evt.actor
  if (evt.type === 'Crash') return 'Note over ' + actor + ': CRASH'
  if (evt.type === 'Recover') return 'Note over ' + actor + ': RECOVERED'
  return null
}

export function flowSceneToMermaid(scene: FlowScene): string {
  const lines: string[] = ['sequenceDiagram']

  for (const a of scene.actors) {
    lines.push('    participant ' + a.name)
  }

  for (const m of scene.messages) {
    const line = messageToLine(m, scene.actors)
    if (line) lines.push('    ' + line)
  }

  for (const evt of scene.events) {
    const note = eventToNote(evt, scene.actors)
    if (note) lines.push('    ' + note)
  }

  return lines.join('\n')
}

// ---- MermaidSequenceRenderer component ----

let renderSeq = 0

export function MermaidSequenceRenderer({ scene, className }: FlowRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)
  const mermaidRef = useRef<typeof import('mermaid').default | null>(null)

  const renderDiagram = useCallback(async (dsl: string, container: HTMLDivElement) => {
    if (!mermaidRef.current) {
      const mod = await import('mermaid')
      mermaidRef.current = mod.default
      mermaidRef.current.initialize({
        startOnLoad: false,
        theme: 'default',
        sequence: { mirrorActors: false },
      })
    }

    const id = 'mermaid-flow-' + ++renderSeq
    try {
      const { svg } = await mermaidRef.current.render(id, dsl)
      container.innerHTML = svg

      // CSS diff: mark newly added message elements for fade-in
      const messageEls = container.querySelectorAll('[id*="message"], .messageText, .message')
      messageEls.forEach((el, i) => {
        if (i >= prevCountRef.current) {
          el.setAttribute('data-new', '')
        }
      })
      prevCountRef.current = messageEls.length
    } catch {
      // Mermaid can throw on empty/invalid DSL; silently ignore
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const dsl = flowSceneToMermaid(scene)

    // Reset counter on empty scene (seek to frame 0 or backward)
    if (scene.messages.length === 0) {
      prevCountRef.current = 0
    }

    renderDiagram(dsl, container)
  }, [scene, renderDiagram])

  return (
    <>
      <style>{`
        @keyframes mermaid-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        [data-new] {
          animation: mermaid-fade-in 0.3s ease-out forwards;
        }
      `}</style>
      <div ref={containerRef} className={className ?? 'flex justify-center'} />
    </>
  )
}

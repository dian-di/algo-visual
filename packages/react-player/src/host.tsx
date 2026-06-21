import { type CSSProperties, type FC, Fragment } from 'react'
import { type Variant, variantColors } from '../../core/src/types'
import type { RenderNode } from '../../renderer-sdk/src'
import { FlowTree } from './flow-tree'
import { FlowGraph } from './flow-graph'

// ---- Variant style helpers ----

function variantStyle(variant?: string): CSSProperties {
  if (!variant || !(variant in variantColors)) return {}
  const v = variantColors[variant as Variant]
  return { color: v.text, borderColor: v.border, backgroundColor: v.bg }
}

function variantBgStyle(variant?: string): CSSProperties {
  if (!variant || !(variant in variantColors)) return {}
  return { backgroundColor: variantColors[variant as Variant].bg }
}

function variantTextStyle(variant?: string): CSSProperties {
  if (!variant || !(variant in variantColors)) return {}
  return { color: variantColors[variant as Variant].text }
}

// ---- Node type renderers ----

type NodeRenderer = FC<{ node: RenderNode }>

const Host: FC<{ node: RenderNode }> = ({ node }) => {
  const renderer = renderers[node.type] ?? renderers._fallback
  return renderer({ node })
}

const renderText: NodeRenderer = ({ node }) => {
  const { value, align, variant } = (node.props ?? {}) as Record<string, unknown>
  const style: CSSProperties = {
    textAlign: align as CSSProperties['textAlign'],
    ...variantTextStyle(variant as string),
  }
  return <span style={style}>{String(value ?? '')}</span>
}

const renderPointers: NodeRenderer = ({ node }) => (
  <div className='flex justify-center gap-1'>
    {(node.children ?? []).map((child, i) => (
      <Host key={i} node={child} />
    ))}
  </div>
)

const renderCell: NodeRenderer = ({ node }) => {
  const { highlight, variant } = (node.props ?? {}) as Record<string, unknown>
  const hlVariant = (highlight as string) ?? (variant as string)
  const style: CSSProperties = {
    ...variantStyle(hlVariant),
    minWidth: 40,
    minHeight: 40,
  }

  const children = node.children ?? []
  const ptrNodes = children.filter((c) => c.type === 'pointers')
  const valueNodes = children.filter((c) => c.type !== 'pointers')

  return (
    <div className='flex flex-col items-center'>
      {ptrNodes.map((child, i) => (
        <Host key={`p-${i}`} node={child} />
      ))}
      <div className='flex items-center justify-center rounded border px-2 py-1' style={style}>
        {valueNodes.map((child, i) => (
          <Host key={`v-${i}`} node={child} />
        ))}
      </div>
    </div>
  )
}

const renderArray: NodeRenderer = ({ node }) => (
  <div className='flex items-end gap-2'>
    {(node.children ?? []).map((child, i) => (
      <Host key={i} node={child} />
    ))}
  </div>
)

const renderRange: NodeRenderer = ({ node }) => {
  const { label, variant } = (node.props ?? {}) as Record<string, unknown>
  return (
    <div
      className='mt-1 rounded px-2 py-0.5 text-center text-xs'
      style={variantBgStyle(variant as string)}
    >
      {label ? String(label) : ''}
    </div>
  )
}

// ---- Tree: React Flow based ----

const renderTree: NodeRenderer = ({ node }) => {
  return <FlowTree tree={node} />
}

const renderEdge: NodeRenderer = () => <Fragment />

const renderTreeNode: NodeRenderer = ({ node }) => {
  const { value } = (node.props ?? {}) as Record<string, unknown>
  return (
    <div className='flex flex-col items-center'>
      <div
        className='flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold'
        style={{ borderColor: '#2C7D84' }}
      >
        {String(value ?? '')}
      </div>
    </div>
  )
}

// ---- Graph ----

const renderGraphNode: NodeRenderer = ({ node }) => {
  const { label } = (node.props ?? {}) as Record<string, unknown>
  const ptrChildren = (node.children ?? []).filter((c) => c.type === 'pointers')
  const otherChildren = (node.children ?? []).filter((c) => c.type !== 'pointers')
  return (
    <div className='flex flex-col items-center gap-1'>
      {ptrChildren.map((child, i) => (
        <Host key={`p-${i}`} node={child} />
      ))}
      <div
        className='flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold'
        style={{ borderColor: '#B35D35' }}
      >
        {String(label ?? '')}
      </div>
      {otherChildren.map((child, i) => (
        <Host key={`o-${i}`} node={child} />
      ))}
    </div>
  )
}

const renderGraphEdge: NodeRenderer = ({ node }) => {
  const { from, to, weight, active } = (node.props ?? {}) as Record<string, unknown>
  return (
    <span
      className='text-xs'
      style={active ? { color: '#C62828', fontWeight: 600 } : { color: '#888' }}
    >
      {String(from)}
      {String.fromCharCode(8594)}
      {String(to)}
      {weight != null ? ` (${weight})` : ''}
    </span>
  )
}

const renderPath: NodeRenderer = ({ node }) => {
  const { nodes, activeIndex, variant } = (node.props ?? {}) as Record<string, unknown>
  const idx = (activeIndex as number) ?? -1
  return (
    <div className='flex items-center gap-1 text-sm'>
      {(nodes as string[]).map((n, i) => (
        <Fragment key={n}>
          {i > 0 && <span className='text-muted-foreground'>{String.fromCharCode(8594)}</span>}
          <span
            className='rounded px-1.5 py-0.5'
            style={i <= idx ? variantStyle((variant as string) ?? 'primary') : { color: '#aaa' }}
          >
            {n}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

const renderGraph: NodeRenderer = ({ node }) => {
  const paths = (node.children ?? []).filter((c) => c.type === 'path')
  return (
    <div className='space-y-3'>
      <FlowGraph graph={node} />
      {paths.map((child, i) => (
        <Host key={`p-${i}`} node={child} />
      ))}
    </div>
  )
}

// ---- Code ----

const renderCodeLine: NodeRenderer = ({ node }) => {
  const { line, text: codeText, active } = (node.props ?? {}) as Record<string, unknown>
  return (
    <div
      className='flex gap-3 rounded px-2 py-0.5 font-mono text-sm'
      style={active ? { backgroundColor: '#D9EAEC' } : {}}
    >
      <span className='w-6 select-none text-right text-muted-foreground'>{String(line)}</span>
      <span>{String(codeText ?? '')}</span>
    </div>
  )
}

const renderCode: NodeRenderer = ({ node }) => (
  <div className='overflow-auto rounded border bg-muted/30 p-3'>
    {(node.children ?? []).map((child, i) => (
      <Host key={i} node={child} />
    ))}
  </div>
)

// ---- Variables ----

const renderVariable: NodeRenderer = ({ node }) => {
  const { name, value, changed } = (node.props ?? {}) as Record<string, unknown>
  return (
    <div className='flex items-center gap-2 font-mono text-sm'>
      <span className='font-semibold'>{String(name)}</span>
      <span>=</span>
      <span
        className='rounded px-1'
        style={changed ? { backgroundColor: '#FFF3E0', fontWeight: 600 } : {}}
      >
        {String(value)}
      </span>
    </div>
  )
}

const renderVariablePanel: NodeRenderer = ({ node }) => (
  <div className='space-y-1 rounded border p-3'>
    <div className='mb-2 font-medium text-muted-foreground text-xs'>Variables</div>
    {(node.children ?? []).map((child, i) => (
      <Host key={i} node={child} />
    ))}
  </div>
)

// ---- Frame ----

const renderFrame: NodeRenderer = ({ node }) => {
  const { title, message } = (node.props ?? {}) as Record<string, unknown>
  return (
    <div className='space-y-4'>
      {title && <h3 className='font-bold text-lg'>{String(title)}</h3>}
      {message && <p className='text-muted-foreground text-sm'>{String(message)}</p>}
      <div className='space-y-4'>
        {(node.children ?? []).map((child, i) => (
          <Host key={i} node={child} />
        ))}
      </div>
    </div>
  )
}

const renderFallback: NodeRenderer = ({ node }) => (
  <div className='rounded border border-dashed p-2 text-muted-foreground text-xs'>
    [{node.type}]
    {(node.children ?? []).map((child, i) => (
      <Host key={i} node={child} />
    ))}
  </div>
)

const renderers: Record<string, NodeRenderer> = {
  text: renderText,
  pointers: renderPointers,
  cell: renderCell,
  array: renderArray,
  range: renderRange,
  'tree-node': renderTreeNode,
  edge: renderEdge,
  tree: renderTree,
  'graph-node': renderGraphNode,
  'graph-edge': renderGraphEdge,
  path: renderPath,
  graph: renderGraph,
  'code-line': renderCodeLine,
  code: renderCode,
  variable: renderVariable,
  'variable-panel': renderVariablePanel,
  frame: renderFrame,
  _fallback: renderFallback,
}

/**
 * ReactRendererHost — converts a RenderNode tree into React elements.
 */
export function ReactRendererHost({ node, className }: { node: RenderNode; className?: string }) {
  return (
    <div className={className}>
      <Host node={node} />
    </div>
  )
}

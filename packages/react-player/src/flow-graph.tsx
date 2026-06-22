import {
  Background,
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from '@xyflow/react'
import { type CSSProperties, useMemo } from 'react'
import '@xyflow/react/dist/style.css'
import { type Variant, variantColors } from '../../core/src/types'
import type { RenderNode } from '../../renderer-sdk/src'

// ---- Layout constants ----

const NODE_SIZE = 48
const PTR_AREA_H = 28
const EDGE_RADII = 10

// ---- Fruchterman-Reingold force-directed layout ----

function forceLayout(
  nodeIds: string[],
  edges: { from: string; to: string }[],
): Map<string, { x: number; y: number }> {
  const n = nodeIds.length
  if (n === 0) return new Map()
  if (n === 1) return new Map([[nodeIds[0], { x: 0, y: 0 }]])

  const pos = new Map<string, { x: number; y: number }>()
  const disp = new Map<string, { x: number; y: number }>()

  // Grid initial placement gives the layout a structured starting point
  const cols = Math.ceil(Math.sqrt(n))
  const cellW = 140
  const cellH = 120
  nodeIds.forEach((id, i) => {
    pos.set(id, {
      x: (i % cols) * cellW,
      y: Math.floor(i / cols) * cellH,
    })
    disp.set(id, { x: 0, y: 0 })
  })

  // Ideal spring length scales with canvas area
  const rows = Math.ceil(n / cols)
  const k = Math.sqrt((cols * cellW * (rows * cellH)) / n) * 1.15

  const ITERS = 100
  for (let iter = 0; iter < ITERS; iter++) {
    // Temperature cools linearly large moves early, fine-tuning late
    const temp = k * 0.5 * (1 - iter / ITERS)

    // Reset displacements
    for (const id of nodeIds) {
      const d = disp.get(id)!
      d.x = 0
      d.y = 0
    }

    // Repulsive forces between every pair
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos.get(nodeIds[i])!
        const b = pos.get(nodeIds[j])!
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
        const force = (k * k) / dist
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        const di = disp.get(nodeIds[i])!
        const dj = disp.get(nodeIds[j])!
        di.x += fx
        di.y += fy
        dj.x -= fx
        dj.y -= fy
      }
    }

    // Attractive forces along edges
    for (const e of edges) {
      const a = pos.get(e.from)
      const b = pos.get(e.to)
      if (!a || !b) continue
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.1
      const force = (dist * dist) / k
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      const df = disp.get(e.from)!
      const dt = disp.get(e.to)!
      df.x -= fx
      df.y -= fy
      dt.x += fx
      dt.y += fy
    }

    // Apply displacement clamped by temperature
    for (const id of nodeIds) {
      const p = pos.get(id)!
      const d = disp.get(id)!
      const dlen = Math.sqrt(d.x * d.x + d.y * d.y) || 0.1
      const scale = Math.min(dlen, temp) / dlen
      p.x += d.x * scale
      p.y += d.y * scale
    }
  }

  // Shift so all positions are positive with padding
  let minX = Infinity
  let minY = Infinity
  for (const p of pos.values()) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
  }
  const pad = NODE_SIZE * 1.5
  for (const p of pos.values()) {
    p.x += pad - minX
    p.y += pad - minY
  }

  return pos
}

// ---- Custom node component ----

interface GraphNodeData extends Record<string, unknown> {
  label: string
  pointers?: { label: string; variant?: string }[]
  variant?: string
}

function GraphNodeComponent({ data }: NodeProps<Node<GraphNodeData>>) {
  const { label, pointers, variant } = data
  const highlighted = variant && variant in variantColors
  const borderColor = highlighted ? variantColors[variant as Variant].border : '#94a3b8'
  const bgColor = highlighted ? variantColors[variant as Variant].bg : '#ffffff'

  return (
    <div className='flex flex-col items-center'>
      <Handle type='target' position={Position.Top} className='!invisible' />
      <div className='relative' style={{ height: pointers?.length ? PTR_AREA_H : 0 }}>
        {pointers && pointers.length > 0 && (
          <div className='absolute left-1/2 flex -translate-x-1/2 gap-1'>
            {pointers.map((p, i) => {
              const vStyle: CSSProperties =
                p.variant && p.variant in variantColors
                  ? { color: variantColors[p.variant as Variant].text }
                  : {}
              return (
                <span
                  key={i}
                  className='rounded px-1.5 py-0.5 font-medium text-xs'
                  style={{ ...vStyle, backgroundColor: '#f0f0f0' }}
                >
                  {p.label}
                </span>
              )
            })}
          </div>
        )}
      </div>
      <div
        className='z-10 flex items-center justify-center rounded-full border-2 font-semibold shadow-sm'
        style={{ width: NODE_SIZE, height: NODE_SIZE, borderColor, backgroundColor: bgColor }}
      >
        {String(label ?? '')}
      </div>
      <Handle type='source' position={Position.Bottom} className='!invisible' />
    </div>
  )
}

// ---- Custom edge with weight label ----

function WeightedEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, data, markerEnd } = props
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    borderRadius: EDGE_RADII,
  })

  const active = data?.active as boolean | undefined
  const weight = data?.weight as number | undefined

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: active ? '#C62828' : '#94a3b8',
          strokeWidth: active ? 2.5 : 1.5,
        }}
      />
      {weight != null && (
        <EdgeLabelRenderer>
          <div
            className='pointer-events-none rounded-full px-1.5 py-0.5 font-medium text-xs'
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color: active ? '#C62828' : '#64748b',
              backgroundColor: '#fff',
              border: `1px solid ${active ? '#C62828' : '#e2e8f0'}`,
            }}
          >
            {String(weight)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = { graphNode: GraphNodeComponent }
const edgeTypes = { weighted: WeightedEdge }

// ---- Public component ----

export interface FlowGraphProps {
  graph: RenderNode
  className?: string
}

export function FlowGraph({ graph, className }: FlowGraphProps) {
  const { rfNodes, rfEdges, width, height } = useMemo(() => {
    const children = graph.children ?? []
    const gNodes = children.filter((c) => c.type === 'graph-node')
    const gEdges = children.filter((c) => c.type === 'graph-edge')

    // Parse nodes
    const nodeIds: string[] = []
    const nodeMap = new Map<
      string,
      { label: string; pointers?: { label: string; variant?: string }[]; variant?: string }
    >()

    for (const gn of gNodes) {
      const p = (gn.props ?? {}) as Record<string, unknown>
      const id = p.id as string
      const ptrs = (gn.children ?? [])
        .filter((c) => c.type === 'pointers')
        .flatMap((c) => c.children ?? [])
        .map((c) => ({
          label: String(((c.props ?? {}) as Record<string, unknown>).value ?? ''),
          variant: ((c.props ?? {}) as Record<string, unknown>).variant as string | undefined,
        }))

      nodeIds.push(id)
      nodeMap.set(id, {
        label: String(p.label ?? ''),
        pointers: ptrs.length > 0 ? ptrs : undefined,
        variant: p.variant as string | undefined,
      })
    }

    // Parse edges
    const edgeData = gEdges.map((ge) => {
      const p = (ge.props ?? {}) as Record<string, unknown>
      return {
        from: p.from as string,
        to: p.to as string,
        weight: p.weight as number | undefined,
        active: p.active as boolean | undefined,
        directed: p.directed as boolean | undefined,
      }
    })

    // Layout
    const positions = forceLayout(nodeIds, edgeData)

    // Build React Flow nodes
    const rfNodes: Node<GraphNodeData>[] = nodeIds.map((id) => {
      const nd = nodeMap.get(id)!
      const p = positions.get(id)!
      return {
        id,
        type: 'graphNode',
        position: { x: p.x, y: p.y },
        data: { label: nd.label, pointers: nd.pointers, variant: nd.variant },
      }
    })

    // Build React Flow edges
    const rfEdges: Edge[] = edgeData.map((e, i) => ({
      id: `e-${i}`,
      source: e.from,
      target: e.to,
      type: 'weighted',
      data: { weight: e.weight, active: e.active },
      ...(e.directed
        ? { markerEnd: { type: 'arrowclosed' as const, color: '#94a3b8', width: 16, height: 16 } }
        : {}),
    }))

    // Compute canvas size with padding
    let maxX = 0
    let maxY = 0
    for (const p of positions.values()) {
      maxX = Math.max(maxX, p.x + NODE_SIZE)
      maxY = Math.max(maxY, p.y + NODE_SIZE + PTR_AREA_H)
    }

    return {
      rfNodes,
      rfEdges,
      width: maxX + NODE_SIZE,
      height: maxY + NODE_SIZE,
    }
  }, [graph])

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1 }), [])

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        fitView={false}
        draggable={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
      </ReactFlow>
    </div>
  )
}

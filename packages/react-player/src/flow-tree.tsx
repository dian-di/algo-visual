import {
  Background,
  type Edge,
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

const NODE_W = 48
const NODE_H = 48
const H_GAP = 32
const V_GAP = 72
const PTR_AREA_H = 28

// ---- Custom tree-node React Flow component ----

interface TreeNodeData extends Record<string, unknown> {
  value: string
  label?: string
  pointers?: { label: string; variant?: string }[]
}

function TreeNodeComponent({ data }: NodeProps<Node<TreeNodeData>>) {
  const { value, pointers } = data
  const borderColor = '#2C7D84'

  return (
    <div className='flex flex-col items-center'>
      <Handle type='target' position={Position.Top} className='!invisible' />

      {/* Pointer labels — fixed height, never shifts the node */}
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

      {/* Node circle */}
      <div
        className='z-10 flex items-center justify-center rounded-full border-2 bg-white font-semibold shadow-sm'
        style={{ width: NODE_W, height: NODE_H, borderColor }}
      >
        {String(value ?? '')}
      </div>

      <Handle type='source' position={Position.Bottom} className='!invisible' />
    </div>
  )
}

const nodeTypes = { treeNode: TreeNodeComponent }

// ---- Recursive layout ----

interface FlatTreeNode {
  id: string
  value: string
  left?: string
  right?: string
  pointers?: { label: string; variant?: string }[]
}

function getSubtreeWidth(id: string, map: Map<string, FlatTreeNode>): number {
  const n = map.get(id)
  if (!n) return NODE_W
  const lw = n.left ? getSubtreeWidth(n.left, map) : 0
  const rw = n.right ? getSubtreeWidth(n.right, map) : 0
  if (!lw && !rw) return NODE_W
  return lw + rw + (lw && rw ? H_GAP : 0)
}

function positionNodes(
  id: string,
  x: number,
  y: number,
  map: Map<string, FlatTreeNode>,
): { id: string; x: number; y: number }[] {
  const n = map.get(id)
  if (!n) return []
  const w = getSubtreeWidth(id, map)
  const lw = n.left ? getSubtreeWidth(n.left, map) : 0

  const result: { id: string; x: number; y: number }[] = [{ id, x: x + w / 2 - NODE_W / 2, y }]

  if (n.left) {
    result.push(...positionNodes(n.left, x, y + NODE_H + V_GAP, map))
  }
  if (n.right) {
    result.push(...positionNodes(n.right, x + lw + H_GAP, y + NODE_H + V_GAP, map))
  }
  return result
}

// ---- Public component: FlowTree ----

export interface FlowTreeProps {
  /** The 'tree' RenderNode from the renderer-sdk */
  tree: RenderNode
  className?: string
}

/**
 * FlowTree — renders a binary tree using React Flow.
 *
 * Accepts a 'tree' RenderNode (from TreeRenderer) with tree-node children,
 * builds the hierarchy, lays out nodes, and renders with proper edges.
 */
export function FlowTree({ tree, className }: FlowTreeProps) {
  const {
    nodes: rfNodes,
    edges: rfEdges,
    height,
  } = useMemo(() => {
    const children = tree.children ?? []
    const treeNodes = children.filter((c) => c.type === 'tree-node')

    if (treeNodes.length === 0) {
      return { nodes: [] as Node<TreeNodeData>[], edges: [] as Edge[], height: 100 }
    }

    // Parse flat list into map
    const flatMap = new Map<string, FlatTreeNode>()
    const childIds = new Set<string>()

    for (const tn of treeNodes) {
      const p = (tn.props ?? {}) as Record<string, unknown>
      const id = p.id as string
      const ptrs = (tn.children ?? [])
        .filter((c) => c.type === 'pointers')
        .flatMap((c) => c.children ?? [])
        .map((c) => ({
          label: String(((c.props ?? {}) as Record<string, unknown>).value ?? ''),
          variant: ((c.props ?? {}) as Record<string, unknown>).variant as string | undefined,
        }))

      flatMap.set(id, {
        id,
        value: String(p.value ?? ''),
        left: p.left as string | undefined,
        right: p.right as string | undefined,
        pointers: ptrs.length > 0 ? ptrs : undefined,
      })
      if (p.left) childIds.add(p.left as string)
      if (p.right) childIds.add(p.right as string)
    }

    // Find root
    const rootId = treeNodes
      .map((tn) => ((tn.props ?? {}) as Record<string, unknown>).id as string)
      .find((id) => !childIds.has(id))

    if (!rootId) {
      return { nodes: [] as Node<TreeNodeData>[], edges: [] as Edge[], height: 100 }
    }

    // Layout
    const positions = positionNodes(rootId, 0, PTR_AREA_H, flatMap)

    // Build React Flow nodes
    const rfNodes: Node<TreeNodeData>[] = positions.map((pos) => {
      const ft = flatMap.get(pos.id)!
      return {
        id: ft.id,
        type: 'treeNode',
        position: { x: pos.x, y: pos.y },
        data: { value: ft.value, pointers: ft.pointers },
      }
    })

    // Build React Flow edges
    const rfEdges: Edge[] = []
    for (const ft of flatMap.values()) {
      if (ft.left && flatMap.has(ft.left)) {
        rfEdges.push({
          id: `${ft.id}-${ft.left}`,
          source: ft.id,
          target: ft.left,
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        })
      }
      if (ft.right && flatMap.has(ft.right)) {
        rfEdges.push({
          id: `${ft.id}-${ft.right}`,
          source: ft.id,
          target: ft.right,
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        })
      }
    }

    // Calculate total height
    const maxY = Math.max(...positions.map((p) => p.y))
    const height = maxY + NODE_H + PTR_AREA_H + 20

    return { nodes: rfNodes, edges: rfEdges, height }
  }, [tree])

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1 }), [])

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
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

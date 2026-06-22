import {
  Background,
  Handle,
  type Edge,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from '@xyflow/react'
import { useMemo } from 'react'
import '@xyflow/react/dist/style.css'
import type { Actor, Message, MessageStatus } from '@packages/flow-engine/src'
import type { FlowRendererProps } from './flow-renderers'

// ---- Layout constants ----
const NODE_GAP = 340
const NODE_WIDTH = 140
const NODE_HEIGHT = 72
const HANDLE_GAP = 52
const HANDLE_START = 20

// ---- Custom Actor Node ----

function ActorNode({ data }: NodeProps) {
  const { name, actorType, crashed, handleCount } = data as {
    name: string
    actorType: string
    crashed: boolean
    handleCount: number
  }

  const count = Math.max(handleCount, 1)
  const totalHeight = HANDLE_START + (count - 1) * HANDLE_GAP + NODE_HEIGHT

  return (
    <div style={{ position: 'relative', width: NODE_WIDTH, height: totalHeight }}>
      {/* target handles (left edge) */}
      {Array.from({ length: count }, (_, i) => (
        <Handle
          key={'t-' + i}
          type='target'
          id={'t-' + i}
          position={Position.Left}
          style={{ top: HANDLE_START + i * HANDLE_GAP }}
        />
      ))}

      {/* node box -- centered */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: NODE_WIDTH - 8,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: crashed ? '#EF5350' : '#2C7D84',
            backgroundColor: crashed ? '#FFEBEE' : '#D9EAEC',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {name}
        </div>
        <span style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{actorType}</span>
      </div>

      {/* source handles (right edge) */}
      {Array.from({ length: count }, (_, i) => (
        <Handle
          key={'s-' + i}
          type='source'
          id={'s-' + i}
          position={Position.Right}
          style={{ top: HANDLE_START + i * HANDLE_GAP }}
        />
      ))}
    </div>
  )
}

const nodeTypes = { actor: ActorNode }

// ---- Edge styling ----

function edgeVisual(status: MessageStatus) {
  switch (status) {
    case 'sent':     return { stroke: '#2C7D84', dash: undefined as string | undefined }
    case 'delivered': return { stroke: '#4CAF50', dash: undefined }
    case 'timeout':  return { stroke: '#EF5350', dash: '6 4' }
    default:         return { stroke: '#999',    dash: undefined }
  }
}

function formatPayload(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  return Object.entries(payload as Record<string, number>)
    .map(([k, v]) => k + '=' + v)
    .join(', ')
}

// ---- FlowScene -> React Flow ----

function sceneToFlow(actors: Actor[], messages: Message[]) {
  const active = messages.filter(
    (m) => m.status === 'sent' || m.status === 'delivered' || m.status === 'timeout',
  )
  const handleCount = active.length

  const nodes: Node[] = actors.map((a, i) => ({
    id: a.id,
    type: 'actor',
    position: { x: i * NODE_GAP, y: 0 },
    data: { name: a.name, actorType: a.type, crashed: false, handleCount },
    style: { width: NODE_WIDTH },
  }))

  const edges: Edge[] = active.map((m, i) => {
    const vis = edgeVisual(m.status)
    const payload = formatPayload(m.payload)
    const label = payload ? m.type + ' (' + payload + ')' : m.type

    return {
      id: m.id ?? 'edge-' + i,
      source: m.from,
      sourceHandle: 's-' + i,
      target: m.to,
      targetHandle: 't-' + i,
      label,
      animated: m.status === 'sent',
      style: { stroke: vis.stroke, strokeWidth: 2, strokeDasharray: vis.dash },
      labelStyle: { fill: vis.stroke, fontWeight: 600, fontSize: 12 },
      labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: vis.stroke,
        width: 18,
        height: 18,
      },
    }
  })

  return { nodes, edges }
}

// ---- FlowCanvas ----

export function FlowCanvas({ scene, className }: FlowRendererProps) {
  const { nodes, edges } = useMemo(
    () => sceneToFlow(scene.actors, scene.messages),
    [scene.actors, scene.messages],
  )

  return (
    <div className={className ?? 'h-80 w-full'}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
      </ReactFlow>
    </div>
  )
}

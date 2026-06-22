import { FlowBuilder } from '@packages/flow-engine/src'
import { PlaybackController } from '@packages/timeline/src'
import { FlowPlayer } from '../FlowPlayer'
import { FlowRendererRegistry } from '../flow-renderers'
import { MermaidSequenceRenderer } from '../MermaidSequenceRenderer'

function buildHandshake() {
  const b = new FlowBuilder()

  const client = b.actor('Client', 'endpoint', 'client')
  const server = b.actor('Server', 'endpoint', 'server')

  b.snapshot({ title: 'Initial', message: 'Client and Server are ready' })

  const syn = b.message('SYN', client.id, server.id, { seq: 100 })
  b.send(syn, client)
  b.snapshot({ title: 'SYN', message: 'Client sends SYN (seq=100) to Server' })

  const synAck = b.message('SYN-ACK', server.id, client.id, { seq: 300, ack: 101 })
  b.send(synAck, server)
  b.snapshot({ title: 'SYN-ACK', message: 'Server replies SYN-ACK (seq=300, ack=101)' })

  const ack = b.message('ACK', client.id, server.id, { ack: 301 })
  b.send(ack, client)
  b.snapshot({ title: 'ACK', message: 'Client sends ACK (ack=301) to Server' })

  b.receive(ack, server)
  b.snapshot({ title: 'Connected', message: 'TCP connection established' })

  return b.build()
}

const registry = new FlowRendererRegistry()
registry.register('mermaid', MermaidSequenceRenderer)

const controller = new PlaybackController(buildHandshake())

export default function MermaidShake() {
  return (
    <FlowPlayer
      controller={controller}
      registry={registry}
      renderer='mermaid'
      className='mx-auto max-w-lg space-y-4 p-4'
      header={(snap) => (
        <div>
          <h2 className='font-bold text-lg'>TCP 3-Way Handshake (Mermaid)</h2>
          {snap.frame.title && (
            <h3 className='mt-1 font-semibold text-primary text-sm'>{snap.frame.title}</h3>
          )}
          {snap.frame.message && (
            <p className='text-muted-foreground text-sm'>{snap.frame.message}</p>
          )}
        </div>
      )}
    />
  )
}

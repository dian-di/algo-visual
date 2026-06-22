import type { Frame } from '../../timeline/src'
import { Timeline } from '../../timeline/src'
import type {
  Actor,
  FlowEvent,
  FlowEventType,
  FlowScene,
  FlowSnapshotOptions,
  Message,
  MessageStatus,
} from './types'

let actorSeq = 0
let messageSeq = 0
let eventSeq = 0

// ---- Factory helpers ----

export function createActor(name: string, type: string, id?: string): Actor {
  return { id: id ?? `actor-${++actorSeq}`, name, type }
}

export function createMessage(
  type: string,
  from: string,
  to: string,
  payload?: unknown,
  id?: string,
): Message {
  return { id: id ?? `msg-${++messageSeq}`, type, from, to, status: 'pending', payload }
}

export function createFlowEvent(
  actor: string,
  type: FlowEventType,
  message?: string,
  id?: string,
): FlowEvent {
  return { id: id ?? `evt-${++eventSeq}`, actor, type, message }
}

// ---- FlowBuilder ----

/**
 * FlowBuilder -- the single entry-point for flow/message-flow developers.
 *
 * Usage:
 *   const b = new FlowBuilder()
 *   const browser = b.actor('Browser', 'client')
 *   const server  = b.actor('OAuthServer', 'server')
 *   const msg = b.message('Auth Request', browser.id, server.id)
 *   b.send(msg, browser)
 *   b.receive(msg, server)
 *   b.snapshot({ title: 'Auth Flow' })
 *
 *   const timeline = b.build()
 */
export class FlowBuilder {
  private readonly actors = new Map<string, Actor>()
  private readonly messages = new Map<string, Message>()
  private readonly events: FlowEvent[] = []
  private readonly frames: Frame<FlowScene>[] = []
  private inTransaction = false

  // ---- actor ----

  /** Register an actor (or return existing one with same id) */
  actor(name: string, type: string, id?: string): Actor {
    const a = createActor(name, type, id)
    this.actors.set(a.id, a)
    return a
  }

  /** Get a registered actor by id */
  getActor(id: string): Actor | undefined {
    return this.actors.get(id)
  }

  // ---- message ----

  /** Register a message (status starts as pending) */
  message(type: string, from: string, to: string, payload?: unknown, id?: string): Message {
    const m = createMessage(type, from, to, payload, id)
    this.messages.set(m.id, { ...m })
    return m
  }

  /** Get a registered message by id */
  getMessage(id: string): Message | undefined {
    return this.messages.get(id)
  }

  // ---- event helpers ----

  /** Push a flow event and optionally update the referenced message status */
  private pushEvent(
    actorId: string,
    type: FlowEventType,
    messageId?: string,
    messageStatus?: MessageStatus,
  ): void {
    this.events.push(createFlowEvent(actorId, type, messageId))

    if (messageId && messageStatus) {
      const msg = this.messages.get(messageId)
      if (msg) {
        this.messages.set(messageId, { ...msg, status: messageStatus })
      }
    }
  }

  // ---- send / receive / timeout ----

  /** Actor sends a message */
  send(message: Message, sender: Actor): this {
    this.pushEvent(sender.id, 'Send', message.id, 'sent')
    return this
  }

  /** Actor receives a message */
  receive(message: Message, receiver: Actor): this {
    this.pushEvent(receiver.id, 'Receive', message.id, 'delivered')
    return this
  }

  /** Message times out */
  timeout(message: Message, actor: Actor): this {
    this.pushEvent(actor.id, 'Timeout', message.id, 'timeout')
    return this
  }

  /** Actor retries sending a message */
  retry(message: Message, actor: Actor): this {
    this.pushEvent(actor.id, 'Retry', message.id, 'sent')
    return this
  }

  /** Actor crashes */
  crash(actor: Actor): this {
    this.pushEvent(actor.id, 'Crash')
    return this
  }

  /** Actor recovers */
  recover(actor: Actor): this {
    this.pushEvent(actor.id, 'Recover')
    return this
  }

  // ---- generic event ----

  /** Push a generic flow event */
  event(actorId: string, type: FlowEventType, messageId?: string): this {
    this.pushEvent(actorId, type, messageId)
    return this
  }

  // ---- snapshot ----

  /** Capture the current state as a new Frame */
  snapshot(opts?: FlowSnapshotOptions): this {
    if (this.inTransaction) return this

    const scene: FlowScene = {
      actors: Array.from(this.actors.values()),
      messages: Array.from(this.messages.values()).map((m) => ({ ...m })),
      events: this.events.map((e) => ({ ...e })),
    }

    this.frames.push({
      id: crypto.randomUUID(),
      scene,
      title: opts?.title,
      message: opts?.message,
      tag: opts?.tag,
      duration: opts?.duration,
    })

    return this
  }

  // ---- transaction ----

  /** Run multiple mutations, only produce one Frame at the end */
  transaction(fn: () => void, opts?: FlowSnapshotOptions): this {
    this.inTransaction = true
    try {
      fn()
    } finally {
      this.inTransaction = false
    }
    return this.snapshot(opts)
  }

  // ---- build ----

  /** Produce a Timeline from all collected frames */
  build(): Timeline<FlowScene> {
    if (this.frames.length === 0) {
      throw new Error('FlowBuilder.build(): no frames — call snapshot() at least once')
    }
    const timeline = new Timeline<FlowScene>()
    timeline.append(...this.frames)
    return timeline
  }

  /** Reset the builder for reuse */
  reset(): this {
    this.frames.length = 0
    return this
  }
}

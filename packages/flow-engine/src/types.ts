// ---- Actor ----

/** 参与者。每个参与通信的实体都是一个 Actor。 */
export interface Actor {
  id: string
  name: string
  type: string
}

// ---- Message ----

/** 消息状态 */
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'timeout'

/** 核心通信对象。每条消息标识了谁发给谁、携带了什么。 */
export interface Message {
  id: string
  type: string
  from: string   // Actor.id
  to: string     // Actor.id
  status: MessageStatus
  payload?: unknown
}

// ---- FlowEvent ----

/** 标准事件类型 */
export type FlowEventType = 'Send' | 'Receive' | 'Timeout' | 'Retry' | 'Crash' | 'Recover'

/** 某一时刻发生的瞬时事件，描述 Actor 或 Message 的状态变化。 */
export interface FlowEvent {
  id: string
  actor: string          // Actor.id
  type: FlowEventType
  message?: string       // Message.id（可选关联）
}

// ---- FlowScene ----

/** Flow Engine 专用的 Scene 类型 */
export interface FlowScene {
  actors: Actor[]
  messages: Message[]
  events: FlowEvent[]
}

// ---- Snapshot options ----

export interface FlowSnapshotOptions {
  title?: string
  message?: string
  tag?: string
  duration?: number
}

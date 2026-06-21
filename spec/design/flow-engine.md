# Flow Engine

## 设计目标

Flow Engine 回答一个问题：**消息如何流动**。

覆盖的场景类型：

| 场景 | 典型消息流 |
|------|-----------|
| OAuth | Browser → Client → OAuthServer → ResourceServer |
| TCP | SYN / ACK / FIN |
| Kafka | Producer → Broker → Consumer |
| Raft | AppendEntries / VoteRequest |
| MicroService | Request → Service A → Service B → Response |
| Saga | Command → Event → Compensate |

它们的共性：**Message Flow** —— 围绕 Actor、Message、Event 三个核心概念展开设计。

---

## 核心概念

```
┌─────────────────────────────────────┐
│              FlowScene              │
│                                     │
│   actors: Actor[]                   │
│   messages: Message[]               │
│   events: FlowEvent[]              │
└─────────────────────────────────────┘
```

### Actor

参与者。每个参与通信的实体都是一个 Actor。

**领域映射：**

| 领域 | Actor 列表 |
|------|-----------|
| OAuth | Browser, Client, OAuthServer, ResourceServer |
| TCP | Client, Server |
| Raft | Leader, Follower1, Follower2 |

**统一接口：**

```ts
interface Actor {
  id: string
  name: string
  type: string
}
```

### Message

核心通信对象。每条消息标识了 **谁发给谁、携带了什么**。

**领域映射：**

| 领域 | 消息类型 |
|------|---------|
| OAuth | Authorization Request, Authorization Code, Access Token |
| TCP | SYN, ACK, FIN |
| Raft | AppendEntries, VoteRequest |

**统一接口：**

```ts
interface Message {
  id: string
  type: string
  from: string   // Actor.id
  to: string     // Actor.id
  payload?: unknown
}
```

### Event

某一时刻发生的瞬时事件，描述 Actor 或 Message 的状态变化。

```ts
interface FlowEvent {
  id: string
  actor: string    // Actor.id
  type: string
  message?: string // Message.id（可选关联）
}
```

**标准事件类型：**

| 事件 | 语义 |
|------|------|
| `Send` | Actor 发出消息 |
| `Receive` | Actor 收到消息 |
| `Timeout` | 等待超时 |
| `Retry` | 重试发送 |
| `Crash` | Actor 崩溃 |
| `Recover` | Actor 恢复 |

---

## FlowScene

Flow Engine 有自己专用的 Scene 类型，不复用 `ArrayScene` 或 `TreeScene`：

```ts
interface FlowScene {
  actors: Actor[]
  messages: Message[]
  events: FlowEvent[]
}
```

> **与 AlgoScene 的区别：** AlgoScene 描述数据结构的快照状态（数组、树、图），FlowScene 描述参与者之间的消息流动。

---

## 示例：OAuth 授权流程

下图展示一个标准 OAuth Authorization Code 流程的帧序列：

```
Frame 0 ─ 初始状态
┌────────┐  ┌────────┐  ┌─────────────┐
│ Browser│  │ Client │  │ OAuthServer │
└────────┘  └────────┘  └─────────────┘

Frame 1 ─ Browser 发起授权请求
┌────────┐  Auth Request   ┌─────────────┐
│ Browser│ ───────────────▶│ OAuthServer │
└────────┘                 └─────────────┘

Frame 2 ─ OAuthServer 返回授权码
┌─────────────┐  Code     ┌────────┐
│ OAuthServer │ ─────────▶│ Browser│
└─────────────┘           └────────┘

Frame 3 ─ Browser 将授权码转给 Client
┌────────┐  Code      ┌────────┐
│ Browser│ ──────────▶│ Client │
└────────┘            └────────┘

Frame 4 ─ Client 用授权码换取 Token
┌────────┐  Code Exchange  ┌─────────────┐
│ Client │ ───────────────▶│ OAuthServer │
└────────┘                 └─────────────┘

Frame 5 ─ OAuthServer 下发 Access Token
┌─────────────┐  Access Token  ┌────────┐
│ OAuthServer │ ──────────────▶│ Client │
└─────────────┘                └────────┘
```

对应的 Timeline：

```ts
const timeline: Timeline = {
  frames: [frame0, frame1, frame2, frame3, frame4, frame5]
}
```

---

## 渲染相关信息

FlowScene 的渲染由 **CompositeRenderer** 统一处理，Flow Engine 本身不涉及任何渲染逻辑。

| 关注点 | 负责方 |
|--------|--------|
| Actor 的位置与布局 | Layout / CompositeRenderer |
| 消息箭头的绘制 | FlowRenderer（Renderer Plugin） |
| 事件的视觉反馈 | FlowRenderer |
| 帧的时序播放 | Playback / Timeline |

> Flow Engine 的唯一职责是生成 `Frame[]`，交给 Timeline 后，渲染完全由 Renderer 层接管。

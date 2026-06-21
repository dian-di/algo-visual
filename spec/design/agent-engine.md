# Agent Engine

## 设计目标

Agent 不是状态变化（Algo Engine），也不是消息流（Flow Engine）。

Agent 是**认知过程**。

因此 Agent Engine 的核心任务：**把 Thinking 变成 `Frame[]`**。

```
┌──────────────┐
│   Thinking   │
│      ↓       │
│   Frame[]    │
└──────────────┘
```

---

## 核心抽象

经过对主流 Agent 框架的观察：

- LangGraph
- CrewAI
- AutoGPT
- OpenAI Agent
- Claude Code

最终统一为四个核心类型：

### Thought

表示一次思考。

```ts
interface Thought {
  id: string
  content: string
}
```

> 例如："我需要先搜索文档"

### ToolCall

表示一次工具调用。

```ts
interface ToolCall {
  id: string
  tool: string
  args: unknown
}
```

> 例如：`Search("React Query")`

### Observation

表示工具返回的结果。

```ts
interface Observation {
  id: string
  content: string
}
```

> 例如："发现官方文档"

### Answer

最终回答。

```ts
interface Answer {
  content: string
}
```

---

## AgentState & AgentScene

```ts
interface AgentState {
  thoughts: Thought[]
  toolCalls: ToolCall[]
  observations: Observation[]
}

interface AgentScene {
  state: AgentState
}
```

---

## 示例：ReAct 循环

```
Frame 0 ─ 提出问题
  Question: "..."

Frame 1 ─ 思考
  Thought: "需要搜索"

Frame 2 ─ 工具调用
  ToolCall: Search()

Frame 3 ─ 观察结果
  Observation: "发现结果"

Frame 4 ─ 再次思考
  Thought: "已经足够回答"

Frame 5 ─ 最终回答
  Answer: "..."
```

对应的 Timeline：

```ts
const timeline: Timeline = {
  frames: [frame0, frame1, frame2, frame3, frame4, frame5]
}
```

---

## Multi-Agent（未来）

必须支持多 Agent 协作。

```ts
interface Agent {
  id: string
  name: string
}
```

典型角色：

- **Planner** — 规划任务
- **Researcher** — 搜索资料
- **Coder** — 编写代码
- **Reviewer** — 审查结果

Agent 之间通过 **Message** 通信，此时 Agent Engine 与 Flow Engine 开始融合。

---

## 渲染相关信息

### Agent 专用渲染器

| 渲染器 | 职责 |
|--------|------|
| `ThoughtRenderer` | 渲染思考过程 |
| `ToolRenderer` | 渲染工具调用 |
| `ObservationRenderer` | 渲染观察结果 |
| `AnswerRenderer` | 渲染最终回答 |

### Agent Timeline 渲染

这是最关键的渲染器。展示完整的认知链路：

```
Thought → ToolCall → Observation → Thought → Answer
```

类似 LangSmith Trace，但完全 Timeline 化。

### 典型 Agent Composite 布局

```
┌────────────────────────┐
│ Thought Timeline       │
├────────────────────────┤
│ Tool Calls             │
├────────────────────────┤
│ Observations           │
├────────────────────────┤
│ Variables              │
└────────────────────────┘
```

# Timeline

## 设计目标

Timeline 是整个系统唯一的**一等公民**。

所有 Engine 最终输出都是 `Frame[]`：

- Algo Engine → `Frame[]`
- Flow Engine → `Frame[]`
- Agent Engine → `Frame[]`

Timeline 只负责存储 Frame，不负责播放、暂停、渲染或布局。

---

## Timeline 定义

```ts
interface Timeline {
  id: string
  frames: Frame[]
}
```

---

## 不变量（Invariants）

### Rule 1：帧顺序不可变

```ts
// ✓ 允许
[frame0, frame1, frame2]

// ✗ 禁止
swap(frame0, frame2)
```

原因：Timeline 表示历史，历史不可修改。

### Rule 2：Frame 只增不改

```ts
// ✓ 允许
timeline.append(frame)

// ✗ 禁止
frame.store.x = 123   // Frame 不可变
```

### Rule 3：Frame ID 全局唯一

每个 `frame.id` 必须全局唯一，推荐使用 UUID。

---

## Cursor

Timeline 不知道当前播放到哪里，Cursor 独立管理：

```ts
interface TimelineCursor {
  index: number
}
```

```
Timeline: [f0, f1, f2, f3]
                  ↑
            cursor.index = 2
            当前: f2
```

---

## Seek

核心能力：`seek(index)`

时间复杂度：**O(1)**

这是 Frame Model 相比 Command Model 最大的优势：

| 模型 | Seek 复杂度 | 结论 |
|------|------------|------|
| Frame Model | O(1) | ✓ 可用 |
| Command Model | O(N) | ✗ 直接废掉 |

---

## Checkpoint & Diff Timeline（未来优化）

```
Frame 0 — 完整快照
Frame 1 — 只存变化（diff）
Frame 2 — 只存变化（diff）

恢复: Checkpoint + Diff
```

---

## Timeline Branch（暂不实现）

暂不实现，未来为以下场景保留：

- Backtracking
- Beam Search
- MCTS

```ts
interface TimelineBranch {
  parent: string
  children: string[]
}
```

---

## Timeline Event

Timeline 支持事件，供 UI 监听：

```ts
interface TimelineEvent {
  type: "append" | "seek"
}
```

---

## Timeline Builder

统一的构建接口：

```ts
timeline.append(frame)
timeline.at(index)
timeline.length
```

---

## 序列化

```ts
// 100% JSON Compatible
{ frames: [...] }
```

禁止：Function、Class、DOM。

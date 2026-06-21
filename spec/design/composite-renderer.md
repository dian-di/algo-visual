# Composite Renderer

## 设计目标

真正的算法教学从来不是一个 Renderer 能完成的：

| 算法 | 需要的渲染器 |
|------|-------------|
| Two Sum | ArrayRenderer + VariableRenderer + CodeRenderer |
| DFS | TreeRenderer + StackRenderer + CodeRenderer |
| Dijkstra | GraphRenderer + PriorityQueueRenderer + VariableRenderer + CodeRenderer |

因此需要一个**组合多个 Renderer 的容器**。

---

## CompositeRenderer 接口

```ts
interface CompositeRenderer {
  id: string
  scenes: Scene[]  // 需要渲染的多个 Scene
  layout: Layout   // 如何排列它们
}
```

---

## Layout 归属

布局属于 CompositeRenderer，不属于单个 Renderer。

| 关注方 | 职责 |
|--------|------|
| Renderer | 只关心自己的渲染区域 |
| CompositeRenderer | 决定多个 Renderer 如何排列 |

---

## 示例：Two Sum

布局：

```
┌──────────────────────┐
│ Array                │
├──────────────────────┤
│ Variables            │
├──────────────────────┤
│ Code                 │
└──────────────────────┘
```

CompositeRenderer 配置：

```ts
{
  scenes: [
    arrayScene,
    variableScene,
    codeScene
  ]
}
```

---

## 同步机制

所有 Renderer 读取同一个 Frame，因此天然同步。

```
Frame ← ArrayRenderer
     ← CodeRenderer
     ← VariableRenderer
```

不允许各自维护独立的 Frame：

```ts
// ✗ 禁止
ArrayRenderer.frame   // 不允许
CodeRenderer.frame    // 不允许
```

---

## 嵌套 Composite

允许 Composite 嵌套 Composite：

```
Composite
├── Composite
│   ├── Renderer A
│   └── Renderer B
└── Renderer C
```

未来 Agent Renderer 会大量依赖此能力。

---

## 渲染相关信息

CompositeRenderer 本身不产出渲染内容，它的职责是：

1. 拥有多个 Scene 引用
2. 持有一个 Layout 描述
3. 将各 Renderer 的输出按 Layout 组合

最终输出仍然是统一的 `RenderNode` 树，交给宿主框架处理。

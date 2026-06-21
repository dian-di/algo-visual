# Renderer

## 设计目标

Renderer 的职责：**解释数据**。

Renderer **不拥有数据**。它只接收 Frame 和 Scene，产出可视化的描述。

---

## Renderer Contract

```ts
interface RendererPlugin {
  id: string

  supports(scene: Scene): boolean

  render(scene: Scene, frame: Frame): RenderNode
}
```

数据流：

```
Frame → Scene → Renderer
```

---

## Scene 定义

```ts
interface Scene {
  id: string
  type: string       // 数据结构类型
  dataset: string    // 关联的 Dataset
  pointers: string[] // 关联的 Pointer
}
```

### 示例：Two Sum

```ts
{
  type: "array",
  dataset: "nums",
  pointers: ["i", "j"]
}
```

---

## 专用 Renderer

### ArrayRenderer

只渲染数组，绝不允许 Graph 或 Tree 的逻辑混入。

### TreeRenderer

统一处理：Tree、AVL、RBTree、Trie。

### GraphRenderer

处理：Graph、Dijkstra、A* 等图算法。

### VariableRenderer

显示 `frame.variables`。

### CodeRenderer

显示 `frame.code`。

---

## Renderer 规则

### 无状态

Renderer **禁止维护状态**：

```ts
// ✗ 禁止
class Renderer {
  currentFrame  // ← 不允许
}
```

Renderer 必须是**纯函数**。

### 输出 RenderNode，而非 JSX

```ts
render(scene, frame): RenderNode
```

输出 RenderNode 而非 JSX，这样 React、Vue、Svelte 都能解释。

---

## 渲染相关信息

Renderer 本身的输出是框架无关的 `RenderNode`，最终由宿主框架（React/Vue/Svelte）将其转为实际 DOM 或 Canvas 节点。

| 层 | 职责 |
|----|------|
| Renderer Plugin | 纯函数，`Scene + Frame → RenderNode` |
| 宿主框架 | `RenderNode → DOM / Canvas` |
| CompositeRenderer | 组合多个 Renderer 的输出 |

# Layout

## 设计目标

Layout 决定**多个 Renderer 如何组合摆放**。

> **Layout ≠ Renderer** — 这是很多框架混淆的概念。
>
> - Renderer 负责**画什么**
> - Layout 负责**放在哪里**

---

## Layout Contract

```ts
interface Layout {
  id: string
  type: string
}
```

---

## 与 Frame 的关系

```
Frame
├── Scene[]    ← 要渲染什么
└── Layout     ← 怎么摆放
```

Layout 描述的是 Scene 的空间排列方式。

---

## 内置 Layout 类型

### Grid Layout

最常见的网格布局。

```
┌─────┬─────┐
│  A  │  B  │
├─────┼─────┤
│  C  │  D  │
└─────┴─────┘
```

```ts
interface GridLayout {
  rows: number
  cols: number
}
```

### Split Layout

水平或垂直分割。

```
水平: A | B      垂直: A
                       ───
                       B
```

```ts
interface SplitLayout {
  direction: "horizontal" | "vertical"
}
```

### Tabs Layout

标签页切换，适合复杂场景下不同视图的切换查看。

### Overlay Layout

多个 Renderer 重叠渲染。

```ts
interface OverlayLayout {
  layers: string[]
}
```

示例：Graph + 路径高亮叠加。

### Dock Layout（未来）

类似 VSCode 的自由拖拽面板布局：Left / Right / Bottom。

---

## Composite Layout（核心能力）

通过组合基础 Layout 实现复杂布局：

### Two Sum — 纵向三段

```
┌──────────────────┐
│ Array            │
├──────────────────┤
│ Variables        │
├──────────────────┤
│ Code             │
└──────────────────┘
```

### DFS — 2×2 网格

```
┌────────┬────────┐
│ Tree   │ Code   │
├────────┼────────┤
│ Stack  │ Vars   │
└────────┴────────┘
```

### Dijkstra — 2×2 网格

```
┌──────────┬──────────┐
│ Graph    │ Queue    │
├──────────┼──────────┤
│ Code     │ Vars     │
└──────────┴──────────┘
```

---

## Layout Tree（V11 升级）

未来将 Layout 从简单对象升级为树结构：

```ts
interface LayoutNode {
  children: LayoutNode[]
}
```

这样可以表达任意嵌套组合：

```
Grid
├── Split
│   ├── Scene A
│   └── Scene B
└── Tabs
    ├── Scene C
    └── Scene D
```

---

## Layout 序列化

必须支持持久化：

```ts
{ layout: { /* Layout 配置 */ } }
```

未来支持用户自定义布局，保存后可直接恢复。

---

## 职责总览

| 模块 | 职责 |
|------|------|
| Renderer | 负责画什么 |
| Timeline | 负责是什么时候 |
| Playback | 负责走到哪里 |
| Layout | 负责放在哪里 |

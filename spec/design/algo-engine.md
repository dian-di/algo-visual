# Algo Engine

## 设计目标

Algo Engine 负责一件事：**生成 `Frame[]`**。

不负责：

- UI
- Renderer
- Layout

核心产出：

```
Algorithm
    ↓
Frame[]
```

---

## Builder API

Builder 是算法开发者与 Algo Engine 交互的唯一入口。

```ts
builder.dataset(name, datasetFn)
builder.pointer(pointer)
builder.variable(name, value)
builder.snapshot()  // → Frame
```

---

## Dataset 注册

注册算法中使用的数据结构：

```ts
builder.dataset("nums", arrayDataset)
```

## Pointer 注册

注册算法中使用的指针：

```ts
builder.pointer(iPointer)
```

## Variable 注册

注册算法中的变量：

```ts
builder.variable("target", 9)
```

---

## Snapshot

最重要的接口。调用 `snapshot()` 会捕获当前所有状态，生成一个 `Frame`：

```ts
builder.snapshot() // → Frame
```

### Transaction

复杂算法中一次操作涉及多个修改，用 `transaction()` 保证只生成一个 Frame：

```ts
builder.transaction(() => {
  // 多个修改操作
  // 只产生一个 Frame
})
```

---

## 示例：Two Sum

```ts
// 初始化
builder.dataset("nums", nums)
builder.pointer(iPointer)
builder.snapshot()           // → Frame 0

// 移动指针
iPointer.target = 3
builder.snapshot()           // → Frame 1

// Timeline: [Frame 0, Frame 1, Frame 2, ...]
```

## 示例：QuickSort

所有操作对象统一为 Pointer：

- `pivot` — PointPointer
- `left` — PointPointer
- `right` — PointPointer
- `partitionRange` — RangePointer

无需特殊处理，全部是 Pointer。

## 示例：DFS

| 概念 | 类型 |
|------|------|
| Tree | Dataset（TreeDataset） |
| CurrentNode | Pointer（PointPointer） |
| Stack | Dataset（StackDataset） |

渲染组合：`TreeRenderer` + `StackRenderer` + `CodeRenderer`

---

## 边界

Algo Engine 永远不知道：

- React
- Vue
- Canvas
- SVG

它唯一关心的产出：**`Algorithm → Frame[]`**

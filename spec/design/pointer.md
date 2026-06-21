# Pointer

## 设计目标

Pointer 是整个教学系统的**注意力系统（Attention System）**。

Renderer 的核心任务只有一个：**告诉用户当前应该看哪里**。Pointer 就是实现这个能力的抽象。

---

## 统一接口

```ts
interface BasePointer {
  id: string
  label: string
  color?: string
  description?: string
}
```

---

## Pointer 类型

### PointPointer

指向单个元素。

```ts
interface PointPointer extends BasePointer {
  type: "point"
  target: string | number
}
```

示例（Two Sum）：

```ts
{ id: "i", type: "point", target: 3 }
```

### RangePointer

表示一段区间。

```ts
interface RangePointer extends BasePointer {
  type: "range"
  start: number
  end: number
}
```

示例（MergeSort / Sliding Window / QuickSort）：

```ts
{ type: "range", start: 3, end: 8 }
```

### PathPointer

表示一条路径。

```ts
interface PathPointer extends BasePointer {
  type: "path"
  nodes: string[]
}
```

示例（DFS / Tree Traversal / Dijkstra）：

```ts
{ type: "path", nodes: ["A", "B", "D"] }
```

### GroupPointer

表示一组元素集合。

```ts
interface GroupPointer extends BasePointer {
  type: "group"
  targets: string[]
}
```

适用场景：

| 场景 | Pointer 语义 |
|------|-------------|
| Visited | 已访问节点集合 |
| Frontier | 待探索节点集合 |
| Closed Set | 已关闭集合 |
| Beam Search | 当前束 |

---

## 渲染相关信息

Pointer 本身不直接渲染，它由各 Renderer 读取后决定视觉表现：

| Renderer | 对 Pointer 的处理 |
|----------|-------------------|
| ArrayRenderer | 高亮对应索引位置 |
| TreeRenderer | 标记节点颜色或路径 |
| GraphRenderer | 高亮边和节点 |
| CodeRenderer | 在代码行标记断点或高亮 |

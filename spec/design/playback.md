# Playback

## 设计目标

Playback 控制帧的播放行为，是用户与 Timeline 交互的控制层。

---

## PlaybackState

```ts
interface PlaybackState {
  playing: boolean
  speed: number
  loop: boolean
  reverse: boolean
}
```

---

## PlaybackController

基础播放控制接口：

```ts
interface PlaybackController {
  play(): void
  pause(): void
  stop(): void
  next(): void
  prev(): void
  seek(index: number): void
}
```

行为说明：

- `next()` — cursor + 1，到达末尾自动停止
- `prev()` — cursor - 1，到达起始自动停止

---

## AutoPlayController

自动播放控制器：

```ts
interface AutoPlayController {
  start(): void
  stop(): void
}
```

内部实现：`setInterval` 或 `requestAnimationFrame`。

---

## SpeedController

支持倍速播放：

| 倍速 | speed 值 |
|------|---------|
| 0.25x | 0.25 |
| 0.5x | 0.5 |
| 1x | 1 |
| 2x | 2 |
| 4x | 4 |
| 8x | 8 |

```ts
// speed = 2 表示 2 倍速
```

---

## 播放模式

### Loop 模式

```ts
loop: boolean  // true 时，到末尾自动回到 frame[0]
```

### Reverse 模式

```ts
reverse: boolean  // 支持倒放，教学场景非常实用
```

### Ping Pong 模式（未来）

效果：`0 → 100 → 0 → 100`，适合动画展示。

---

## Frame Duration

默认使用固定时长，未来支持每帧自定义：

```ts
frame.duration  // 自定义帧时长
```

适用场景：

| 场景 | 时长需求 |
|------|---------|
| TCP 等待 | 较长 |
| Agent 思考 | 较长 |
| 快速状态变化 | 较短 |

---

## PlaybackEvent

```ts
interface PlaybackEvent {
  type: "play" | "pause" | "seek" | "stop"
}
```

---

## 播放同步

所有 Renderer 共享同一个 cursor，因此播放天然同步。

---

## Playback Hook

React 推荐用法：

```ts
const playback = usePlayback()
// 统一读取 playing / speed / currentFrame 等状态
```

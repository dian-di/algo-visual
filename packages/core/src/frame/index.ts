import type { Scene } from '../scene'

// A single frame in the visualization timeline
export interface Frame<TScene extends Scene = Scene, TEvent = unknown> {
  readonly id: string
  readonly title?: string
  readonly message?: string
  readonly tag?: string
  /** The scene state at this frame */
  readonly scene: Readonly<TScene>
  /** The algorithm event that produced this frame */
  readonly event?: Readonly<TEvent>
  /** How long to display this frame (ms) */
  readonly duration?: number
}

export interface FrameOptions<TEvent = unknown> {
  title?: string
  message?: string
  tag?: string
  event?: TEvent
  duration?: number
}

let frameSeq = 0

export function createFrame<TScene extends Scene, TEvent = unknown>(
  scene: TScene,
  opts?: FrameOptions<TEvent>,
): Frame<TScene, TEvent> {
  return {
    id: `frame-${++frameSeq}`,
    scene,
    ...opts,
  }
}

export function resetFrameCounter() {
  frameSeq = 0
}

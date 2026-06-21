/** A single frame in the visualization timeline */
export interface Frame<TScene = unknown, TEvent = unknown> {
  readonly id: string
  readonly title?: string
  readonly message?: string
  readonly tag?: string
  readonly scene: Readonly<TScene>
  readonly event?: Readonly<TEvent>
  /** Display duration in ms (default 1000) */
  readonly duration?: number
}

/** Read-only snapshot of the current playback + cursor state */
export interface TimelineSnapshot<TScene = unknown, TEvent = unknown> {
  readonly index: number
  readonly total: number
  readonly progress: number
  readonly playing: boolean
  readonly speed: number
  readonly loop: boolean
  readonly reverse: boolean
  readonly frame: Frame<TScene, TEvent>
}

export type Listener<TScene = unknown, TEvent = unknown> = (
  snapshot: TimelineSnapshot<TScene, TEvent>,
) => void

// ---- Timeline events (spec: timeline.md) ----

export interface AppendEvent {
  type: 'append'
  count: number
}

export interface SeekEvent {
  type: 'seek'
  index: number
}

export type TimelineEvent = AppendEvent | SeekEvent

export type TimelineEventListener = (event: TimelineEvent) => void

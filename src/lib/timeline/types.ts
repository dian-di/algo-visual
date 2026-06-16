export interface TimelineStep<TState, TMeta = unknown> {
  readonly state: Readonly<TState>

  readonly meta?: Readonly<TMeta>
}

export interface TimelineBuilder<TState, TMeta = unknown> {
  build(): TimelineStep<TState, TMeta>[]
}

export enum TimelineEventType {
  STEP_CHANGED = 'STEP_CHANGED',

  PLAY = 'PLAY',

  PAUSE = 'PAUSE',

  RESET = 'RESET',

  FINISH = 'FINISH',
}

export interface TimelineEvent<TState, TMeta> {
  type: TimelineEventType

  stepIndex: number

  step: TimelineStep<TState, TMeta>
}

export interface Frame<
  TScene,
  TEvent = unknown
> {
  readonly id: string

  readonly title?: string

  readonly message?: string

  readonly tag?: string

  /**
   * 当前画面
   */
  readonly scene: Readonly<TScene>

  /**
   * 当前步骤发生的事件
   */
  readonly event?: Readonly<TEvent>

  /**
   * 播放时长(ms)
   */
  readonly duration?: number
}

export interface TimelineState<
  TScene,
  TEvent
> {
  readonly currentIndex: number

  readonly totalFrames: number

  readonly progress: number

  readonly isPlaying: boolean

  readonly speed: number

  readonly frame: Frame<
    TScene,
    TEvent
  >
}

export type Listener<
  TScene,
  TEvent
> = (
  state: TimelineState<
    TScene,
    TEvent
  >
) => void

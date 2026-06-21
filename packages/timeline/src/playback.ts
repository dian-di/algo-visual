import { AutoPlayController } from './autoplay'
import { Cursor } from './cursor'
import { PlaybackStateStore } from './playback-state'
import type { Timeline } from './timeline'
import type { Listener, TimelineSnapshot } from './types'

/**
 * Orchestrates Timeline + Cursor + PlaybackState + AutoPlayController.
 *
 * This is the primary entry-point for consumers:
 *   const ctrl = new PlaybackController(timeline)
 *   ctrl.subscribe(snap => render(snap))
 *   ctrl.play()
 */
export class PlaybackController<TScene = unknown, TEvent = unknown> {
  readonly cursor: Cursor<TScene, TEvent>
  readonly state: PlaybackStateStore

  private readonly auto: AutoPlayController<TScene, TEvent>
  private readonly snapListeners = new Set<Listener<TScene, TEvent>>()

  constructor(private readonly timeline: Timeline<TScene, TEvent>) {
    this.cursor = new Cursor(timeline)
    this.state = new PlaybackStateStore()
    this.auto = new AutoPlayController(timeline, this.cursor, this.state)

    // Re-emit snapshot whenever cursor or playback state changes
    this.cursor.subscribe(() => this.emitSnapshot())
    this.state.subscribe(() => this.emitSnapshot())
  }

  /** Start or resume playback */
  play(): void {
    if (this.state.snapshot.playing) return
    this.state.patch({ playing: true })
    this.auto.start()
  }

  /** Pause playback at the current frame */
  pause(): void {
    this.state.patch({ playing: false })
    this.auto.stop()
  }

  /** Stop playback and reset cursor to the first frame */
  stop(): void {
    this.state.patch({ playing: false })
    this.auto.stop()
    this.cursor.reset()
  }

  /** Set playback speed multiplier (must be > 0) */
  setSpeed(speed: number): void {
    if (speed <= 0) throw new Error('speed must be > 0')
    this.state.patch({ speed })
  }

  /** Enable / disable looping */
  setLoop(loop: boolean): void {
    this.state.patch({ loop })
  }

  /** Enable / disable reverse playback */
  setReverse(reverse: boolean): void {
    this.state.patch({ reverse })
  }

  /** Subscribe to full snapshot changes (fires immediately with current state) */
  subscribe(listener: Listener<TScene, TEvent>): () => void {
    this.snapListeners.add(listener)
    listener(this.snapshot)
    return () => {
      this.snapListeners.delete(listener)
    }
  }

  /** Current snapshot */
  get snapshot(): TimelineSnapshot<TScene, TEvent> {
    const { index, frame, total } = this.cursor
    const { playing, speed, loop, reverse } = this.state.snapshot
    return {
      index,
      total,
      progress: total > 0 ? (index + 1) / total : 0,
      playing,
      speed,
      loop,
      reverse,
      frame,
    }
  }

  private emitSnapshot(): void {
    const snap = this.snapshot
    for (const fn of this.snapListeners) fn(snap)
  }
}

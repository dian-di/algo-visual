import type { Cursor } from './cursor'
import type { PlaybackStateStore } from './playback-state'
import type { Timeline } from './timeline'

/**
 * Drives automatic frame advancement using requestAnimationFrame.
 *
 * AutoPlayController is the timing engine — it reads the current frame's
 * duration, applies speed, and advances the cursor when enough time has elapsed.
 */
export class AutoPlayController<TScene = unknown, TEvent = unknown> {
  private rafId: number | null = null
  private lastTime = 0
  private elapsed = 0

  constructor(
    private readonly timeline: Timeline<TScene, TEvent>,
    private readonly cursor: Cursor<TScene, TEvent>,
    private readonly store: PlaybackStateStore,
  ) {}

  get running(): boolean {
    return this.rafId !== null
  }

  /** Start the rAF loop */
  start(): void {
    if (this.rafId !== null) return
    this.lastTime = performance.now()
    this.elapsed = 0
    this.tick = this.tick.bind(this)
    this.rafId = requestAnimationFrame(this.tick)
  }

  /** Stop the rAF loop (does not change PlaybackState) */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.elapsed = 0
  }

  private tick(now: number): void {
    const { playing, speed, loop, reverse } = this.store.snapshot

    if (!playing) {
      this.rafId = null
      return
    }

    const delta = now - this.lastTime
    this.lastTime = now
    this.elapsed += delta * speed

    const frameDuration = this.cursor.frame.duration ?? 1000

    if (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration
      const moved = reverse ? this.cursor.prev() : this.cursor.next()

      if (!moved) {
        if (loop) {
          reverse ? this.cursor.seek(this.cursor.total - 1) : this.cursor.seek(0)
        } else {
          this.store.patch({ playing: false })
          this.rafId = null
          return
        }
      }
    }

    this.rafId = requestAnimationFrame(this.tick)
  }
}

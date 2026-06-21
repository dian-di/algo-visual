import type { Timeline } from './timeline'
import type { Frame } from './types'

export interface CursorChangeEvent<TScene = unknown, TEvent = unknown> {
  readonly index: number
  readonly frame: Frame<TScene, TEvent>
  readonly source: 'next' | 'prev' | 'seek'
}

export type CursorListener<TScene = unknown, TEvent = unknown> = (
  event: CursorChangeEvent<TScene, TEvent>,
) => void

/**
 * Navigable position within a Timeline.
 *
 * Cursor tracks the current index and provides next / prev / seek navigation.
 * It does NOT own playback timing — that lives in PlaybackController.
 *
 * On every position change it both:
 *  1. Notifies its own CursorListener subscribers
 *  2. Calls timeline.notifySeek() so Timeline-level TimelineEvent listeners fire too
 */
export class Cursor<TScene = unknown, TEvent = unknown> {
  private _index = 0
  private readonly listeners = new Set<CursorListener<TScene, TEvent>>()

  constructor(private readonly timeline: Timeline<TScene, TEvent>) {}

  get index(): number {
    return this._index
  }

  get frame(): Frame<TScene, TEvent> {
    return this.timeline.at(this._index)!
  }

  get total(): number {
    return this.timeline.length
  }

  /** Advance to the next frame. Returns false if already at the end. */
  next(): boolean {
    if (this._index >= this.timeline.length - 1) return false
    this._index++
    this.emit('next')
    return true
  }

  /** Move back one frame. Returns false if already at 0. */
  prev(): boolean {
    if (this._index <= 0) return false
    this._index--
    this.emit('prev')
    return true
  }

  /** Jump to an absolute index. Returns false if out of bounds. */
  seek(index: number): boolean {
    if (index < 0 || index >= this.timeline.length) return false
    this._index = index
    this.emit('seek')
    return true
  }

  /** Reset to the beginning */
  reset(): void {
    this._index = 0
    this.emit('seek')
  }

  subscribe(listener: CursorListener<TScene, TEvent>): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(source: 'next' | 'prev' | 'seek'): void {
    // Notify Timeline-level listeners (spec: TimelineEvent)
    this.timeline.notifySeek(this._index)

    const event: CursorChangeEvent<TScene, TEvent> = {
      index: this._index,
      frame: this.frame,
      source,
    }
    for (const fn of this.listeners) fn(event)
  }
}

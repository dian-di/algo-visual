import { deepFreeze } from './freeze'
import type { Frame, TimelineEvent, TimelineEventListener } from './types'

let timelineSeq = 0

/**
 * Pure data container for a sequence of frames.
 *
 * Invariants (per timeline.md):
 *  - Frame order is immutable (append-only, no swap/insert/remove)
 *  - Frame data is immutable (deep-frozen on append)
 *  - Frame IDs are globally unique within this timeline
 *
 * Timeline also serves as the event hub: both `append` and `seek`
 * events are emitted through its subscribe interface.
 */
export class Timeline<TScene = unknown, TEvent = unknown> {
  readonly id: string

  private readonly frames: Frame<TScene, TEvent>[] = []
  private readonly idSet = new Set<string>()
  private readonly eventListeners = new Set<TimelineEventListener>()

  constructor(id?: string) {
    this.id = id ?? `timeline-${++timelineSeq}`
  }

  // ---- Builder API (spec) ----

  /** Append one or more frames to the end of the timeline */
  append(...frames: Frame<TScene, TEvent>[]): void {
    for (const frame of frames) {
      if (this.idSet.has(frame.id)) {
        throw new Error(
          `Timeline.append(): duplicate frame id "${frame.id}" — Frame IDs must be globally unique`,
        )
      }
      this.idSet.add(frame.id)
      // Freeze the frame and its scene to enforce immutability at runtime
      this.frames.push(deepFreeze({ ...frame, scene: frame.scene }))
    }
    this.emit({ type: 'append', count: frames.length })
  }

  /** Get the frame at a given index (returns undefined if out of bounds) */
  at(index: number): Frame<TScene, TEvent> | undefined {
    return this.frames[index]
  }

  /** Total number of frames */
  get length(): number {
    return this.frames.length
  }

  /** Find the index of the first frame whose tag matches, or -1 */
  findTag(tag: string): number {
    return this.frames.findIndex((f) => f.tag === tag)
  }

  // ---- Events (spec: TimelineEvent) ----

  /** Subscribe to timeline events (append, seek). Returns unsubscribe function. */
  subscribe(listener: TimelineEventListener): () => void {
    this.eventListeners.add(listener)
    return () => {
      this.eventListeners.delete(listener)
    }
  }

  /**
   * Emit a seek event. Called by Cursor when it moves.
   * Timeline is the event hub — both append and seek flow through here.
   */
  notifySeek(index: number): void {
    this.emit({ type: 'seek', index })
  }

  private emit(event: TimelineEvent): void {
    for (const fn of this.eventListeners) fn(event)
  }

  // ---- Serialization (spec: 100% JSON compatible) ----

  /** Serialize to a plain JSON-compatible object */
  toJSON(): { id: string; frames: Frame<TScene, TEvent>[] } {
    return { id: this.id, frames: [...this.frames] }
  }
}

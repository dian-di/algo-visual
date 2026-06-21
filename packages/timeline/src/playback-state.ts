/** Observable playback configuration */
export interface PlaybackState {
  playing: boolean
  speed: number
  loop: boolean
  reverse: boolean
}

export type PlaybackStateListener = (state: PlaybackState) => void

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  playing: false,
  speed: 1,
  loop: false,
  reverse: false,
}

/**
 * Mutable, observable PlaybackState container.
 */
export class PlaybackStateStore {
  private state: PlaybackState = { ...DEFAULT_PLAYBACK_STATE }
  private readonly listeners = new Set<PlaybackStateListener>()

  get snapshot(): PlaybackState {
    return { ...this.state }
  }

  patch(partial: Partial<PlaybackState>): void {
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  subscribe(listener: PlaybackStateListener): () => void {
    this.listeners.add(listener)
    listener(this.snapshot)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify(): void {
    const snap = this.snapshot
    for (const fn of this.listeners) fn(snap)
  }
}

import type { Frame, Listener, TimelineState } from './types'

export class Timeline<TScene, TEvent = unknown> {
  private readonly frames: Frame<TScene, TEvent>[]

  private currentIndex = 0

  private isPlaying = false

  private speed = 1

  private timer?: ReturnType<typeof setTimeout>

  private readonly listeners = new Set<Listener<TScene, TEvent>>()

  constructor(frames: Frame<TScene, TEvent>[]) {
    if (frames.length === 0) {
      throw new Error('Timeline requires at least one frame')
    }

    this.frames = frames
  }

  get currentFrame() {
    return this.frames[this.currentIndex]
  }

  getState(): TimelineState<TScene, TEvent> {
    return {
      currentIndex: this.currentIndex,

      totalFrames: this.frames.length,

      progress: (this.currentIndex + 1) / this.frames.length,

      isPlaying: this.isPlaying,

      speed: this.speed,

      frame: this.currentFrame,
    }
  }

  next() {
    if (this.currentIndex >= this.frames.length - 1) {
      this.pause()
      return false
    }

    this.currentIndex++

    this.notify()

    return true
  }

  prev() {
    if (this.currentIndex <= 0) {
      return false
    }

    this.currentIndex--

    this.notify()

    return true
  }

  goto(index: number) {
    if (index < 0 || index >= this.frames.length) {
      return false
    }

    this.currentIndex = index

    this.notify()

    return true
  }

  reset() {
    this.pause()

    this.currentIndex = 0

    this.notify()
  }

  replay() {
    this.reset()

    this.play()
  }

  setSpeed(speed: number) {
    if (speed <= 0) {
      throw new Error('speed must be > 0')
    }

    this.speed = speed

    this.notify()
  }

  findByTag(tag: string) {
    return this.frames.findIndex((x) => x.tag === tag)
  }

  gotoTag(tag: string) {
    const index = this.findByTag(tag)

    if (index >= 0) {
      this.goto(index)
    }
  }

  play() {
    if (this.isPlaying) {
      return
    }

    this.isPlaying = true

    this.notify()

    const tick = () => {
      if (!this.isPlaying) {
        return
      }

      const duration = this.currentFrame.duration ?? 1000

      this.timer = setTimeout(() => {
        const moved = this.next()

        if (!moved) {
          return
        }

        tick()
      }, duration / this.speed)
    }

    tick()
  }

  pause() {
    this.isPlaying = false

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.notify()
  }

  subscribe(listener: Listener<TScene, TEvent>) {
    this.listeners.add(listener)

    listener(this.getState())

    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    const state = this.getState()

    this.listeners.forEach((listener) => {
        listener(state)
    })
  }
}

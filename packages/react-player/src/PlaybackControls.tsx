import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { PlaybackControlsProps } from './types'
import { usePlayback } from './usePlayback'

/**
 * PlaybackControls play/pause and prev/next buttons.
 */
export function PlaybackControls({ controller, className }: PlaybackControlsProps) {
  const snapshot = usePlayback(controller)
  const { playing } = snapshot

  const btn =
    'inline-flex h-9 w-9 items-center justify-center rounded border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground'

  return (
    <div className={className ?? 'flex items-center justify-center gap-2'}>
      <button
        type='button'
        className={btn}
        onClick={() => controller.cursor.prev()}
        title='Previous'
      >
        <SkipBack size={16} />
      </button>

      <button
        type='button'
        className={btn + 'w-11'}
        onClick={() => (playing ? controller.pause() : controller.play())}
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <button type='button' className={btn} onClick={() => controller.cursor.next()} title='Next'>
        <SkipForward size={16} />
      </button>
    </div>
  )
}

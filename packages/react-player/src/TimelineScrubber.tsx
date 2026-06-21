import type { TimelineScrubberProps } from './types'
import { usePlayback } from './usePlayback'

/**
 * TimelineScrubber — a slider for seeking through timeline frames.
 */
export function TimelineScrubber({ controller, className }: TimelineScrubberProps) {
  const snapshot = usePlayback(controller)
  const max = Math.max(snapshot.total - 1, 0)

  return (
    <div className={className ?? 'w-full px-1'}>
      <input
        type='range'
        min={0}
        max={max}
        step={1}
        value={snapshot.index}
        onChange={(e) => controller.cursor.seek(Number(e.target.value))}
        className='h-2 w-full cursor-pointer appearance-none rounded bg-muted accent-primary'
      />
      <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
        <span>
          {snapshot.index + 1} / {snapshot.total}
        </span>
        <span>{Math.round(snapshot.progress * 100)}%</span>
      </div>
    </div>
  )
}

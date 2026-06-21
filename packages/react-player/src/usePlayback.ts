import { useEffect, useState } from 'react'
import type { PlaybackController, TimelineSnapshot } from '../../timeline/src'

/**
 * Reactive hook that subscribes to a PlaybackController.
 * Returns the latest TimelineSnapshot and re-renders on every change.
 */
export function usePlayback<TScene>(controller: PlaybackController<TScene>) {
  const [snapshot, setSnapshot] = useState<TimelineSnapshot<TScene>>(controller.snapshot)

  useEffect(() => {
    return controller.subscribe(setSnapshot)
  }, [controller])

  return snapshot
}

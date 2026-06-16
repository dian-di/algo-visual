import type { ReactNode } from 'react'
import type { Timeline } from '@/lib/timeline'
import type { Frame } from '@/lib/timeline/types'

export interface TimelinePlayerProps<TScene, TEvent> {
  timeline: Timeline<TScene, TEvent>

  children: (frame: Frame<TScene, TEvent>) => ReactNode
}

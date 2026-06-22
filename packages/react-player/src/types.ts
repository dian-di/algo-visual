import type { ReactNode } from 'react'
import type { PlaybackController, TimelineSnapshot } from '../../timeline/src'
import type { AlgoScene } from '../../algo-engine/src/types'
import type { RenderNode } from '../../renderer-sdk/src'

/** Props shared by player sub-components */
export interface PlaybackControlsProps<TScene = AlgoScene> {
  controller: PlaybackController<TScene>
  className?: string
}

export interface TimelineScrubberProps<TScene = AlgoScene> {
  controller: PlaybackController<TScene>
  className?: string
}

/** Props for ReactRendererHost */
export interface ReactRendererHostProps {
  node: RenderNode
  className?: string
}

/** Props for the top-level TimelinePlayer */
export interface TimelinePlayerProps {
  controller: PlaybackController<AlgoScene>
  className?: string
  /** Optional slot rendered above the visualization */
  header?: (snapshot: TimelineSnapshot<AlgoScene>) => ReactNode
  /** Optional slot rendered below the controls */
  footer?: (snapshot: TimelineSnapshot<AlgoScene>) => ReactNode
}

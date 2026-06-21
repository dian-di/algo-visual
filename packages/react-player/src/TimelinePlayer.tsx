import type { AlgoScene } from '../../algo-engine/src/types'
import { CompositeRenderer } from '../../renderer-sdk/src'
import { ReactRendererHost } from './host'
import { PlaybackControls } from './PlaybackControls'
import { TimelineScrubber } from './TimelineScrubber'
import type { TimelinePlayerProps } from './types'
import { usePlayback } from './usePlayback'

const renderer = new CompositeRenderer()

/**
 * TimelinePlayer — the top-level visualization player.
 *
 * Composes PlaybackControls, TimelineScrubber, and ReactRendererHost
 * into a ready-to-use component.
 *
 * Usage:
 *   <TimelinePlayer controller={ctrl} />
 */
export function TimelinePlayer({ controller, className, header, footer }: TimelinePlayerProps) {
  const snapshot = usePlayback(controller)
  const renderNode = renderer.renderFrame(
    snapshot.frame as import('../../timeline/src').Frame<AlgoScene>,
  )

  return (
    <div className={className ?? 'mx-auto max-w-2xl space-y-6 p-4'}>
      {/* Header slot */}
      {header?.(snapshot)}

      {/* Rendered visualization */}
      <div className='rounded-lg border bg-background p-6 shadow-sm'>
        <ReactRendererHost node={renderNode} />
      </div>

      {/* Scrubber */}
      <TimelineScrubber controller={controller} />

      {/* Controls */}
      <PlaybackControls controller={controller} />

      {/* Footer slot */}
      {footer?.(snapshot)}
    </div>
  )
}

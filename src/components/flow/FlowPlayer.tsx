import { PlaybackControls } from '@packages/react-player/src/PlaybackControls'
import { TimelineScrubber } from '@packages/react-player/src/TimelineScrubber'
import type { PlaybackController, TimelineSnapshot } from '@packages/timeline/src'
import { type ReactNode, useEffect, useState } from 'react'
import type { FlowRendererRegistry } from './flow-renderers'

interface FlowPlayerProps<TScene> {
  controller: PlaybackController<TScene>
  /** Registry to resolve renderer by id */
  registry?: FlowRendererRegistry
  /** Renderer id to look up in registry */
  renderer?: string
  /** Fallback render-prop when no registry/renderer is provided */
  children?: (snapshot: TimelineSnapshot<TScene>) => ReactNode
  className?: string
  header?: (snapshot: TimelineSnapshot<TScene>) => ReactNode
}

/**
 * FlowPlayer -- generic timeline player for any scene type.
 *
 * Rendering priority:
 *   1. renderer prop -> registry.resolve(id) -> render scene
 *   2. children render-prop (custom)
 */
export function FlowPlayer<TScene>({
  controller,
  registry,
  renderer: rendererId,
  children,
  className,
  header,
}: FlowPlayerProps<TScene>) {
  const [snapshot, setSnapshot] = useState<TimelineSnapshot<TScene>>(controller.snapshot)

  useEffect(() => {
    return controller.subscribe(setSnapshot)
  }, [controller])

  // Resolve renderer from registry
  const Renderer = registry && rendererId ? registry.resolve(rendererId) : undefined

  return (
    <div className={className ?? 'mx-auto max-w-2xl space-y-6 p-4'}>
      {header?.(snapshot)}

      <div className='rounded-lg border bg-background p-6 shadow-sm'>
        {Renderer ? (
          <Renderer scene={snapshot.frame.scene as never} />
        ) : children ? (
          children(snapshot)
        ) : (
          <div className='text-muted-foreground text-sm'>No renderer configured</div>
        )}
      </div>

      <TimelineScrubber controller={controller} />
      <PlaybackControls controller={controller} />
    </div>
  )
}

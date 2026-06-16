import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import type { TimelinePlayerProps } from './types'

export function TimelinePlayer<TScene, TEvent>({
  timeline,
  children,
}: TimelinePlayerProps<TScene, TEvent>) {
  const [state, setState] = useState(timeline.getState())

  useEffect(() => {
    return timeline.subscribe(setState)
  }, [timeline])

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='font-bold text-2xl'>{state.frame.title}</h2>

        <p className='text-muted-foreground'>{state.frame.message}</p>
      </div>

      {children(state.frame)}

      <div className='space-y-4'>
        <Slider
          value={[state.currentIndex]}
          max={state.totalFrames - 1}
          step={1}
          onValueChange={(value) => timeline.goto(value[0])}
        />

        <div className='flex items-center justify-center gap-2'>
          <Button variant='outline' size='icon' onClick={() => timeline.prev()}>
            <SkipBack />
          </Button>

          <Button
            size='icon'
            onClick={() => (state.isPlaying ? timeline.pause() : timeline.play())}
          >
            {state.isPlaying ? <Pause /> : <Play />}
          </Button>

          <Button variant='outline' size='icon' onClick={() => timeline.next()}>
            <SkipForward />
          </Button>
        </div>
      </div>
    </div>
  )
}

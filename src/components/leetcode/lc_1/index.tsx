import { TimelinePlayer } from '@/components/TimelinePlayer'
import ArrayVisualizer from '@/components/visualizer/Array'
import type { ArrayScene } from '@/components/visualizer/Array/types'
import { Timeline } from '@/lib/timeline'
import { Builder } from './builder'
import type { Event } from './types'

const frames = Builder.build([4, 7, 11, 2, 15], 9)

const timeline = new Timeline<ArrayScene<number>, Event>(frames)

timeline.subscribe((state) => {
  console.clear()

  console.log(`Frame ${state.currentIndex + 1}/${state.totalFrames}`)

  console.log(state.frame.title)

  console.log(state.frame.message)

  console.log(state.frame.scene)

  console.log(state.frame.event)
})

export default function Home() {
  return (
    <div>
      <TimelinePlayer timeline={timeline}>
        {(frame) => <ArrayVisualizer scene={frame.scene} />}
      </TimelinePlayer>
    </div>
  )
}

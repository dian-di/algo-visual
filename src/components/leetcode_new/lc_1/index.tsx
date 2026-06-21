import { AlgoBuilder } from '@packages/algo-engine/src'
import { TimelinePlayer } from '@packages/react-player/src'
import { PlaybackController } from '@packages/timeline/src'

function buildTwoSum() {
  const b = new AlgoBuilder()

  const nums = [3, 2, 4, 7]
  const target = 9

  // Mutable dataset — highlights change between snapshots
  const data: {
    values: number[]
    highlights: { indices: number[]; variant: string }[]
  } = { values: [...nums], highlights: [] }

  b.dataset('nums', data)
  b.variable('target', target)

  // Mutable pointer — target changes between snapshots
  const iPtr = {
    id: 'i',
    type: 'point' as const,
    target: 0,
    label: 'i',
    variant: 'primary' as const,
  }
  b.pointer(iPtr)

  b.snapshot({ title: 'Two Sum', message: `目标值 ${target}` })

  const map = new Map<number, number>()

  for (let i = 0; i < nums.length; i++) {
    const value = nums[i]
    const need = target - value

    // Move i-pointer to current index
    iPtr.target = i
    b.variable('i', i)
    b.variable('need', need)
    b.snapshot({ title: 'Check', message: `检查 nums[${i}] = ${value}，需要 ${need}` })

    if (map.has(need)) {
      const matched = map.get(need)!

      // Register j-pointer at the matched index
      b.pointer({
        id: 'j',
        type: 'point' as const,
        target: matched,
        label: 'j',
        variant: 'secondary' as const,
      })

      // Highlight both matched indices
      data.highlights = [{ indices: [matched, i], variant: 'success' }]

      b.snapshot({
        title: 'Found!',
        message: `答案: nums[${matched}] + nums[${i}] = ${target}`,
        tag: 'result',
      })
      break
    }

    // Highlight current index and record in map
    data.highlights = [{ indices: [i], variant: 'warning' }]
    map.set(value, i)
    b.snapshot({ title: 'Insert', message: `存入 map: ${value} → ${i}` })

    // Clear highlight for next iteration
    data.highlights = []
  }

  return b.build()
}

const controller = new PlaybackController(buildTwoSum())

export default function TwoSumDemo() {
  return <TimelinePlayer controller={controller} />
}

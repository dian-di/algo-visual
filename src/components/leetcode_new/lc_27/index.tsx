import { AlgoBuilder } from '@packages/algo-engine/src'
import { TimelinePlayer } from '@packages/react-player/src'
import { PlaybackController } from '@packages/timeline/src'

function buildRemoveElement() {
  const b = new AlgoBuilder()

  const nums = [0, 1, 2, 2, 3, 0, 4, 2]
  const val = 2

  const data: {
    values: number[]
    highlights: { indices: number[]; variant: string }[]
  } = { values: [...nums], highlights: [] }

  b.dataset('nums', data)
  b.variable('val', val)

  const iPtr = {
    id: 'i',
    type: 'point' as const,
    target: 0,
    label: 'i',
    variant: 'primary' as const,
  }
  const kPtr = {
    id: 'k',
    type: 'point' as const,
    target: 0,
    label: 'k',
    variant: 'warning' as const,
  }
  b.pointer(iPtr)
  b.pointer(kPtr)

  b.snapshot({ title: 'Remove Element', message: `从数组中移除所有值为 ${val} 的元素` })

  let k = 0

  for (let i = 0; i < data.values.length; i++) {
    iPtr.target = i
    kPtr.target = k
    b.variable('i', i)
    b.variable('k', k)

    if (data.values[i] === val) {
      data.highlights = [{ indices: [i], variant: 'danger' }]
      b.snapshot({
        title: 'Skip',
        message: `nums[${i}] = ${data.values[i]} == ${val}，跳过`,
      })
      data.highlights = []
      continue
    }

    // nums[i] != val — keep it
    if (i !== k) {
      data.highlights = [{ indices: [i, k], variant: 'primary' }]
      b.snapshot({
        title: 'Move',
        message: `nums[${i}] = ${data.values[i]} != ${val}，移到位置 ${k}`,
      })

      data.values[k] = data.values[i]
      data.values[i] = val
    } else {
      data.highlights = [{ indices: [i], variant: 'success' }]
      b.snapshot({
        title: 'Keep',
        message: `nums[${i}] = ${data.values[i]} != ${val}，已在正确位置`,
      })
    }

    data.highlights = []
    k++
  }

  // Final
  const kept = Array.from({ length: k }, (_, idx) => idx)
  data.highlights = kept.length > 0
    ? [{ indices: kept, variant: 'success' }]
    : []
  b.snapshot({
    title: 'Done',
    message: `k = ${k}，前 ${k} 个元素为 [${data.values.slice(0, k)}]`,
  })

  return b.build()
}

const controller = new PlaybackController(buildRemoveElement())

export default function RemoveElementDemo() {
  return <TimelinePlayer controller={controller} />
}

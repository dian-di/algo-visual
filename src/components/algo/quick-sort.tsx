import { AlgoBuilder } from '@packages/algo-engine/src'
import { TimelinePlayer } from '@packages/react-player/src'
import { PlaybackController } from '@packages/timeline/src'

function partition(
  b: AlgoBuilder,
  data: { values: number[]; highlights: { indices: number[]; variant: string }[] },
  lo: number,
  hi: number,
) {
  const pivot = data.values[hi]

  const pivotPtr = { id: 'pivot', type: 'point' as const, target: hi, label: 'pivot', variant: 'danger' as const, dataset: 'nums' }
  const iPtr = { id: 'i', type: 'point' as const, target: lo, label: 'i', variant: 'primary' as const, dataset: 'nums' }
  const jPtr = { id: 'j', type: 'point' as const, target: lo, label: 'j', variant: 'secondary' as const, dataset: 'nums' }

  b.pointer(pivotPtr)
  b.pointer(iPtr)
  b.pointer(jPtr)
  b.variable('pivot', pivot)

  b.snapshot({
    title: 'Partition',
    message: `范围 [${lo}, ${hi}]，pivot = ${pivot}`,
  })

  let i = lo
  iPtr.target = i

  for (let j = lo; j < hi; j++) {
    jPtr.target = j
    b.variable('i', i)
    b.variable('j', j)

    if (data.values[j] <= pivot) {
      if (i !== j) {
        data.highlights = [{ indices: [i, j], variant: 'primary' }]
        b.snapshot({
          title: 'Swap',
          message: `nums[${j}]=${data.values[j]} <= ${pivot}，交换 nums[${i}] 和 nums[${j}]`,
        })
        ;[data.values[i], data.values[j]] = [data.values[j], data.values[i]]
      } else {
        data.highlights = [{ indices: [i], variant: 'success' }]
        b.snapshot({
          title: 'Keep',
          message: `nums[${j}]=${data.values[j]} <= ${pivot}，已在正确位置`,
        })
      }
      data.highlights = []
      i++
      iPtr.target = i
    } else {
      data.highlights = [{ indices: [j], variant: 'danger' }]
      b.snapshot({
        title: 'Skip',
        message: `nums[${j}]=${data.values[j]} > ${pivot}，跳过`,
      })
      data.highlights = []
    }
  }

  // Place pivot in its final position
  if (i !== hi) {
    data.highlights = [{ indices: [i, hi], variant: 'success' }]
    b.snapshot({
      title: 'Place pivot',
      message: `将 pivot ${pivot} 放到位置 ${i}`,
    })
    ;[data.values[i], data.values[hi]] = [data.values[hi], data.values[i]]
    data.highlights = []
  }

  b.snapshot({
    title: 'Pivot placed',
    message: `pivot ${pivot} 在位置 ${i}，左边 <= ${pivot}，右边 > ${pivot}`,
  })

  return i
}

function quickSort(
  b: AlgoBuilder,
  data: { values: number[]; highlights: { indices: number[]; variant: string }[] },
  lo: number,
  hi: number,
) {
  if (lo >= hi) return

  b.variable('lo', lo)
  b.variable('hi', hi)

  const p = partition(b, data, lo, hi)

  quickSort(b, data, lo, p - 1)
  quickSort(b, data, p + 1, hi)
}

function buildQuickSort() {
  const b = new AlgoBuilder()

  const arr = [8, 3, 1, 5, 2, 7, 4, 6]

  const data: {
    values: number[]
    highlights: { indices: number[]; variant: string }[]
  } = { values: [...arr], highlights: [] }

  b.dataset('nums', data)

  b.snapshot({ title: 'Quick Sort', message: `初始数组 [${arr}]` })

  quickSort(b, data, 0, arr.length - 1)

  data.highlights = [
    { indices: Array.from({ length: arr.length }, (_, i) => i), variant: 'success' },
  ]
  b.snapshot({ title: 'Done', message: `排序完成 [${data.values}]` })

  return b.build()
}

const controller = new PlaybackController(buildQuickSort())

export default function QuickSortDemo() {
  return <TimelinePlayer controller={controller} />
}

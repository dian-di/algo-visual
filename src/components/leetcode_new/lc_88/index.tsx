import { AlgoBuilder } from '@packages/algo-engine/src'
import { TimelinePlayer } from '@packages/react-player/src'
import { PlaybackController } from '@packages/timeline/src'

function buildMergeSortedArray() {
  const b = new AlgoBuilder()

  const nums1 = [1, 3, 5, 0, 0, 0]
  const m = 3
  const nums2 = [2, 4, 6]
  const n = 3

  // Mutable datasets — values / highlights change between snapshots
  const d1: {
    values: number[]
    highlights: { indices: number[]; variant: string }[]
  } = { values: [...nums1], highlights: [] }

  const d2: {
    values: number[]
    highlights: { indices: number[]; variant: string }[]
  } = { values: [...nums2], highlights: [] }

  b.dataset('nums1', d1)
  b.dataset('nums2', d2)

  // Pointers bound to their datasets
  const iPtr = {
    id: 'i',
    type: 'point' as const,
    target: m - 1,
    label: 'i',
    variant: 'primary' as const,
    dataset: 'nums1',
  }
  const kPtr = {
    id: 'k',
    type: 'point' as const,
    target: m + n - 1,
    label: 'k',
    variant: 'warning' as const,
    dataset: 'nums1',
  }
  const jPtr = {
    id: 'j',
    type: 'point' as const,
    target: n - 1,
    label: 'j',
    variant: 'secondary' as const,
    dataset: 'nums2',
  }

  b.pointer(iPtr)
  b.pointer(kPtr)
  b.pointer(jPtr)

  b.snapshot({
    title: 'Merge Sorted Array',
    message: `合并 nums2 到 nums1 末尾`,
  })

  let i = m - 1
  let j = n - 1
  let k = m + n - 1

  while (i >= 0 && j >= 0) {
    iPtr.target = i
    kPtr.target = k
    jPtr.target = j
    b.variable('i', i)
    b.variable('j', j)
    b.variable('k', k)

    if (d1.values[i] > nums2[j]) {
      b.snapshot({
        title: 'Compare',
        message: `nums1[${i}]=${d1.values[i]} > nums2[${j}]=${nums2[j]}，取 nums1[i]`,
      })

      d1.values[k] = d1.values[i]
      d1.highlights = [{ indices: [k], variant: 'primary' }]
      d2.highlights = [{ indices: [j], variant: 'primary' }]
      i--
    } else {
      b.snapshot({
        title: 'Compare',
        message: `nums1[${i}]=${d1.values[i]} <= nums2[${j}]=${nums2[j]}，取 nums2[j]`,
      })

      d1.values[k] = nums2[j]
      d1.highlights = [{ indices: [k], variant: 'secondary' }]
      d2.highlights = [{ indices: [j], variant: 'secondary' }]
      j--
    }

    b.snapshot({
      title: 'Place',
      message: `nums1[${k}] = ${d1.values[k]}`,
    })

    d1.highlights = []
    d2.highlights = []
    k--
  }

  // Copy remaining nums2 elements
  while (j >= 0) {
    kPtr.target = k
    jPtr.target = j
    b.variable('j', j)
    b.variable('k', k)

    d1.values[k] = nums2[j]
    d1.highlights = [{ indices: [k], variant: 'secondary' }]
    d2.highlights = [{ indices: [j], variant: 'secondary' }]

    b.snapshot({
      title: 'Copy remaining',
      message: `nums1[${k}] = nums2[${j}] = ${nums2[j]}`,
    })

    d1.highlights = []
    d2.highlights = []
    j--
    k--
  }

  // Final
  d1.highlights = [
    { indices: Array.from({ length: m + n }, (_, idx) => idx), variant: 'success' },
  ]
  b.snapshot({ title: 'Done', message: `nums1 = [${d1.values}]` })

  return b.build()
}

const controller = new PlaybackController(buildMergeSortedArray())

export default function MergeSortedArrayDemo() {
  return <TimelinePlayer controller={controller} />
}

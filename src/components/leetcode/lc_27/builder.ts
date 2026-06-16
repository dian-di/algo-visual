import type { ArrayScene } from '@/components/visualizer/Array/types'
import type { Frame } from '@/lib/timeline/types'
import type { Event } from './types'

// biome-ignore lint/complexity/noStaticOnlyClass: <>
export class Builder {
  static build(nums: number[], val: number): Frame<ArrayScene, Event>[] {
    const frames: Frame<ArrayScene, Event>[] = []
    const arr = [...nums]
    let k = 0

    frames.push({
      id: 'start',
      title: 'Remove Element',
      message: `目标值 val = ${val}`,
      event: {
        type: 'start',
        val,
      },
      scene: {
        values: [...arr],
      },
    })

    for (let i = 0; i < arr.length; i++) {
      const value = arr[i]

      frames.push({
        id: `check-${i}`,
        title: 'Check',
        message: `检查 nums[${i}] = ${value}`,
        event: {
          type: 'check',
          index: i,
          value,
          val,
        },
        scene: {
          values: [...arr],
          pointers: [
            {
              id: 'i',
              text: 'i',
              index: i,
              variant: 'primary',
            },
            {
              id: 'k',
              text: 'k',
              index: k,
              variant: 'secondary',
            },
          ],
        },
      })

      if (value === val) {
        frames.push({
          id: `skip-${i}`,
          title: 'Skip',
          message: `nums[${i}] = ${val}，跳过`,
          event: {
            type: 'skip',
            index: i,
          },
          scene: {
            values: [...arr],
            pointers: [
              {
                id: 'i',
                text: 'i',
                index: i,
                variant: 'primary',
              },
              {
                id: 'k',
                text: 'k',
                index: k,
                variant: 'secondary',
              },
            ],
            highlights: [
              {
                indices: [i],
                variant: 'warning',
              },
            ],
          },
        })
      } else {
        arr[k] = value

        frames.push({
          id: `move-${i}`,
          title: 'Move',
          message: `nums[${i}] = ${value} ≠ ${val}，放到位置 k=${k}`,
          event: {
            type: 'move',
            from: i,
            to: k,
            value,
          },
          scene: {
            values: [...arr],
            pointers: [
              {
                id: 'i',
                text: 'i',
                index: i,
                variant: 'primary',
              },
              {
                id: 'k',
                text: 'k',
                index: k,
                variant: 'secondary',
              },
            ],
            highlights: [
              {
                indices: [k],
                variant: 'success',
              },
            ],
          },
        })

        k++
      }
    }

    frames.push({
      id: 'done',
      tag: 'result',
      title: 'Done',
      message: `完成，k = ${k}`,
      event: {
        type: 'done',
        k,
      },
      scene: {
        values: [...arr],
        pointers: [
          {
            id: 'k',
            text: 'k',
            index: k,
            variant: 'secondary',
          },
        ],
        highlights: [
          {
            indices: Array.from({ length: k }, (_, idx) => idx),
            variant: 'success',
          },
        ],
      },
    })

    return frames
  }
}

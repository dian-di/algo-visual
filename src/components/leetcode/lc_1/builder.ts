import type { ArrayScene } from '@/components/visualizer/Array/types'
import type { Frame } from '@/lib/timeline/types'
import type { Event } from './types'

// biome-ignore lint/complexity/noStaticOnlyClass: <>
export class Builder {
  static build(nums: number[], target: number): Frame<ArrayScene, Event>[] {
    const frames: Frame<ArrayScene, Event>[] = []

    const map = new Map<number, number>()

    frames.push({
      id: 'start',

      title: 'Two Sum',

      message: `目标值 ${target}`,

      event: {
        type: 'start',
      },

      scene: {
        values: [...nums],
      },
    })

    for (let i = 0; i < nums.length; i++) {
      const value = nums[i]

      const need = target - value

      frames.push({
        id: `check-${i}`,

        title: 'Check',

        message: `检查 nums[${i}] = ${value}`,

        event: {
          type: 'check',

          index: i,

          value,

          need,
        },

        scene: {
          values: [...nums],

          pointers: [
            {
              id: 'i',

              text: 'i',

              index: i,

              variant: 'primary',
            },
          ],
        },
      })

      if (map.has(need)) {
        const matched = map.get(need)!

        frames.push({
          id: 'found',

          tag: 'result',

          title: 'Found',

          message: `找到答案 (${matched}, ${i})`,

          event: {
            type: 'found',

            left: matched,

            right: i,
          },

          scene: {
            values: [...nums],

            pointers: [
              {
                id: 'i',

                text: 'i',

                index: i,

                variant: 'primary',
              },

              {
                id: 'j',

                text: 'j',

                index: matched,

                variant: 'secondary',
              },
            ],

            highlights: [
              {
                indices: [matched, i],

                variant: 'success',
              },
            ],
          },
        })

        break
      }

      map.set(value, i)

      frames.push({
        id: `insert-${i}`,

        title: 'Insert',

        message: `记录 ${value} → ${i}`,

        event: {
          type: 'insert',

          value,

          index: i,
        },

        scene: {
          values: [...nums],

          pointers: [
            {
              id: 'i',

              text: 'i',

              index: i,

              variant: 'primary',
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
    }

    return frames
  }
}

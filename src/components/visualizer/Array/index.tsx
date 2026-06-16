import { variants } from '@/const/visualizer'
import type { Variant } from '@/global'
import type { ArrayScene } from './types'

export default function ArrayVisualizer<T = number>({ scene }: { scene: ArrayScene<T> }) {
  return (
    <div className='flex gap-6'>
      {scene.values.map((value, index) => {
        const pointers = scene.pointers?.filter((x) => x.index === index) ?? []

        const highlight = scene.highlights?.find((x) => x.indices.includes(index))

        const style = highlight ? variants[highlight.variant as Variant] : undefined

        return (
          <div key={index} className='flex flex-col items-center'>
            <div className='mb-4 min-h-[80px]'>
              {pointers.map((pointer) => (
                <div
                  key={pointer.id}
                  className='flex flex-col items-center'
                  style={{
                    color: variants[pointer.variant ?? 'primary'].text,
                  }}
                >
                  <div className='font-bold text-xl'>{pointer.text}</div>

                  <div>▼</div>
                </div>
              ))}
            </div>

            <div
              className='flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-white'
              style={{
                borderColor: style?.border ?? '#d6d3d1',

                background: style?.bg,
              }}
            >
              <span
                className='font-bold text-xl'
                style={{
                  color: style?.text,
                }}
              >
                {value as string}
              </span>
            </div>

            <div className='mt-3 text-2xl text-stone-500'>{index}</div>
          </div>
        )
      })}
    </div>
  )
}

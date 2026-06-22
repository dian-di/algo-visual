import DFSDemo from '@/components/algo/dfs'
import DijkstraDemo from '@/components/algo/dijkstra'
import QuickSortDemo from '@/components/algo/quick-sort'
import TwoSumDemo from '@/components/leetcode_new/lc_1'
import RemoveElementDemo from '@/components/leetcode_new/lc_27'
import MergeSortedArrayDemo from '@/components/leetcode_new/lc_88'
import HttpShakeDemo from '@/components/flow/http_shake'
import MermaidShake from '@/components/flow/http_shake/MermaidShake'

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div className='grid grid-cols-3 gap-4'>
        <div>
          <QuickSortDemo />
        </div>
        <div>
          <DFSDemo />
        </div>
        <div>
          <DijkstraDemo />
        </div>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div>
          <TwoSumDemo />
        </div>
        <div>
          <MergeSortedArrayDemo />
        </div>
        <div>
          <RemoveElementDemo />
        </div>
      </div>

      <div className='mt-8'>
        <h2 className='mb-4 font-bold text-xl'>Flow Engine</h2>
        <div className='grid grid-cols-2 gap-6'>
          <div>
            <HttpShakeDemo />
          </div>
          <div>
            <MermaidShake />
          </div>
        </div>
      </div>
    </div>
  )
}

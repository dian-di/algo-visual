import TwoSum from '@/components/leetcode/lc_1'
import RemoveElement from '@/components/leetcode/lc_27'
export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <div className='grid grid-cols-3 gap-4'>
        <div>
          <TwoSum />
        </div>
        <div>
          <RemoveElement />
        </div>
        <div>
          <TwoSum />
        </div>
      </div>
    </div>
  )
}

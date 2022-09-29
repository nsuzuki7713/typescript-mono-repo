import { useState } from 'react'

type CounterProps = {
  initialValue: number
}

const Counter = (props: CounterProps) => {
  const { initialValue } = props

  // カウントを保持する一つの状態をuseState()で宣言する
  // countが現在の状態、setCountが状態を更新する関数
  const [count, setCount] = useState(initialValue)

  return (
    <div>
      <p>Count: {count}</p>
      {/* setCountを呼ぶことで更新する */}
      <button onClick={()=> setCount(count - 1)}>-</button>
      <button onClick={()=> setCount((prevCount) => prevCount + 1)}>+</button>
    </div>
  )
}

export default Counter
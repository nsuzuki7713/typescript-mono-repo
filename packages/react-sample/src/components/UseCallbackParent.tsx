import React, {useState, useCallback} from "react";

type ButtonProps = {
  onClick: () => void
}

// DecrementButtonは通常の関数コンポーネントでボタンを表示する
const DecrementButton = (props: ButtonProps) => {
  const {onClick} = props;

  console.log('DecrementButtonが再描画されました');

  return <button onClick={onClick}>Decrement</button>
}

// IncrementButtonはメモ化した関数コンポーネントでボタンを表示する。
const IncrementButton = React.memo((props: ButtonProps) => {
  const {onClick} = props;

  console.log('IncrementButtonが再描画されました');

  return <button onClick={onClick}>Increment</button>
})

// DoubleButtonはメモ化した関数コンポーネントでボタンを表示する。
const DoubleButton = React.memo((props: ButtonProps) => {
  const {onClick} = props;

  console.log('DoubleButtonが再描画されました');

  return <button onClick={onClick}>Double</button>
})

export const Parent2 = () => {
  const [count, setCount] = useState(0);

  const decrement = () => {
    setCount(c => count - 1);
  }
  const increment = () => {
    setCount(c => count + 1);
  }
  // useCallbackを使って関数をメモ化する
  const double = useCallback(() => {
    setCount((c) => c * 2)
    // 第2引数は空配列なので、useCallbackは常に同じ関数を返す
  }, [])

  return (
    <div>
      <p>Count: {count}</p>
      {/* コンポーネントに関数を渡す */}
      <DecrementButton onClick={decrement}/>
      {/* メモ化コンポーネントに関数を渡す */}
      <IncrementButton onClick={increment}/>
      {/* メモ化コンポーネントにメモ化した関数を渡す */}
      <DoubleButton onClick={double}/>
    </div>
  )
}
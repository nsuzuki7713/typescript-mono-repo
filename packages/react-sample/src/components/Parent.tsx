import React, {memo, useState} from "react";

type FizzProps = {
  isFizz: boolean
}

// Fizzは通常の関数コンポーネント
// isFizzがtrueの場合はFizzと表示し、それ以外は何も表示しない
// idFizzの変化に関わらず、親が再描画されるとFizzも再描画される
const Fizz = (props: FizzProps) => {
  const {isFizz} = props;
  console.log(`Fizzが再描画されまたした, isFizz=${isFizz}`)
  return <span>{isFizz ? 'Fizz' : ''}</span>
}

type BuzzProps = {
  isBuzz: boolean
  // propsにonClickを追加 
  onClick: () => void
}

// Buzzはメモ化した関数コンポーネント
// isBuzzがtrueの場合はBuzzと表示し、それ以外は何も表示しない
// 親コンポーネントが再描画されても、isBuzzが変化しない限りは再描画されない
const Buzz = memo<BuzzProps>((props) => {
  const {isBuzz, onClick} = props;
  console.log(`Buzzが再描画されました, isBuzz=${isBuzz}`)
  return (
    <span onClick={onClick}>{isBuzz ? 'Buzz':''}</span>
  )
})

export const ParentMemo = () => {
  const [count, setCount] = useState(1);
  const isFizz = count % 3 === 0;
  const isBuzz = count % 5 === 0;

  const onBuzzClick = () => {
    console.log(`Buzzがクリックされました, count=${count}`)
  }
  console.log(`Parentが再描画されました, count=${count}`)

  return (
    <div>
      <button onClick={() => setCount((c) => c +1 )}>+1</button>
      <p>{`現在のカウント: ${count}`}</p>
      <p>
        <Fizz isFizz={isFizz}/>
        <Buzz isBuzz={isBuzz} onClick={onBuzzClick}/>
      </p>
    </div>
  )
}
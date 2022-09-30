import React ,{useState, useMemo} from "react";

export const UseMemoSample = () => {
  // textは現在のテキストボックスの中身の値を保持する
  const [text, setText] = useState('')
  // itemsは文字列のリストを保持する
  const [items, setItems] = useState<string[]>([])

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  // ボタンをクリックした時に呼ばれる関数
  const onClickButton = ()  => {
    setItems((prevItems) => {
      // 現在の入力値をitemsに追加する。
      return [...prevItems, text]
    })

    setText('')
  }

  const numberOfCharacters1 = items.reduce((sub, item) => sub + item.length, 0)
  const numberOfCharacters2 = useMemo(() => {
    return items.reduce((sub, item) => sub + item.length,0)
    // itemsが新しくなった時だけ関数を実行してメモを更新する。
  }, [items])

  return (
    <div>
      <p>UseMemoSample</p>
      <div>
        <input value={text} onChange={onChangeInput} />
        <button onClick={onClickButton}>Add</button>
      </div>
      <div>
        {items.map((item, index) => (
          <p key={index}>{item}</p>
        ))}
      </div>
      <div>
        <p>Total Number of Characters 1: {numberOfCharacters1}</p>
        <p>Total Number of Characters 2: {numberOfCharacters2}</p>
      </div>
    </div>
  )
}
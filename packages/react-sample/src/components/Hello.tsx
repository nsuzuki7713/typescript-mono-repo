// Helloはクリックするとアラートを出すテキストを返す
const Hello = () => {
  // クリック時に呼ばれる関数
  const onClick = () => {
    // アラートを出す
    alert('Hello');
  }
  const text = 'Hello, React'

  const name = 'React'
  // テキストを子に持つdivを返す
  return (
    <div onClick={onClick}>
      {text}
      <div>こんにちは、{name}さん</div>
    </div>
  )
}

export default Hello
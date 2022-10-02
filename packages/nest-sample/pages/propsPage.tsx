import { NextPage } from 'next'
import styled from 'styled-components';

type ButtonProps = {
  color: string;
  backgroundColor: string;
}

// 文字色と背景色がpropsから変更可能なボタンコンポーネント
// 型引数にpropsの型を渡す
const Button = styled.button<ButtonProps>`
  /* color, background, border-colorはpropsから渡す */
  color: ${(props) => props.color};
  background: ${(props) => props.backgroundColor};
  border: 2px solid ${(props) => props.color};

  font-size: 2em;
  margin: 1em;
  padding: 0.25em 1em;
  border-radius: 8px;
  cursor: pointer;
`

const Page: NextPage = () => {
  return (
    <div>
      <Button backgroundColor='transparent' color='#FF0000'>Hello</Button>
      <Button backgroundColor='#1E90FF' color='white'>WORLD</Button>
    </div>
  )
}

export default Page
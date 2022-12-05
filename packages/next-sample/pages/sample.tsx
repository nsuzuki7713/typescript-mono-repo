import Link from 'next/link'
import { useRouter } from 'next/router'

const Sample = () => {
  const router = useRouter();

  const onSubmit = () => {
    router.push('/ssr');
  }

  return (
    <div>
      <span>サンプルページです</span>
      <div>
        {/* /ssrへ遷移するためのリンクを作成する */}
        <Link href="/ssr">
          <a>Go TO SSR</a>
        </Link>
      </div>

      <div>
        {/* hrefに文字列を指定する代わりにオブジェクトを指定できる */}
        <Link href={{
          pathname: '/ssr',
          query: { keyword: 'hello' }
        }}>
          <a>GO TO SSG2</a>
        </Link>
      </div>

      <div>
        <Link href="/ssg">
          {/* aの代わりにbuttonを使うと、onClickが呼ばれたタイミングで遷移する */}
          <button>Jump to SSG page</button>
        </Link>
      </div>

      <div>
        <button onClick={onSubmit}>Jump to SSG page on Change</button>
      </div>
    </div>
  )
}

export default Sample

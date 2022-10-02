import { GetStaticProps,NextPage, NextPageContext} from 'next';
import Head from 'next/head';

// ページコンポーネントのpropsの型定義
type SSGProps = {
  message: string;
}

// SSG向けのページを実装
// NextPageはNext.jsのPage向けの型
// NextPage<props>でpropsが入るPageであることを明示
const SSG: NextPage<SSGProps> = (props) => {
  const {message} = props;

  return (
    <div>
      {/* Headコンポーネントで包むと、その要素は<head>タグに配置される */}
      <Head>
        <title>Static Site Generation</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <p>
          このページは静的サイト生成によってビルド時に生成されたページです。
        </p>
        <p>{message}</p>
      </main>
    </div>
  )
}

// getStaticPropsはビルド時に実行される
export const getStaticProps: GetStaticProps = async (context) => {
  const timestamp = new Date().toLocaleDateString()
  const message = `${timestamp}にgetStaticPropsが実行されました。`
  console.log(message)

  return {
    // ここで返したpropsを元にページコンポーネントを描画する
    props: {
      message,
    }
  }
}

export default SSG
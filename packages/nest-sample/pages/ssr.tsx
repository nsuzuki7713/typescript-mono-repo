import { GetServerSideProps, NextPage } from "next";
import Head from 'next/head'

type SSRProps = {
  message: string;
}

const SSR: NextPage<SSRProps> = (props) => {
  const { message } = props;

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <p>
          このページはサーバサイドレンダリングによってアクセス時にサーバーで描画されたページです。
        </p>
        <p>{message}</p>
      </main>
    </div>
  )
}

// getServerSidePropsはページへの陸セストがある度に実行される
// contextはリクエスト情報を参照することができる
export const getServerSideProps: GetServerSideProps<SSRProps> = async (context) => {
  const timestamp = new Date().toISOString()
  const message = `${timestamp}にgetServerSidePropsが実行されました。`
  console.log(message)

  return {
    props: {
      message,
    }
  }
}

export default SSR
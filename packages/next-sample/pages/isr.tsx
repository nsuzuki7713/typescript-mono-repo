import { GetStaticPaths, NextPage, GetStaticProps } from "next";
import Head from 'next/head'
import { useRouter } from "next/router";

type ISRProps = {
  message: string;
}

// ISRPropsを受け付けるNextPageの型
const ISR: NextPage<ISRProps> = (props) => {
  const { message } = props;

  const router = useRouter();

  if(router.isFallback) {
    // フォールバック用のページを返す
    return <div>Loading...</div>
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <p>
          このページはISRによってアクセス時にサーバーで描画されたページです。
        </p>
        <p>{message}</p>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps<ISRProps> = async (context) => {
  const timestamp = new Date().toISOString()
  const message = `${timestamp}にこのページのgetStaticPropsが実行されました。`
  console.log(message)

  return {
    props: {
      message,
    },
    // ページの有効期限を秒単位で指定
    revalidate: 60
  }
}

export default ISR
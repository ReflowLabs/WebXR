import Head from 'next/head'

import dynamic from 'next/dynamic'

// we load dynamically to prevent server side rendering
const Pong = dynamic(() => import('../components/Pong'), { ssr: false })

export default function Index() {
  return (
    <>
      <Head>
        <title>Pong Demo</title>
      </Head>
      <Pong />
    </>
  )
}

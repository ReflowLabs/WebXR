import Head from 'next/head'

import dynamic from 'next/dynamic'

// we load dynamically to prevent server side rendering
const Test = dynamic(() => import('../components/Test'), { ssr: false })

export default function Index() {
  return (
    <>
      <Head>
        <title>Hands Demo</title>
      </Head>
      <Test />
    </>
  )
}

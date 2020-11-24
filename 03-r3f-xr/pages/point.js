import Head from 'next/head'

import dynamic from 'next/dynamic'

// we load dynamically to prevent server side rendering
const Point = dynamic(() => import('../components/Point'), { ssr: false })

export default function Index() {
  return (
    <>
      <Head>
        <title>Point Demo</title>
      </Head>
      <Point />
    </>
  )
}

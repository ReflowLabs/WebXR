import Head from "next/head";
import dynamic from "next/dynamic";

const App = dynamic(() => import("../components/App"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>next-react-babylonjs-starter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App />
    </>
  );
}

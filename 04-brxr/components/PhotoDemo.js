import dynamic from 'next/dynamic';

// we load dynamically to prevent server side rendering
const Photo = dynamic(() => import('./Photo'), { ssr: false });

function PhotoDemo() {
  return <Photo />;
}

export default PhotoDemo;

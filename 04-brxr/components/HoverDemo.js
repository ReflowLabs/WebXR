import dynamic from 'next/dynamic';

// we load dynamically to prevent server side rendering
const World = dynamic(() => import('./World'), { ssr: false });

function HoverDemo() {
  return <World />;
}

export default HoverDemo;

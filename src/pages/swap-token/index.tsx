import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

export default function SwapPage() {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header isLanding={false} />

      <Navbar />

      {/* Token Creation Form */}
      <div className='mx-auto max-w-2xl px-4 py-20'>
        <h1 className='mb-8 text-4xl font-bold'>Swap Tokens</h1>
        <p className='mb text-xl'>Comming soon...2</p>
      </div>

      <Footer />
    </div>
  );
}

import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

export default function LiquidityPage() {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header isLanding={false} />

      <Navbar />

      {/* Token Creation Form */}
      <div className='max-w-2xl mx-auto py-20 px-4'>
        <h1 className='text-4xl font-bold mb-8'>Create Your Liquidity</h1>
        <p className='text-xl mb'>Comming soon...</p>
      </div>

      <Footer />
    </div>
  );
}

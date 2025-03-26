import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className='bg-gray-800 p-4'>
      <div className='container mx-auto flex flex-col items-center justify-center md:flex-row'>
        <div className='flex items-center space-x-8'>
          <Link
            href='/'
            className='flex flex-row items-center gap-2 text-2xl font-bold text-white'
          >
            <Image
              alt='swap-forge-logo'
              src={'/images/swap-forge.png'}
              width={120}
              height={120}
            />
            SwapForge
          </Link>
          <div className='hidden space-x-6 md:flex'>
            <Link
              href='/create-token'
              className={` hover:text-white ${
                router.pathname === '/create-token'
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              Create Token
            </Link>
            <Link
              href='/liquidity'
              className={` hover:text-white ${
                router.pathname === '/liquidity'
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              Liquidity
            </Link>
            <Link
              href='/swap-token'
              className={` hover:text-white ${
                router.pathname.includes('/swap-token')
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              Swap Token
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

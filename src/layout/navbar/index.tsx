import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/swap-forge.png';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  
  return (
    <nav className='bg-gray-800 p-4'>
      <div className='container mx-auto flex justify-between items-center'>
        <div className='flex items-center space-x-8'>
          <Link
            href='/'
            className='text-white text-2xl font-bold flex flex-row items-center gap-2'
          >
            <Image alt='swap-forge-logo' src={logo} width={120} height={120} />
            SwapForge
          </Link>
          <div className='hidden md:flex space-x-6'>
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
              href='/swap'
              className={` hover:text-white ${
                router.pathname === '/swap'
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              Swap
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

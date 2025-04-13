import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className='border-b border-gray-700 bg-gray-800 py-3'>
      <div className='container mx-auto flex flex-col items-center md:flex-row md:justify-center md:gap-9 md:px-4'>
        <div className='mb-2 flex items-center md:mb-0'>
          <Link href='/' className='flex items-center gap-2'>
            <Image
              alt='swap-forge-logo'
              src='/images/swap-forge.png'
              width={80}
              height={80}
              className='h-8 w-auto'
            />
            <span className='text-xl font-bold text-white'>SwapForge</span>
          </Link>
        </div>

        <div className='flex w-full justify-center space-x-4 overflow-x-auto py-1 md:w-auto md:space-x-5 md:py-0'>
          <Link
            href='/create-token'
            className={`whitespace-nowrap px-2 text-sm font-medium transition-colors hover:text-white ${
              router.pathname === '/create-token' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Create Token
          </Link>
          <Link
            href='/liquidity'
            className={`whitespace-nowrap px-2 text-sm font-medium transition-colors hover:text-white ${
              router.pathname === '/liquidity' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Liquidity
          </Link>
        </div>
      </div>
    </nav>
  );
}

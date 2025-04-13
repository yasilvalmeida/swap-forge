interface IProp {
  isLanding: boolean;
  title?: string;
  subtitle?: string;
}

const Header = ({ isLanding, title, subtitle }: IProp) => {
  return (
    <section className='relative bg-gradient-to-r from-purple-800 to-indigo-900 py-20 text-center'>
      <div className='bg-noise absolute inset-0 opacity-10' />
      {title ? (
        <h1 className='mb-3 text-4xl font-bold md:text-5xl'>{title}</h1>
      ) : (
        <h1 className='mb-3 text-4xl font-bold md:text-5xl'>
          Welcome to <span className='text-yellow-400'>SwapForge</span>
        </h1>
      )}
      {isLanding ? (
        <>
          <p className='mb-8 text-xl'>
            The ultimate Solana dApp for token creation, swapping, and liquidity
            management.
          </p>
          <a
            href='#features'
            className='rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-gray-900 transition duration-300 hover:bg-yellow-500'
          >
            Explore Features
          </a>
        </>
      ) : (
        <p className='mx-auto max-w-2xl text-xl text-purple-100'>{subtitle}</p>
      )}
    </section>
  );
};

export default Header;
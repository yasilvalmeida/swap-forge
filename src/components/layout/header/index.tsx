interface IProp {
  isLanding: boolean;
  title?: string;
  subtitle?: string;
}

const Header = ({ isLanding, title, subtitle }: IProp) => {
  return (
    <section className='py-20 text-center bg-gradient-to-r from-purple-800 to-indigo-900'>
      {title ? (
        <h1 className='mb-4 text-4xl font-bold'>{title}</h1>
      ) : (
        <h1 className='mb-4 text-5xl font-bold'>
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
            className='px-6 py-3 font-semibold text-gray-900 transition duration-300 bg-yellow-400 rounded-lg hover:bg-yellow-500'
          >
            Explore Features
          </a>
        </>
      ) : (
        <p className='text-xl'>{subtitle}</p>
      )}
    </section>
  );
};

export default Header;

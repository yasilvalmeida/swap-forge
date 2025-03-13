interface IProp {
  isLanding: boolean;
  title?: string;
  subtitle?: string;
}

const Header = ({ isLanding, title, subtitle }: IProp) => {
  return (
    <section className='text-center py-20 bg-gradient-to-r from-purple-800 to-indigo-900'>
      {title ? (
        <h1 className='text-4xl font-bold mb-4'>Create Your Token</h1>
      ) : (
        <h1 className='text-5xl font-bold mb-4'>
          Welcome to <span className='text-yellow-400'>SwapForge</span>
        </h1>
      )}
      {isLanding ? (
        <>
          <p className='text-xl mb-8'>
            The ultimate Solana dApp for token creation, swapping, and liquidity
            management.
          </p>
          <a
            href='#features'
            className='bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition duration-300'
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

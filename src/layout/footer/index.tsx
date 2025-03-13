const Footer = () => {
  return (
    <footer className='py-6 text-center bg-gray-800'>
      <p className='text-gray-300'>
        &copy; {new Date().getFullYear()} SwapForge. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

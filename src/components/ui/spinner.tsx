import React from 'react';
import { ClipLoader } from 'react-spinners';

const Spinner = () => {
  return (
    <div className='flex items-center justify-center'>
      <ClipLoader size={30} color='#000000' />
    </div>
  );
};

export default Spinner;

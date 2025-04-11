import React from 'react';
import { ClipLoader } from 'react-spinners';

interface ISpinnerProps {
  color?: string
}

const Spinner = ({ color }: ISpinnerProps) => {
  return (
    <div className='flex items-center justify-center'>
      <ClipLoader size={30} color={color ?? '#000000'} />
    </div>
  );
};

export default Spinner;

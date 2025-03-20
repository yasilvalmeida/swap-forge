import React from 'react';

const SupportLink = () => {
  return (
    <div className='rounded-lg bg-white p-2 text-sm text-gray-600 shadow-md'>
      For assistance, please contact us at{' '}
      <a
        href='mailto:support@swapforge.app'
        className='text-blue-500 hover:text-blue-700'
      >
        support@swapforge.app
      </a>
      .
    </div>
  );
};

export default SupportLink;

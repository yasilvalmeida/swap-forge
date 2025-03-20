import React from 'react';

const AffiliateProgram = () => {
  return (
    <div className=''>
      <div className='text-left'>
        <p className='text-sm'>
          Earn generous commissions by referring others to our platform! The
          more referrals you bring, the higher your earnings. Here’s how it
          works:
        </p>
      </div>

      <div className='mx-auto mt-4 text-sm'>
        <div className='space-y-4'>
          {/* Step 1: Create Your Token */}
          <div className='rounded-lg bg-white p-3 shadow-md'>
            <h3 className='text-xl font-semibold text-gray-900'>
              1. Create Your First Token
            </h3>
            <p className='mt-2 text-gray-600'>
              To get started, you’ll need to create your first token. Once your
              token is created, you’ll receive your unique referral code. You
              can find on your wallet menu.
            </p>
          </div>

          {/* Step 2: 3 or More Referrals */}
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='text-xl font-semibold text-gray-900'>
              3+ Referrals
            </h3>
            <p className='mt-2 text-gray-600'>
              Earn{' '}
              <span className='font-bold text-green-600'>10% commission</span>{' '}
              for every successful referral when you refer 3 or more people.
            </p>
          </div>

          {/* Step 3: 10 or More Referrals */}
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='text-xl font-semibold text-gray-900'>
              10+ Referrals
            </h3>
            <p className='mt-2 text-gray-600'>
              Boost your earnings to{' '}
              <span className='font-bold text-green-600'>20% commission</span>{' '}
              when you reach 10 or more successful referrals.
            </p>
          </div>

          {/* Step 4: 25 or More Referrals */}
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='text-xl font-semibold text-gray-900'>
              4. 25+ Referrals
            </h3>
            <p className='mt-2 text-gray-600'>
              Unlock our highest tier and earn an impressive{' '}
              <span className='font-bold text-green-600'>50% commission</span>{' '}
              for 25 or more successful referrals.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className='mt-4 text-center'>
        <p className='text-sm'>
          Start earning today by becoming a part of our growing affiliate
          community!
        </p>
      </div>
    </div>
  );
};

const AffiliateProgramResume = () => {
  return (
    <div className='flex items-center justify-center'>
      <div className='overflow-hidden rounded-lg bg-white shadow-md'>
        <table className='min-w-full'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='text-xs px-6 py-1 text-left font-medium uppercase tracking-wider text-gray-500'>
                Referrals
              </th>
              <th className='text-xs px-6 py-1 text-left font-medium uppercase tracking-wider text-gray-500'>
                Discount
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            <tr>
              <td className='whitespace-nowrap px-6 py-1 text-sm font-medium text-gray-900'>
                3+
              </td>
              <td className='whitespace-nowrap px-6 py-1 text-sm text-gray-500'>
                10%
              </td>
            </tr>
            <tr>
              <td className='whitespace-nowrap px-6 py-1 text-sm font-medium text-gray-900'>
                10+
              </td>
              <td className='whitespace-nowrap px-6 py-1 text-sm text-gray-500'>
                20%
              </td>
            </tr>
            <tr>
              <td className='whitespace-nowrap px-6 py-1 text-sm font-medium text-gray-900'>
                25+
              </td>
              <td className='whitespace-nowrap px-6 py-1 text-sm text-gray-500'>
                50%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { AffiliateProgram, AffiliateProgramResume };

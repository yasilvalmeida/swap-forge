'use client'; // Required for client-side interactivity

import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with required plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);

interface IPromotionCountDownProps {
  endDate: string;
  realPrice: number;
  discount: number;
}

export default function PromotionCountdown({
  endDate,
  realPrice,
  discount,
}: IPromotionCountDownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const tokenPrice = useMemo(() => {
    const price = realPrice - realPrice * discount;
    return price.toFixed(2);
  }, [discount, realPrice]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = dayjs();
      const diff = dayjs(endDate).diff(now);

      if (diff <= 0) {
        clearInterval(timer);
        return;
      }

      const durationObj = dayjs.duration(diff);
      setTimeLeft({
        days: durationObj.days(),
        hours: durationObj.hours(),
        minutes: durationObj.minutes(),
        seconds: durationObj.seconds(),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className='rounded-lg bg-slate-700 p-4 text-center text-indigo-200'>
      <h2 className='mb-2 text-xl font-bold'>
        🚨 FLASH PROMOTION: {discount * 100}% OFF! 🚨
      </h2>
      <p className='text-lg mb-1 text-center text-indigo-200'>
        Hurry up
        <span className='font-semibold'>
          {' - '} offer expires {dayjs(endDate).format('dddd, MMMM D, YYYY')}!
        </span>
      </p>
      <p className='text-lg text-center text-indigo-200'>
        Create your own token
      </p>
      <p className='text-lg mb-6 text-center text-indigo-200'>
        Just <span className='font-semibold'>{tokenPrice}SOL</span>
      </p>
      <div className='flex flex-col items-center justify-center rounded-xl bg-slate-700 shadow-lg transition-shadow hover:shadow-xl'>
        <div className='mb-4 flex gap-3'>
          <div className='min-w-[70px] rounded-lg bg-red-100 p-3 text-center'>
            <div className='text-3xl font-black text-red-600'>
              {timeLeft.days}
            </div>
            <div className='text-xs uppercase tracking-wider text-red-800'>
              Days
            </div>
          </div>

          <div className='min-w-[70px] rounded-lg bg-amber-100 p-3 text-center'>
            <div className='text-3xl font-black text-amber-600'>
              {timeLeft.hours}
            </div>
            <div className='text-xs uppercase tracking-wider text-amber-800'>
              Hours
            </div>
          </div>

          <div className='min-w-[70px] rounded-lg bg-yellow-100 p-3 text-center'>
            <div className='text-3xl font-black text-yellow-600'>
              {timeLeft.minutes}
            </div>
            <div className='text-xs uppercase tracking-wider text-yellow-800'>
              Minutes
            </div>
          </div>

          <div className='min-w-[70px] animate-pulse rounded-lg bg-green-100 p-3 text-center'>
            <div className='text-3xl font-black text-green-600'>
              {timeLeft.seconds}
            </div>
            <div className='text-xs uppercase tracking-wider text-green-800'>
              Seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

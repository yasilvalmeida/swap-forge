'use client'; // Required for Chart.js in Next.js 13+

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useMemo } from 'react';
import { TimeRangeDTO, TokenWalletStatsDto } from '@/lib/models/stats';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StatsChartProps {
  tokenAcounts: TokenWalletStatsDto[];
  timeRange: TimeRangeDTO;
}

const StatsChart = ({ tokenAcounts, timeRange }: StatsChartProps) => {
  const today = useMemo(() => dayjs(), []);
  const getDataForRange = (range: string) => {
    let days = 0;
    let months = 0;
    let labels: string[];
    let wallets: number[];
    let tokens: number[];
    let uniqueWallets: Set<string>[];
    switch (range) {
      case '7D':
        days = 7;
        labels = Array.from({ length: days }, (_, i) => {
          const date = today.subtract(days - 1 - i, 'day');
          return i === days - 1 ? 'Today' : date.format('MMM D');
        });
        wallets = new Array(days).fill(0);
        tokens = new Array(days).fill(0);
        uniqueWallets = new Array(days).fill(new Set());
        tokenAcounts.forEach((item) => {
          const createdAt = dayjs(item.createdAt);
          const daysDiff = today.diff(createdAt, 'day');
          if (daysDiff >= 0 && daysDiff < days) {
            const dayIndex = days - 1 - daysDiff;
            tokens[dayIndex]++;
            if (!uniqueWallets[dayIndex].has(item.wallet)) {
              uniqueWallets[dayIndex] = new Set([
                ...uniqueWallets[dayIndex],
                item.wallet,
              ]);
              wallets[dayIndex] = uniqueWallets[dayIndex].size;
            }
          }
        });
        return {
          labels,
          wallets,
          tokens,
        };
      case '30D':
        days = 30;
        labels = Array.from({ length: days }, (_, i) => {
          const date = today.subtract(days - 1 - i, 'day');
          return i === days - 1 ? 'Today' : date.format('MMM D');
        });
        wallets = new Array(days).fill(0);
        tokens = new Array(days).fill(0);
        uniqueWallets = new Array(days).fill(new Set());
        tokenAcounts.forEach((item) => {
          const createdAt = dayjs(item.createdAt);
          const daysDiff = today.diff(createdAt, 'day');
          if (daysDiff >= 0 && daysDiff < days) {
            const dayIndex = days - 1 - daysDiff;
            tokens[dayIndex]++;
            if (!uniqueWallets[dayIndex].has(item.wallet)) {
              uniqueWallets[dayIndex] = new Set([
                ...uniqueWallets[dayIndex],
                item.wallet,
              ]);
              wallets[dayIndex] = uniqueWallets[dayIndex].size;
            }
          }
        });
        return {
          labels,
          wallets,
          tokens,
        };
      case '90D':
        months = 3;
        labels = Array.from({ length: months }, (_, i) => {
          const date = today.subtract(months - 1 - i, 'month');
          return i === months - 1 ? 'Actual' : date.format('MMM D');
        });
        wallets = new Array(months).fill(0);
        tokens = new Array(months).fill(0);
        uniqueWallets = new Array(months).fill(new Set());
        tokenAcounts.forEach((item) => {
          const createdAt = dayjs(item.createdAt);
          const monthsDiff = today.diff(createdAt, 'months');
          if (monthsDiff >= 0 && monthsDiff < months) {
            const monthIndex = months - 1 - monthsDiff;
            tokens[monthIndex]++;
            if (uniqueWallets && !uniqueWallets[monthIndex].has(item.wallet)) {
              uniqueWallets[monthIndex] = new Set([
                ...uniqueWallets[monthIndex],
                item.wallet,
              ]);
              wallets[monthIndex] = uniqueWallets[monthIndex]?.size;
            }
          }
        });
        return {
          labels,
          wallets,
          tokens,
        };
      default:
        months = 12;
        labels = Array.from({ length: months }, (_, i) => {
          const date = today.subtract(months - 1 - i, 'month');
          return i === months - 1 ? 'Actual' : date.format('MMM D');
        });
        wallets = new Array(months).fill(0);
        tokens = new Array(months).fill(0);
        uniqueWallets = new Array(months).fill(new Set());
        tokenAcounts.forEach((item) => {
          const createdAt = dayjs(item.createdAt);
          const monthsDiff = today.diff(createdAt, 'months');
          if (monthsDiff >= 0 && monthsDiff < months) {
            const monthIndex = months - 1 - monthsDiff;
            tokens[monthIndex]++;
            if (uniqueWallets && !uniqueWallets[monthIndex].has(item.wallet)) {
              uniqueWallets[monthIndex] = new Set([
                ...uniqueWallets[monthIndex],
                item.wallet,
              ]);
              wallets[monthIndex] = uniqueWallets[monthIndex]?.size;
            }
          }
        });
        return {
          labels,
          wallets,
          tokens,
        };
    }
  };

  const { labels, wallets, tokens } = getDataForRange(timeRange);

  const data = {
    labels,
    datasets: [
      {
        label: 'Wallets Connected',
        data: wallets,
        borderColor: 'rgb(234, 179, 8)', // yellow-400
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Tokens Created',
        data: tokens,
        borderColor: 'rgb(139, 92, 246)', // purple-500
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(209, 213, 219)',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.5)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: {
          color: 'rgba(75, 85, 99, 0.5)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
          color: 'rgba(75, 85, 99, 0.5)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
    maintainAspectRatio: false,
  };

  return <Line data={data} options={options} />;
};

export default StatsChart;

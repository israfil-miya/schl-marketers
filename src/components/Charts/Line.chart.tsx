import React from 'react';
import cn from '@/utility/cn';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartOptions, ChartData } from 'chart.js';

// Registering the datalabels plugin
import { Chart as ChartJS } from 'chart.js/auto';
ChartJS.register(ChartDataLabels);

interface LineChartProps {
  chartData: ChartData<'line'>;
  showLegend?: boolean;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  chartData,
  showLegend,
  className,
}) => {
  const options: ChartOptions<'line'> = {
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value) => Math.round(value as number),
        font: {
          weight: 'bold',
        },
      },
      legend: {
        position: 'bottom',
        display: showLegend === undefined ? true : showLegend,
        labels: {
          font: {
            weight: 'bold',
            size: 15,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Math.round(value as number),
        },
      },
    },
    layout: {
      padding: {
        top: 50,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className={cn(`h-96`, className)}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;

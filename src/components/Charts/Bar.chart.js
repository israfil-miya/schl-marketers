import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(ChartDataLabels);

function BarChart({ chartData, title }) {
  const options = {
    clip: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => Math.round(value),
        },
      },
    },
    layout: {
      padding: {
        top: 50,
      },
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: Math.round,
        font: {
          weight: 'bold',
        },
      },
      legend: {
        position: 'bottom',
        display: chartData.showLegend,
        labels: {
          font: {
            weight: 'bold',
            size: 15,
          },
        },
      },
    },
  };

  return (
    <>
      <div className="pb-5 chart-container p-3 bg-light shadow-sm rounded border flex justify-center">
        {title && <p className="font-semibold text-center">{title}</p>}
        <Bar options={options} data={chartData} />
      </div>
      <style jsx>
        {`
          .chart-container canvas {
            box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.8);
          }
          .chart-container {
            height: 300px !important;
          }
        `}
      </style>
    </>
  );
}

export default BarChart;

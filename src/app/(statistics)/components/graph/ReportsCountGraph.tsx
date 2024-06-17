'use client';

import React, { useState, useEffect } from 'react';
import LineChart from '@/components/Charts/Line.chart';

interface ReportsCountGraphProps {
  isLoading: boolean;
  data: { [key: string]: number };
  className?: string;
}

interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    type: 'line';
    order: number;
  }[];
}

const ReportsCountGraph: React.FC<ReportsCountGraphProps> = ({
  isLoading,
  data,
  className,
}) => {
  const [graphData, setGraphData] = useState<LineChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const dataLabels: string[] = Object.keys(data).map(
      (monthName) =>
        monthName.charAt(0).toUpperCase() +
        monthName.replace('_', ' ').slice(1),
    );

    setGraphData({
      labels: dataLabels,
      datasets: [
        {
          label: 'Reports Count',
          data: Object.values(data),
          backgroundColor: '#466cdb',
          borderColor: 'black',
          borderWidth: 2,
          type: 'line',
          order: 0,
        },
      ],
    });
  }, [data]);

  return (
    <div>
      {isLoading ? <p className="text-center">Loading...</p> : null}
      {!isLoading && (
        <LineChart
          className={className || ''}
          chartData={graphData}
          showLegend={false}
        />
      )}
    </div>
  );
};

export default ReportsCountGraph;

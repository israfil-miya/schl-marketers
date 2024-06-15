'use client';

import React, { useState, useEffect } from 'react';
import LineChart from '@/components/Charts/Line.chart';

interface TestParticipationRatesGraphProps {
  isLoading: boolean;
  data: { [key: string]: number };
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

const TestParticipationRatesGraph: React.FC<
  TestParticipationRatesGraphProps
> = ({ isLoading, data }) => {
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
          label: 'Test Participation Rate',
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
      {!isLoading && <LineChart chartData={graphData} showLegend={false} />}
    </div>
  );
};

export default TestParticipationRatesGraph;

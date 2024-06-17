'use client';

import React, { useState, useEffect } from 'react';
import BarChart from '@/components/Charts/Bar.chart';
import generateBackgroundColors from '@/utility/generatecolorsforchart';

interface TestOrdersTrendGraphProps {
  isLoading: boolean;
  data: { [key: string]: number };
  className?: string;
}

interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    type: 'bar';
    order: number;
  }[];
}

const TestOrdersTrendGraph: React.FC<TestOrdersTrendGraphProps> = ({
  isLoading,
  data,
  className,
}) => {
  const [graphData, setGraphData] = useState<BarChartData>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const dataLabels: string[] = Object.keys(data).map(
      (monthName) =>
        monthName.charAt(0).toUpperCase() +
        monthName.replace('_', ' ').slice(1),
    );

    // alternating colors
    const evenYearColor = '#4169e1'; // Blue for even years
    const oddYearColor = '#ffad33'; // Orange for odd years

    const backgroundColors = generateBackgroundColors(
      data,
      evenYearColor,
      oddYearColor,
    ) as any;

    setGraphData({
      labels: dataLabels,
      datasets: [
        {
          label: 'Test Orders',
          data: Object.values(data),
          backgroundColor: backgroundColors, // array of colors
          borderColor: 'black',
          borderWidth: 2,
          type: 'bar',
          order: 0,
        },
      ],
    });
  }, [data]);

  return (
    <div>
      {isLoading ? <p className="text-center">Loading...</p> : null}
      {!isLoading && (
        <BarChart
          className={className || ''}
          chartData={graphData}
          showLegend={false}
        />
      )}
    </div>
  );
};

export default TestOrdersTrendGraph;

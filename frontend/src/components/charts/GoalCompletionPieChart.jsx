import React, { useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GoalCompletionPieChart = ({ data }) => {
  // Check if there's no goal data
  const hasData = data.completed > 0 || data.pending > 0;

  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [data.completed, data.pending],
        backgroundColor: ['#8B6A3B', '#C2B280'], // Muted Brown and Khaki
        hoverBackgroundColor: ['#7A5733', '#A89F72'], // Darker Brown and Khaki for hover
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw} goals`,
        },
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
          color: '#374151', // Dark gray text for legend
        },
      },
    },
  };

  useEffect(() => {
    return () => {
      // Chart.js handles cleanup automatically for react-chartjs-2
    };
  }, []);

  return (
    <div className="relative mx-auto items-center w-2/3 md:w-90 h-60 md:h-80">
      {hasData ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <div className="text-gray-500 text-center">
          No goals data available
        </div>
      )}
    </div>
  );
};

export default GoalCompletionPieChart;

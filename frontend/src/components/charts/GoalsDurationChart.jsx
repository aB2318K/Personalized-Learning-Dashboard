import React from 'react';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GoalsDurationChart = ({ goals = [] }) => {
  if (!goals.length) {
    return <div className="text-gray-500 text-center">No goals data available.</div>;
  }

  const labels = goals.map((goal) => goal.name);

  // Helper function to calculate the number of weeks between two dates
  const calculateWeeks = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDifference = endDate - startDate;
    const days = timeDifference / (1000 * 3600 * 24);
    const weeks = Math.ceil(days / 7); // Round up to the nearest week
    return weeks;
  };

  // Calculate the actual duration (from createdAt to completedAt) in weeks
  const actualDurations = goals.map((goal) => calculateWeeks(goal.createdAt, goal.completedAt));

  // Calculate the expected duration (from createdAt to dueDate) in weeks
  const expectedDurations = goals.map((goal) => calculateWeeks(goal.createdAt, goal.dueDate));

  // Helper function to format the date
  const formatDate = (date) => new Date(date).toLocaleDateString(); // Formats to local date string

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const goalIndex = context.dataIndex;
            const goal = goals[goalIndex];

            if (context.datasetIndex === 0) {
              const formattedDueDate = formatDate(goal.dueDate);
              return [
                `${context.dataset.label}: ${context.raw} weeks`,
                `Due Date: ${formattedDueDate}`,
              ];
            } else if (context.datasetIndex === 1) {
              const formattedCompletedAt = formatDate(goal.completedAt);
              return [
                `${context.dataset.label}: ${context.raw} weeks`,
                `Completed Date: ${formattedCompletedAt}`,
              ];
            }
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#6B7280',
          stepSize: 1,
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      y: {
        ticks: {
          color: '#374151',
          stepSize: 1,
        },
        grid: {
          color: '#E5E7EB',
        },
        min: 0,
        max: Math.max(...actualDurations, ...expectedDurations) + 1,
      },
    },
  };

  const chartData = {
    labels, // Goal names
    datasets: [
      {
        label: 'Expected Duration (weeks)',
        data: expectedDurations,
        backgroundColor: '#A89F91', // Muted Olive Brown
        hoverBackgroundColor: '#8B7B58', // Darker Olive Brown for hover
      },
      {
        label: 'Actual Duration (weeks)',
        data: actualDurations,
        backgroundColor: '#6B8E23', // Deep Olive Green
        hoverBackgroundColor: '#4E6B3B', // Darker Olive Green for hover
      },
    ],
  };

  return (
    <div className="relative w-3/4 mx-auto sm:w-full h-60 md:h-80">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default GoalsDurationChart;

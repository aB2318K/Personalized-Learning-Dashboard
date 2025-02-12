import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const TaskLineChart = ({ tasks = [] }) => {
  if (!tasks.length) {
    return <div className="text-gray-500 text-center">No tasks data available.</div>;
  }

  // Helper function to group tasks by interval
  const groupTasksByInterval = (tasks, interval) => {
    const grouped = {};
    tasks.forEach((task) => {
      if (task.completed && task.completedAt) {
        const date = new Date(task.completedAt);
        let key;
        if (interval === 'day') {
          key = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        } else if (interval === 'week') {
          const year = date.getFullYear();
          const week = Math.ceil((date.getDate() + new Date(year, 0, 1).getDay()) / 7);
          key = `${year}-W${week}`; // Format: YYYY-W##
        } else if (interval === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
        }
        grouped[key] = (grouped[key] || 0) + 1;
      }
    });

    const sortedKeys = Object.keys(grouped).sort();
    const values = sortedKeys.map((key, index) => ({
      label: key, // Store the actual date or interval
      value: grouped[key],
      index: index + 1, // 1, 2, 3, ...
    }));

    return values;
  };

  // Group data for all intervals
  const dailyData = groupTasksByInterval(tasks, 'day');
  const weeklyData = groupTasksByInterval(tasks, 'week');
  const monthlyData = groupTasksByInterval(tasks, 'month');

  // Extract labels (1, 2, 3, ...) and values for the chart
  const allIndices = Array.from(
    new Set([
      ...dailyData.map((d) => d.index),
      ...weeklyData.map((w) => w.index),
      ...monthlyData.map((m) => m.index),
    ])
  ).sort((a, b) => a - b); // Union of indices

  const formatTooltipDate = (label) => {
    const [year, extra] = label.split('-');
    if (extra?.startsWith('W')) return `Week ${extra.replace('W', '')}, ${year}`; // Week format
    if (extra) return `${extra}/${year}`; // Month format
    return label.split('-').reverse().join('/'); // Day format (UK)
  };

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
            const labelIndex = context.raw.index;
            let dataSource = [];
            if (context.dataset.label === 'Daily') dataSource = dailyData;
            else if (context.dataset.label === 'Weekly') dataSource = weeklyData;
            else if (context.dataset.label === 'Monthly') dataSource = monthlyData;

            const matchingData = dataSource.find((d) => d.index === labelIndex);
            if (matchingData) {
              const ukFormattedDate = formatTooltipDate(matchingData.label);
              return [`${context.dataset.label}: ${matchingData.value}`, `Date: ${ukFormattedDate}`];
            }
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6B7280',
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      y: {
        ticks: {
          color: '#374151',
        },
        grid: {
          color: '#E5E7EB',
        },
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: allIndices, // 1, 2, 3, ...
    datasets: [
      {
        label: 'Daily',
        data: dailyData.map((d) => ({ index: d.index, value: d.value })),
        borderColor: '#4A6E83', // Muted Teal Blue
        backgroundColor: 'rgba(74, 110, 131, 0.2)', // Light Muted Blue
        fill: true,
        tension: 0.4,
        parsing: { xAxisKey: 'index', yAxisKey: 'value' },
      },
      {
        label: 'Weekly',
        data: weeklyData.map((w) => ({ index: w.index, value: w.value })),
        borderColor: '#6B8E23', // Olive Green
        backgroundColor: 'rgba(107, 142, 35, 0.2)', // Light Olive Green
        fill: true,
        tension: 0.4,
        parsing: { xAxisKey: 'index', yAxisKey: 'value' },
      },
      {
        label: 'Monthly',
        data: monthlyData.map((m) => ({ index: m.index, value: m.value })),
        borderColor: '#D68E23', // Warm Amber
        backgroundColor: 'rgba(214, 142, 35, 0.2)', // Light Amber
        fill: true,
        tension: 0.4,
        parsing: { xAxisKey: 'index', yAxisKey: 'value' },
      },
    ],
  };

  return (
    <div className="relative  w-3/4 mx-auto sm:w-full h-60 md:h-80">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default TaskLineChart;

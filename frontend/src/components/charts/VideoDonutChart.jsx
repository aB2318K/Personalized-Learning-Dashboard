import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function VideoDonutChart({ data }) {
  // Donut chart data
  const chartData = {
    labels: Object.keys(data), // Categories
    datasets: [
      {
        label: 'Watched Videos by Category',
        data: Object.values(data), // Number of watched videos in each category
        backgroundColor: [
          '#D26B6B', // Muted Red
          '#4A6E83', // Dusty Blue
          '#AFA72F', // Olive Gold
          '#5D7D7A', // Tealish Gray
          '#9C755D', // Muted Brown
          '#7F6B99', // Dusty Lavender
          '#5D3A6D', // Muted Purple
          '#3B5C57', // Moss Green
          '#B7564E', // Warm Coral
          '#6A7A7C', // Slate Gray
          '#8B6E3D', // Warm Mustard
          '#4D8C7C', // Sage Green
          '#7A5D44', // Earthy Brown
          '#6F4B3A', // Soft Copper
          '#5E7071', // Ashy Blue
          '#6A5D72', // Purple Taupe
          '#7E674A', // Olive Brown
          '#5F6A61', // Soft Olive Green
          '#4A4F59', // Smoky Charcoal
          '#6C5A4B', // Darker Coffee Brown
        ],
        hoverBackgroundColor: [
          '#E08C8C', // Lighter Muted Red
          '#6F8C9F', // Lighter Dusty Blue
          '#B0B94E', // Lighter Olive Gold
          '#6A8C8A', // Lighter Tealish Gray
          '#B78F77', // Lighter Muted Brown
          '#9C82B1', // Lighter Dusty Lavender
          '#7A4F8E', // Lighter Muted Purple
          '#4A7063', // Lighter Moss Green
          '#D1776A', // Lighter Warm Coral
          '#7C8E8A', // Lighter Slate Gray
          '#A68A50', // Lighter Warm Mustard
          '#5E9A8A', // Lighter Sage Green
          '#8A6A47', // Lighter Earthy Brown
          '#7C5D47', // Lighter Soft Copper
          '#7A8E90', // Lighter Ashy Blue
          '#7E6B7C', // Lighter Purple Taupe
          '#8B7C5D', // Lighter Olive Brown
          '#7A7E71', // Lighter Soft Olive Green
          '#5C636B', // Lighter Smoky Charcoal
          '#7E6B5A', // Lighter Darker Coffee Brown
        ],
      },
    ],
  };  

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} videos`, // Format the tooltip
        },
      },
    },
  };

  return data && Object.keys(data).length > 0 ? (
    <div className="flex justify-center items-center h-60 md:h-80">       
        <Doughnut data={chartData} options={chartOptions} />
    </div>
  ) : (
    <p className="text-gray-500 text-center">No watched videos data available.</p>
  );
}
  
export default VideoDonutChart;

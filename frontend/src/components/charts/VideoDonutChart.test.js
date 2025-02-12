import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoDonutChart from './VideoDonutChart';

describe('VideoDonutChart', () => {
  it('renders the chart when data is available', () => {
    const mockData = {
      Music: 10,
      Education: 5,
      Sports: 3,
    };

    render(<VideoDonutChart data={mockData} />);
    
    const chart = screen.getByRole('img');
    expect(chart).toBeInTheDocument();
  });

  it('renders a message when no data is available', () => {
    render(<VideoDonutChart data={{}} />);
    expect(screen.getByText(/No watched videos data available/)).toBeInTheDocument();
  });
});

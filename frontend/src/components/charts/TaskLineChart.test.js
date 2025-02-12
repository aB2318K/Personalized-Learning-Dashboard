import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskLineChart from './TaskLineChart';

describe('TaskLineChart Component', () => {
  it('should render the chart with provided task data', () => {
    const mockTasks = [
      {
        completed: true,
        completedAt: '2024-01-01',
      },
      {
        completed: true,
        completedAt: '2024-02-01',
      },
      {
        completed: true,
        completedAt: '2024-03-01',
      },
    ];

    render(<TaskLineChart tasks={mockTasks} />);

    const chart = screen.getByRole('img'); 
    expect(chart).toBeInTheDocument();
  });

  it('should render a message when there are no tasks', () => {
    render(<TaskLineChart tasks={[]} />);
    expect(screen.getByText('No tasks data available.')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import GoalsDurationChart from './GoalsDurationChart';

describe('GoalsDurationChart Component', () => {
  it('should render the chart with provided data', () => {
    const mockGoals = [
      {
        name: 'Goal 1',
        createdAt: '2024-01-01',
        completedAt: '2024-02-01',
        dueDate: '2024-01-31',
      },
      {
        name: 'Goal 2',
        createdAt: '2024-02-01',
        completedAt: '2024-03-01',
        dueDate: '2024-02-28',
      },
    ];

    render(<GoalsDurationChart goals={mockGoals} />);
    const chart = screen.getByRole('img'); 
    expect(chart).toBeInTheDocument();
  });

  it('should render a message when there are no goals', () => {
    render(<GoalsDurationChart goals={[]} />);
    expect(screen.getByText('No goals data available.')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import GoalCompletionPieChart from './GoalCompletionPieChart'; 

describe('GoalCompletionPieChart Component', () => {
  it('should render the pie chart with provided data', () => {
    const mockData = { completed: 5, pending: 3 };

    render(<GoalCompletionPieChart data={mockData} />);
    const canvas = screen.getByRole('img');
    expect(canvas).toBeInTheDocument();
  });

  it('should render a message when there is no data', () => {
    const mockData = { completed: 0, pending: 0 };

    render(<GoalCompletionPieChart data={mockData} />);

    expect(screen.getByText('No goals data available')).toBeInTheDocument();
  });
});

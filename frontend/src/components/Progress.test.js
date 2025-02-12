import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Progress from './Progress';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ goals: [], tasks: [], saved: [] }),
  })
);

test('renders progress component with charts and motivation', async () => {
  render(<Progress userId="123" token="abc" />);
  
  expect(screen.getByText(/Goal Completion Progress/i)).toBeInTheDocument();
  expect(screen.getByText(/Weekly Goal Completion/i)).toBeInTheDocument();
  expect(screen.getByText(/Task Completion Progress/i)).toBeInTheDocument();
  expect(screen.getByText(/Videos Watched By Category/i)).toBeInTheDocument();

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(4));
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import History from './History';

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        history: [
          {
            data: {
              id: { videoId: 'testVideo123' },
              snippet: {
                title: 'Test Video',
                channelTitle: 'Test Channel',
                thumbnails: { high: { url: 'test-thumbnail.jpg' } },
              },
            },
            category: 'Test Category',
          },
        ],
      }),
  })
);

describe('History Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders history videos', async () => {
    render(<History userId="user123" token="testToken" />);

    await waitFor(() => screen.getByText('History of Your Visited Videos'));

    expect(screen.getByText('History of Your Visited Videos')).toBeInTheDocument();
    expect(await screen.findByText('Test Video')).toBeInTheDocument();
    expect(await screen.findByText('Test Channel')).toBeInTheDocument();
  });

  test('deletes a history video', async () => {
    render(<History userId="user123" token="testToken" />);
    await waitFor(() => screen.getByText('Test Video'));

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
    });
  });
});

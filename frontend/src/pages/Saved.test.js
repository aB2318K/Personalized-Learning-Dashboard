import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Saved from './Saved';

// Mock fetch API
global.fetch = jest.fn((url, options) => {
  if (options.method === 'PATCH') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ watched: true }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        saved: [
          {
            data: {
              id: { videoId: 'testVideo123' },
              snippet: {
                title: 'Test Video',
                channelTitle: 'Test Channel',
                thumbnails: { high: { url: 'test-thumbnail.jpg' } },
              },
            },
            watched: false,
            category: 'Test Category',
          },
        ],
      }),
  });
});

describe('Saved Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders saved videos', async () => {
    render(<Saved userId="user123" token="testToken" />);

    await waitFor(() => screen.getByText('Your Saved Videos'));

    expect(screen.getByText('Your Saved Videos')).toBeInTheDocument();
    expect(await screen.findByText('Test Video')).toBeInTheDocument();
    expect(await screen.findByText('Test Channel')).toBeInTheDocument();
  });

  test('deletes a saved video', async () => {
    render(<Saved userId="user123" token="testToken" />);
    await waitFor(() => screen.getByText('Test Video'));

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Video')).not.toBeInTheDocument();
    });
  });

  test('marks a video as watched', async () => {
    render(<Saved userId="user123" token="testToken" />);
    await waitFor(() => screen.getByText('Test Video'));

    const markAsWatchedButton = screen.getByText('Mark as Watched');
    fireEvent.click(markAsWatchedButton);

    await waitFor(() => {
      expect(screen.getByText('Watched')).toBeInTheDocument();
    });
  });
});

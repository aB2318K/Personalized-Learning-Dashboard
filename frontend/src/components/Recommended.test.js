import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Recommended from './Recommended';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

it('renders recommended videos correctly when fetch is successful', async () => {
  const mockRecommendations = [
    {
      id: { videoId: '1' },
      snippet: {
        title: 'Test Video 1',
        channelTitle: 'Test Channel',
        thumbnails: { high: { url: 'https://test.com/img1.jpg' } },
      },
    },
    {
      id: { videoId: '2' },
      snippet: {
        title: 'Test Video 2',
        channelTitle: 'Another Channel',
        thumbnails: { high: { url: 'https://test.com/img2.jpg' } },
      },
    },
  ];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ recommendations: mockRecommendations }),
  });

  render(<Recommended userId="12345" token="abcdef" />);

  await waitFor(() => {
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    expect(screen.getByText('Test Video 2')).toBeInTheDocument();
  });

  expect(screen.getByRole('img', { name: 'Test Video 1' })).toHaveAttribute('src', 'https://test.com/img1.jpg');
  expect(screen.getByRole('img', { name: 'Test Video 2' })).toHaveAttribute('src', 'https://test.com/img2.jpg');
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SearchResults from './SearchResults';

// Mock fetch API
global.fetch = jest.fn((url) => {
  if (url.includes('invalid')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ items: [] }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        items: [
          {
            id: { videoId: 'testVideo123' },
            snippet: {
              title: 'Test Video',
              channelTitle: 'Test Channel',
              thumbnails: { high: { url: 'test-thumbnail.jpg' } },
            },
          },
        ],
      }),
  });
});

describe('SearchResults Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays search results correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/search?searchTerm=test']}>
        <Routes>
          <Route path="/search" element={<SearchResults userId="user123" token="testToken" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Test Video'));

    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('Test Channel')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Test Video/i })).toBeInTheDocument();
  });

  test('shows an error message for an invalid search term', async () => {
    render(
      <MemoryRouter initialEntries={['/search?searchTerm=invalid']}>
        <Routes>
          <Route path="/search" element={<SearchResults userId="user123" token="testToken" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('This search is invalid'));

    expect(screen.getByText('This search is invalid')).toBeInTheDocument();
  });
});

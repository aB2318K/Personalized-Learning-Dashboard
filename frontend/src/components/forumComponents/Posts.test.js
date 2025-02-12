import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Posts from './Posts';

global.fetch = jest.fn();

describe('Posts Component', () => {
  const mockToken = 'test-token';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders "No posts available." when there are no posts', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ posts: [] }),
    });

    render(
      <MemoryRouter>
        <Posts token={mockToken} />
      </MemoryRouter>
    );

    expect(await screen.findByText('No posts available.')).toBeInTheDocument();
  });

  it('fetches and displays posts correctly', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        posts: [
          {
            _id: '1',
            title: 'Test Post',
            description: 'This is a test post description.',
            createdAt: '2024-02-01T12:00:00Z',
            answersCount: 5,
            user: { firstname: 'John', lastname: 'Doe' },
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <Posts token={mockToken} />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Test Post')).toBeInTheDocument());

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('This is a test post description.')).toBeInTheDocument();
    expect(screen.getByText('5 Answers')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyPosts from './MyPosts'; 
import { FaEdit, FaTrash } from 'react-icons/fa';
import { MemoryRouter } from 'react-router-dom';

// Mock the fetch API
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ posts: [], firstName: 'John', lastName: 'Doe' }),
});

// Mock the react-icons
jest.mock('react-icons/fa', () => ({
  FaEdit: () => <div>EditIcon</div>,
  FaTrash: () => <div>TrashIcon</div>,
}));

describe('MyPosts Component', () => {
  const userId = '123';
  const token = 'abc123';

  beforeEach(() => jest.clearAllMocks());

  test('renders MyPosts component', () => {
    render(
      <MemoryRouter>
        <MyPosts userId={userId} token={token} />
      </MemoryRouter>
    );
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });

  test('handles post creation', async () => {
    render(
      <MemoryRouter>
        <MyPosts userId={userId} token={token} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Create New'));
    fireEvent.change(screen.getByPlaceholderText('Enter question title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByPlaceholderText('Enter question description'), { target: { value: 'Test Description' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith('https://personalized-learning-dashboard.onrender.com/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, questionTitle: 'Test Title', questionDescription: 'Test Description' }),
      })
    );
  });

  test('handles post editing', async () => {
    const mockPost = { _id: '1', title: 'Test Title', description: 'Test Description', createdAt: '2023-10-01', answersCount: 0 };

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ posts: [mockPost], firstName: 'John', lastName: 'Doe' }) });

    render(
      <MemoryRouter>
        <MyPosts userId={userId} token={token} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Test Title')).toBeInTheDocument());

    fireEvent.click(screen.getByText('EditIcon'));
    expect(screen.getByText('Edit Post')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Edit question title'), { target: { value: 'Updated Test Title' } });
    fireEvent.change(screen.getByPlaceholderText('Edit question description'), { target: { value: 'Updated Test Description' } });
    fireEvent.click(screen.getByTestId('edit-button'));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        `https://personalized-learning-dashboard.onrender.com/questions/${mockPost._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ questionTitle: 'Updated Test Title', questionDescription: 'Updated Test Description' }),
        }
      )
    );
    await waitFor(() => expect(screen.queryByText('Edit Post')).not.toBeInTheDocument(), { timeout: 3000 });
  });

  test('handles post deletion', async () => {
    const mockPost = { _id: '1', title: 'Test Title', description: 'Test Description', createdAt: '2023-10-01', answersCount: 0 };

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ posts: [mockPost], firstName: 'John', lastName: 'Doe' }) });

    render(
      <MemoryRouter>
        <MyPosts userId={userId} token={token} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Test Title')).toBeInTheDocument());

    fireEvent.click(screen.getByText('TrashIcon'));
    expect(screen.getByText('Delete Post')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(`https://personalized-learning-dashboard.onrender.com/questions/${mockPost._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
    );
  });
});

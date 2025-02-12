import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostPage from './PostPage';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

global.fetch = jest.fn();

const mockNavigate = jest.fn();

const token = 'mockToken';
const userId = 'mockUserId';
const postId = 'mockPostId';

const mockPost = {
  _id: postId,
  user: {
    _id: userId,
    firstname: 'John',
    lastname: 'Doe',
  },
  title: 'Test Post Title',
  description: 'Test Post Description',
  createdAt: '2025-02-05T00:00:00Z',
  answersCount: 2,
};

const mockAnswers = [
  {
    _id: 'answer1',
    user: { firstname: 'Jane', lastname: 'Doe' },
    answer: 'Test Answer 1',
    createdAt: '2025-02-05T01:00:00Z',
    upvotes: 5,
    downvotes: 0,
    votes: [],
  },
  {
    _id: 'answer2',
    user: { firstname: 'Tom', lastname: 'Smith' },
    answer: 'Test Answer 2',
    createdAt: '2025-02-05T02:00:00Z',
    upvotes: 2,
    downvotes: 1,
    votes: [],
  },
];

describe('PostPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: mockPost,
        answers: mockAnswers,
      }),
    });

    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  it('should render the post title and description correctly', async () => {
    render(
      <Router>
        <PostPage userId={userId} token={token} postId={postId} />
      </Router>
    );

    await waitFor(() => screen.getByText('Test Post Title'));

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('Test Post Description')).toBeInTheDocument();
  });

  it('should display answers and their upvotes and downvotes', async () => {
    render(
      <Router>
        <PostPage userId={userId} token={token} postId={postId} />
      </Router>
    );

    await waitFor(() => screen.getByText('Test Post Title'));

    expect(screen.getByText('Test Answer 1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); 
    expect(screen.getByText('0')).toBeInTheDocument(); 
    expect(screen.getByText('Test Answer 2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); 
    expect(screen.getByText('1')).toBeInTheDocument(); 
  });

it('should allow posting an answer', async () => {
    // Mock fetch for posting the answer
    const mockPostResponse = {
        ok: true,
        json: async () => ({
          answer: {
            _id: 'answerId123',
            answer: 'My new answer',
            user: {
              firstname: 'John',
              lastname: 'Doe',
            },
            upvotes: 0,
            downvotes: 0,
            votes: [],
            new: true, 
          },
        }),
    };

    fetch.mockResolvedValueOnce(mockPostResponse);

    render(
      <Router>
        <PostPage userId={userId} token={token} postId={postId} />
      </Router>
    );

    await waitFor(() => screen.getByText('Test Post Title'));

    const input = screen.getByPlaceholderText('Post your answer here');
    const button = screen.getByTestId('send-answer');

    fireEvent.change(input, { target: { value: 'My new answer' } });
    fireEvent.click(button);

    await waitFor(() => screen.getByText('My new answer'));

    expect(screen.getByText('My new answer')).toBeInTheDocument();

  });
  
it('should handle editing the post', async () => {
    render(
      <Router>
        <PostPage userId={userId} token={token} postId={postId} />
      </Router>
    );
  
    await waitFor(() => screen.getByText('Test Post Title'));
  
    const editButton = screen.getByTestId('edit');
    fireEvent.click(editButton);
  
    await waitFor(() => screen.getByLabelText('Question Title'));
  
    const titleInput = screen.getByLabelText('Question Title');
    const descriptionInput = screen.getByLabelText('Question Description');
  
    fireEvent.change(titleInput, { target: { value: 'Updated Post Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Post Description' } });
  
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        post: {
          _id: postId,
          user: {
            _id: userId,
            firstname: 'John',
            lastname: 'Doe',
          },
          title: 'Updated Post Title',
          description: 'Updated Post Description',
          createdAt: '2026-02-05T00:00:00Z',
          answersCount: 2,
        },
      }),
    });
  
    const saveButton = screen.getByTestId('edit-save');
    fireEvent.click(saveButton);
  
    await waitFor(
        () => {
          const modal = screen.queryByRole('dialog');
          expect(modal).toBeNull();
        },
        { timeout: 3000 } 
      );
    await waitFor(() => expect(screen.getByText('Updated Post Title')).toBeInTheDocument());
    expect(screen.getByText('Updated Post Description')).toBeInTheDocument();
  });
  
  it('should handle deleting the post', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Post deleted successfully' }),
    });
  
    render(
      <Router>
        <PostPage userId={userId} token={token} postId={postId} />
      </Router>
    );
  
    await waitFor(() => screen.getByText('Test Post Title'));
  
    const deleteButton = screen.getByTestId('delete');
    fireEvent.click(deleteButton);
  
    const confirmDeleteButton = screen.getByTestId('delete-confirm');
    fireEvent.click(confirmDeleteButton);
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/forum');
      },
      { timeout: 3000 } 
    );
  });  
});

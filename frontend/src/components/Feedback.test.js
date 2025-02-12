import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Feedback from './Feedback';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

it('displays watched videos and opens the feedback modal when a video is clicked', async () => {
    const mockWatchedVideos = [
      {
        _id: '1',
        data: {
          id: { videoId: '1' },
          snippet: {
            title: 'Test Video 1',
            channelTitle: 'Test Channel',
            thumbnails: { high: { url: 'https://test.com/img1.jpg' } },
          },
        },
      },
      {
        _id: '2',
        data: {
          id: { videoId: '2' },
          snippet: {
            title: 'Test Video 2',
            channelTitle: 'Another Channel',
            thumbnails: { high: { url: 'https://test.com/img2.jpg' } },
          },
        },
      },
    ];
  
    const mockFeedbackResponse = {
      feedback: null, 
    };
  
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ watched: mockWatchedVideos }),
    });
  
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeedbackResponse,
    });
  
    render(<Feedback userId="12345" token="abcdef" />);
  
    await waitFor(() => {
      expect(screen.getByText('Test Video 1')).toBeInTheDocument();
      expect(screen.getByText('Test Video 2')).toBeInTheDocument();
    });
  
    // Click on the first video
    fireEvent.click(screen.getByText('Test Video 1'));
  
    await waitFor(() => {
      expect(screen.getByText('Feedback for Video')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your feedback here...')).toBeInTheDocument();
    });
  });
  


  it('submits feedback and shows "Very Positive" sentiment', async () => {
    const mockWatchedVideos = [
        {
            _id: '1',
            data: {
                id: { videoId: '1' },
                snippet: {
                    title: 'Test Video 1',
                    channelTitle: 'Test Channel',
                    thumbnails: { high: { url: 'https://test.com/img1.jpg' } },
                },
            },
        },
    ];

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ watched: mockWatchedVideos }),
    });

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ feedback: null }),
    });

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ feedback: { _id: 'feedback_id', feedbackText: 'I love this video. Its very good' } }), 
    });

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ score: 90 }), 
    });

    render(<Feedback userId="12345" token="abcdef" />);

    await waitFor(() => {
        expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Video 1'));

    await waitFor(() => {
        expect(screen.getByText('Feedback for Video')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your feedback here...'), {
        target: { value: 'I love this video. Its very good' },
    });

    fireEvent.click(screen.getByText('Submit Feedback'));

    await waitFor(() => {
        expect(screen.getByText('Very Positive')).toBeInTheDocument();
    });
});



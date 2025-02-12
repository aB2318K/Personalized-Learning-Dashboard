import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ForumSearchResults from './ForumSearchResults';
import { BrowserRouter as Router, useSearchParams } from 'react-router-dom';

global.fetch = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useSearchParams: jest.fn(),
}));

describe('ForumSearchResults Component', () => {
    const mockToken = 'mock-token';
  
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        useSearchParams.mockReturnValue([new URLSearchParams(''), jest.fn()]); 
    });

    test('renders no results message when there are no results', async () => {
        useSearchParams.mockReturnValue([new URLSearchParams('?searchTerm='), jest.fn()]);

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ posts: [] })
        });

        render(
            <Router>
                <ForumSearchResults token={mockToken} />
            </Router>
        );

        expect(screen.getByText(/No results found for/)).toBeInTheDocument();
    });

    test('renders posts correctly when search results are returned', async () => {
        useSearchParams.mockReturnValue([new URLSearchParams('?searchTerm=Test'), jest.fn()]);
    
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                posts: [
                    {
                        _id: '1',
                        title: 'Test Post',
                        description: 'This is a test description.',
                        createdAt: '2025-02-04T00:00:00Z',
                        user: { firstname: 'John', lastname: 'Doe' },
                        answersCount: 5,
                    },
                ],
            }),
        });
    
        await act(async () => {
            render(
                <Router>
                    <ForumSearchResults token={mockToken} />
                </Router>
            );
        });
    
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'https://personalized-learning-dashboard.onrender.com/questions/search?q=Test',
                expect.anything()
            );
        });
        expect(fetch).toHaveBeenCalledTimes(1);
    
        expect(await screen.findByText('Test Post')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('This is a test description.')).toBeInTheDocument();
        expect(screen.getByText(/Posted on/)).toHaveTextContent('Posted on 04/02/2025');
        expect(screen.getByText('5 Answers')).toBeInTheDocument();
    });

    test('calls the API correctly with the search term', async () => {
        const searchTerm = 'test search';
        const mockPosts = [
            {
                _id: '1',
                title: 'Test Post',
                description: 'This is a test description.',
                createdAt: '2025-02-04T00:00:00Z',
                user: { firstname: 'John', lastname: 'Doe' },
                answersCount: 5,
            },
        ];

        // Mock useSearchParams to simulate the search term
        useSearchParams.mockReturnValue([new URLSearchParams(`?searchTerm=${searchTerm}`), jest.fn()]);

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ posts: mockPosts }),
        });

        render(
            <Router>
                <ForumSearchResults token={mockToken} />
            </Router>
        );
        
        await waitFor(() => expect(fetch).toHaveBeenCalledWith(`https://personalized-learning-dashboard.onrender.com/questions/search?q=${searchTerm}`, expect.anything()));

        expect(fetch).toHaveBeenCalledTimes(1);
    });

    test('navigates back to the forum page when clicking "Back to Forum"', () => {
        render(
            <Router>
                <ForumSearchResults token={mockToken} />
            </Router>
        );

        const backButton = screen.getByText(/Back to Forum/);
        expect(backButton).toBeInTheDocument();

        fireEvent.click(backButton);

        expect(window.location.pathname).toBe('/forum');
    });
});

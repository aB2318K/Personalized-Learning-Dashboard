import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WatchVideoModal from './WatchVideoModal';

beforeEach(() => {
    jest.clearAllMocks();
});

test('renders correctly when videoId is provided', () => {
    render(<WatchVideoModal videoId="dQw4w9WgXcQ" onClose={jest.fn()} />);
    
    expect(screen.getByRole('button', { name: /x/i })).not.toBeNull();
    expect(screen.getByTestId('video-iframe')).toBeInTheDocument();
});

test('does not render when videoId is not provided', () => {
    const { container } = render(<WatchVideoModal videoId="" onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
});

test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<WatchVideoModal videoId="dQw4w9WgXcQ" onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: /x/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
});

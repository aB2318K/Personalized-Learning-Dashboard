import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import ForumTabs from './ForumTabs';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('ForumTabs Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  const mockLocation = (pathname) => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { pathname },
    });
  };

  const setup = (initialPath = '/forum') => {
    mockLocation(initialPath); 
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ForumTabs userId="123" token="abc" />
      </MemoryRouter>
    );
  };

  it('renders with "New Posts" as the default active tab', () => {
    setup();
    expect(screen.getByText('New Posts')).toHaveClass('bg-gray-600 text-white');
    expect(screen.getByText('My Posts')).toHaveClass('bg-gray-200 hover:bg-gray-300');
  });

  it('sets "My Posts" as active when on "/forum/my-posts"', () => {
    setup('/forum/my-posts');
    expect(screen.getByText('My Posts')).toHaveClass('bg-gray-600 text-white');
    expect(screen.getByText('New Posts')).toHaveClass('bg-gray-200 hover:bg-gray-300');
  });

  it('navigates correctly when "My Posts" tab is clicked', () => {
    setup();
    fireEvent.click(screen.getByText('My Posts'));
    expect(mockNavigate).toHaveBeenCalledWith('/forum/my-posts');
  });

  it('navigates correctly when "New Posts" tab is clicked', () => {
    setup('/forum/my-posts');
    fireEvent.click(screen.getByText('New Posts'));
    expect(mockNavigate).toHaveBeenCalledWith('/forum');
  });
});

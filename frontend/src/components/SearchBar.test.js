import React, { useState } from 'react'; 
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

jest.mock('../assets/validKeywords', () => ({
  validKeywords: ['React', 'JavaScript', 'Python'],
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

import SearchBar from './SearchBar';

beforeEach(() => {
  jest.clearAllMocks();
});

test('should render input and button', () => {
  render(
    <Router>
      <SearchBar
        searchTerm=""
        setSearchTerm={() => {}}
        forumSearchTerm=""
        setForumSearchTerm={() => {}}
      />
    </Router>
  );

  expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('should update searchTerm on input change', () => {
  const TestComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    return (
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        forumSearchTerm=""
        setForumSearchTerm={() => {}}
      />
    );
  };

  render(
    <Router>
      <TestComponent />
    </Router>
  );

  const input = screen.getByPlaceholderText('Search');
  fireEvent.change(input, { target: { value: 'test search' } });

  expect(input.value).toBe('test search');
});

test('should call handleSearch with matched keyword on Enter key press', async () => {
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);

  const TestComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    return (
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        forumSearchTerm=""
        setForumSearchTerm={() => {}}
      />
    );
  };

  render(
    <Router>
      <TestComponent />
    </Router>
  );

  const input = screen.getByPlaceholderText('Search');
  fireEvent.change(input, { target: { value: 'React' } });

  // Make sure the input value is updated
  expect(input.value).toBe('React');

  fireEvent.click(screen.getByRole('button'));

  expect(mockNavigate).toHaveBeenCalledWith('/dashboard/search?searchTerm=React');
});

test('should navigate to invalid when search term does not match', () => {
  const mockNavigate = jest.fn();
  useNavigate.mockReturnValue(mockNavigate);

  const TestComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    return (
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        forumSearchTerm=""
        setForumSearchTerm={() => {}}
      />
    );
  };

  render(
    <Router>
      <TestComponent />
    </Router>
  );

  const input = screen.getByPlaceholderText('Search');
  fireEvent.change(input, { target: { value: 'unknownSearch' } });
  fireEvent.click(screen.getByRole('button'));

  expect(mockNavigate).toHaveBeenCalledWith('/dashboard/search?searchTerm=invalid');
});


  
test('should call handleForumSearch on Enter key press for forum search', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/forum',
      },
      writable: true,
    });
  
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  
    const TestComponent = () => {
      const [forumSearchTerm, setForumSearchTerm] = useState('');
      return (
        <SearchBar
          searchTerm=""
          setSearchTerm={() => {}}
          forumSearchTerm={forumSearchTerm}
          setForumSearchTerm={setForumSearchTerm}
        />
      );
    };
  
    render(
      <Router>
        <TestComponent />
      </Router>
    );
  
    const input = screen.getByPlaceholderText('Search in forum');
    fireEvent.change(input, { target: { value: 'forum test' } });
    fireEvent.click(screen.getByRole('button'));
  
    expect(mockNavigate).toHaveBeenCalledWith('/forum/search?searchTerm=forum test');
});;


 
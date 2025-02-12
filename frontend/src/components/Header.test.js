import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Header';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), 
    useNavigate: jest.fn(),
}));

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks(); 
});

test('renders header with basic elements', () => {
  render(
    <Router>
      <Header 
        searchTerm="" 
        setSearchTerm={() => {}} 
        forumSearchTerm="" 
        setForumSearchTerm={() => {}} 
        userId="1" 
        token="token" 
        isSidebarOpen={false} 
        setIsSidebarOpen={() => {}} 
      />
    </Router>
  );
  
  expect(screen.getByText('MyDashboard')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
});

test('toggles profile dropdown on icon click', () => {
  render(
    <Router>
      <Header 
        searchTerm="" 
        setSearchTerm={() => {}} 
        forumSearchTerm="" 
        setForumSearchTerm={() => {}} 
        userId="1" 
        token="token" 
        isSidebarOpen={false} 
        setIsSidebarOpen={() => {}} 
      />
    </Router>
  );

  const profileIcon = screen.getByTitle('Profile');
  fireEvent.click(profileIcon);
  
  expect(screen.getByText(/edit profile/i)).toBeInTheDocument();
  
  fireEvent.click(profileIcon); 
  expect(screen.queryByText(/edit profile/i)).not.toBeInTheDocument();
});

test('toggles notification dropdown on icon click', () => {
  render(
    <Router>
      <Header 
        searchTerm="" 
        setSearchTerm={() => {}} 
        forumSearchTerm="" 
        setForumSearchTerm={() => {}} 
        userId="1" 
        token="token" 
        isSidebarOpen={false} 
        setIsSidebarOpen={() => {}} 
      />
    </Router>
  );

  const notificationIcon = screen.getByTitle('Notifications');
  fireEvent.click(notificationIcon);

  expect(screen.getByText(/no new notifications/i)).toBeInTheDocument();
});

test('calls the logout function and redirects to login', () => {
  const mockNavigate = jest.fn();

  jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

  render(
    <Router>
      <Header 
        searchTerm="" 
        setSearchTerm={() => {}} 
        forumSearchTerm="" 
        setForumSearchTerm={() => {}} 
        userId="1" 
        token="token" 
        isSidebarOpen={false} 
        setIsSidebarOpen={() => {}} 
      />
    </Router>
  );

  const profileIcon = screen.getByTitle('Profile');
  fireEvent.click(profileIcon);

  const logoutButton = screen.getByText(/logout/i); 
  fireEvent.click(logoutButton);

  expect(mockNavigate).toHaveBeenCalledWith('/login');
});

test('should fetch notifications on load', async () => {
    const mockNotifications = [
      { _id: '1', type: 'question', triggeredBy: { firstname: 'John', lastname: 'Doe' }, postId: '123' },
      { _id: '2', type: 'answer', triggeredBy: { firstname: 'Jane', lastname: 'Smith' }, postId: '456' },
    ];
  
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notifications: mockNotifications }),
    });
  
    render(
      <Router>
        <Header 
          searchTerm="" 
          setSearchTerm={() => {}} 
          forumSearchTerm="" 
          setForumSearchTerm={() => {}} 
          userId="1" 
          token="token" 
          isSidebarOpen={false} 
          setIsSidebarOpen={() => {}} 
        />
      </Router>
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  
    const notificationIcon = screen.getByTitle('Notifications');
    fireEvent.click(notificationIcon);
  
    await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/posted a new question/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
        expect(screen.getByText(/answered your question/i)).toBeInTheDocument();
    });
});  

test('opens and closes the sidebar on hamburger icon click', () => {
  render(
    <Router>
      <Header 
        searchTerm="" 
        setSearchTerm={() => {}} 
        forumSearchTerm="" 
        setForumSearchTerm={() => {}} 
        userId="1" 
        token="token" 
        isSidebarOpen={false} 
        setIsSidebarOpen={() => {}} 
      />
    </Router>
  );

  const hamburgerIcon = screen.getByTitle('Open Sidebar');
  fireEvent.click(hamburgerIcon);

  expect(screen.getByTitle('Open Sidebar')).toBeInTheDocument();
});

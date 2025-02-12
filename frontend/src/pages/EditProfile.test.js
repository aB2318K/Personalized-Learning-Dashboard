import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfile from './EditProfile'; 
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

global.fetch = jest.fn();

describe('EditProfile Component', () => {
  const mockNavigate = jest.fn();
  const mockUserId = '123';
  const mockToken = 'test-token';

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  
  test('renders input fields and buttons', async () => {
    render(<EditProfile userId={mockUserId} token={mockToken} />);

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Update Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Delete Profile/i)).toBeInTheDocument();
  });

  test('fetches and displays user data on mount', async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ firstname: 'John', lastname: 'Doe' }),
    });

    render(<EditProfile userId={mockUserId} token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });
  });

    
  test('updates name on input change', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ firstname: 'John', lastname: 'Doe' }),
    });
  
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ firstname: 'Jane', lastname: 'Doe' }),
    });
  
    render(<EditProfile userId={mockUserId} token={mockToken} />);
  
    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);

    await waitFor(() => {
      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
    });

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
  
    fireEvent.click(screen.getByTestId('name-save'));
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);  
    });
  
    expect(firstNameInput.value).toBe('Jane')
    ;
    expect(lastNameInput.value).toBe('Doe'); 
  });
  
  test('validates password correctly', async () => {
    render(<EditProfile userId={mockUserId} token={mockToken} />);
    fireEvent.click(screen.getByText(/Update Password/i));

    const newPasswordInput = screen.getByPlaceholderText('Enter new password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm new password');
    const saveButton = screen.getByTestId('save-password')

    fireEvent.change(newPasswordInput, { target: { value: 'weakpass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weakpass' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('handles profile deletion correctly', async () => {
    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ firstname: 'John', lastname: 'Doe' }),
    });

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<EditProfile userId={mockUserId} token={mockToken} />);
    fireEvent.click(screen.getByText(/Delete Profile/i));

    const deleteButton = screen.getByTestId('delete-profile');
    fireEvent.click(deleteButton);
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 5000 }); 
  });
});

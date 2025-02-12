import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Goals from './Goals';
import '@testing-library/jest-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => ({ isMediumScreen: false }), 
}));

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

test('renders goals fetched from API', async () => {
  const mockGoals = [
    { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedDueDate: '10/02/2025', completed: false },
    { _id: '2', name: 'Master Node.js', dueDate: '2025-03-15', formattedDueDate: '15/03/2025', completed: false },
  ];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: mockGoals }),
  });

  render(<Goals userId="12345" token="abcdef" />);

  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Master Node.js')).toBeInTheDocument();
  });
});


test('adds a new goal', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [] }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [] }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goal: { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedDueDate: '10/02/2025', completed: false } }),
  });

  render(<Goals userId="12345" token="abcdef" />);

  fireEvent.change(screen.getByPlaceholderText('Goal'), { target: { value: 'Learn React' } });
  fireEvent.change(screen.getByTestId('date-input'), {
    target: { value: '2025-02-10' },
  });
  fireEvent.click(screen.getByText('Add Goal'));
  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });
});


test('edits an existing goal', async () => {
  const mockGoals = [ { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedDueDate: '10/02/2025', completed: false }];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: mockGoals }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [] }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goal: { _id: '1', name: 'Master React', dueDate: '2025-03-15', formattedDueDate: '15/03/2025', completed: false } }),
  });

  render(<Goals userId="12345" token="abcdef" />);

  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('edit'));
  fireEvent.change(screen.getByTestId('edit-goal-input'), {
    target: { value: 'Master React' },
  });
  fireEvent.change(screen.getByTestId('edit-date-input'), {
    target: { value: '2025-03-15' },
  });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('Master React')).toBeInTheDocument();
  });
});


test('deletes a goal', async () => {
  const mockGoals = [ { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedDueDate: '10/02/2025', completed: false }];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: mockGoals }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [] }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  render(<Goals userId="12345" token="abcdef" />);

  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('delete'));

  await waitFor(() => {
    expect(screen.queryByText('Learn React')).not.toBeInTheDocument();
  });
});

test('marks a goal as completed', async () => {
  const mockGoals = [ { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedDueDate: '10/02/2025', completed: false }];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: mockGoals }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [] }),
  });
  
  const updatedGoal =  { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedCompletedAt: '10/02/2025', completed: true }

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goal: updatedGoal }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [updatedGoal] }),
  });

  render(<Goals userId="12345" token="abcdef" />);

  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('complete'));

  await waitFor(() => {
    expect(screen.getByText('Completed: 10/02/2025')).toBeInTheDocument();
  });
});

test('marks a goal as incomplete', async () => {
  const mockGoals = [ { _id: '1', name: 'Learn React', completedAt: '2025-02-10', formattedCompletedAt: '10/02/2025', completed: true }];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [] }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: mockGoals }),
  });
  const updatedGoal =  { _id: '1', name: 'Learn React', dueDate: '2025-02-10', formattedDueDate: '10/02/2025', completed: false }

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goal: updatedGoal }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ goals: [updatedGoal] }),
  });

  render(<Goals userId="12345" token="abcdef" />);
  
  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('incomplete'));
  
  await waitFor(() => {
    expect(screen.getByText('Learn React')).toBeInTheDocument(); 
  });
});

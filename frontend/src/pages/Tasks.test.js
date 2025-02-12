import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tasks from './Tasks';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
});

test('renders tasks fetched from API', async () => {
  const mockTasks = [
    { _id: '1', name: 'Test Task 1', dueDate: '2025-02-10', formattedDueDate: '10/02/2025' },
    { _id: '2', name: 'Test Task 2', dueDate: '2025-02-15', formattedDueDate: '15/02/2025' }
  ];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ tasks: mockTasks }),
  });

  render(<Tasks userId={'12345'} token={'abcdef'} />);

  await waitFor(() => {
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });
});


test('adds a task', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ tasks: [] }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ task: { _id: '1', name: 'New Task', dueDate: '2025-02-15', formattedDueDate: '15/02/2025' } }),
  });

  render(<Tasks userId={'12345'} token={'abcdef'} />);

  fireEvent.change(screen.getByPlaceholderText('Task'), { target: { value: 'New Task' } });
  fireEvent.change(screen.getByTestId('due-date-input'), { target: { value: '2025-02-15' } });
  fireEvent.click(screen.getByText('Add Task'));
  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
  
});


test('edits a task', async () => {
  const mockTasks = [
    { _id: '1', name: 'Test Task 1', dueDate: '2025-02-10', formattedDueDate: '10/02/2025' }
  ];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ tasks: mockTasks }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ task: { _id: '1', name: 'Updated Task', dueDate: '2025-02-15', formattedDueDate: '15/02/2025' } }),
  });

  render(<Tasks userId={'12345'} token={'abcdef'} />);

  await waitFor(() => {
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('edit'));
  fireEvent.change(screen.getByTestId('edit-task-input'), { target: { value: 'Updated Task' } });
  fireEvent.change(screen.getByTestId('edit-date-input'), { target: { value: '2025-02-15' } });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('Updated Task')).toBeInTheDocument();
  });
});

test('deletes a task', async () => {
  const mockTasks = [
    { _id: '1', name: 'Test Task 1', dueDate: '2025-02-10', formattedDueDate: '10/02/2025' }
  ];

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ tasks: mockTasks }),
  });

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  render(<Tasks userId={'12345'} token={'abcdef'} />);

  await waitFor(() => {
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByTestId('delete'));

  await waitFor(() => {
    expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import UpcomingTasks from './UpcomingTasks';

global.fetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

it('renders "No upcoming tasks." when there are no tasks', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ tasks: [] }),
  });

  render(<UpcomingTasks userId="12345" token="abcdef" />);

  await waitFor(() => {
    expect(screen.getByText('No upcoming tasks.')).toBeInTheDocument(); 
  });
});

it('renders tasks and allows a task to be marked as completed', async () => {
    const mockTasks = [
      {
        _id: 'task1',
        name: 'Test Task',
        completed: false,
        formattedDueDate: '31/02/2025',
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: mockTasks }),
    });
  
    render(<UpcomingTasks userId="12345" token="abcdef" />);
  
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  
    const updatedTask = {
      _id: 'task1',
      name: 'Test Task',
      completed: true,
      formattedCompletedAt: '31/01/2025',
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ task: updatedTask }),
    });
  
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [updatedTask] }),
    });
  

    const completeButton = screen.getByRole('button', { name: 'complete' });
    fireEvent.click(completeButton);
  
    await waitFor(() => {
      expect(screen.getByText('Completed: 31/01/2025')).toBeInTheDocument();
    });
});

it('deletes a task from the upcoming tasks', async () => {
    const mockTasks = [
        {
          _id: 'task1',
          name: 'Test Task',
          completed: false,
          formattedDueDate: '31/02/2025',
        },
    ];

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockTasks }),
    });

    render(<UpcomingTasks userId="12345" token="abcdef" />);

    await waitFor(() => {
        expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true });

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }),
    });

    const deleteButton = screen.getByRole('button', { name: 'delete' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
        expect(screen.queryByText('Test Task')).toBeNull(); 
    });

    expect(fetch).toHaveBeenCalledWith(
        `https://personalized-learning-dashboard.onrender.com/tasks/task1`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer abcdef`,
            },
            body: JSON.stringify({ userId: '12345' }),
        }
    );
});

it('renders completed tasks and allows deletion from the completed tasks', async () => {
    const mockCompletedTasks = [
        {
            _id: 'task1',
            name: 'Completed Task',
            completed: true,
            formattedCompletedAt: '31/01/2025',
        },
    ];

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }), 
    });

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: mockCompletedTasks }),
    });

    render(<UpcomingTasks userId="12345" token="abcdef" />);

    await waitFor(() => {
        expect(screen.getByText('Completed Task')).toBeInTheDocument();
        expect(screen.getByText('Completed: 31/01/2025')).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true });

    fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }),
    });

    const deleteButton = screen.getByRole('button', { name: 'comp-del' });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    await waitFor(() => {
        expect(screen.queryByText('Completed Task')).toBeNull();
    });
});

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Reset from './ResetPassword';

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders Reset page without crashing', () => {
  render(
    <MemoryRouter>
      <Reset />
    </MemoryRouter>
  );

  // Check that form is rendered and elements are visible
  expect(screen.getByRole('form')).toBeInTheDocument();
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send link/i })).toBeInTheDocument();
});

test('shows validation error for invalid email format', async () => {
  render(
    <MemoryRouter>
      <Reset />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'invalid-email' },
  });

  fireEvent.click(screen.getByRole('button', { name: /send link/i }));

  await waitFor(() => {
    expect(screen.getByText('*Please provide a valid email address in the format: example@domain.com')).toBeInTheDocument();
  });
});

test('shows error message for non-existent email (404)', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 404,
    json: jest.fn().mockResolvedValue({
      message: '*Email not found. Please check for typos or create a new account.',
    }),
  });

  render(
    <MemoryRouter>
      <Reset />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'nonexistent.email@example.com' },
  });

  fireEvent.click(screen.getByRole('button', { name: /send link/i }));

  await waitFor(() => {
    expect(screen.getByText('*Email not found. Please check for typos or create a new account.')).toBeInTheDocument();
  });
});

test('shows success message on valid email submission', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      message: 'Password reset link sent.',
    }),
  });

  render(
    <MemoryRouter>
      <Reset />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'valid.email@example.com' },
  });

  fireEvent.click(screen.getByRole('button', { name: /send link/i }));

  await waitFor(() => {
    expect(screen.getByText('A password reset link has been sent to your email')).toBeInTheDocument();
  });
});

test('shows generic error message on other errors', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: jest.fn().mockResolvedValue({
      message: 'Internal server error',
    }),
  });

  render(
    <MemoryRouter>
      <Reset />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/Email/i), {
    target: { value: 'valid.email@example.com' },
  });

  fireEvent.click(screen.getByRole('button', { name: /send link/i }));

  await waitFor(() => {
    expect(screen.getByText('*There was an error. Please try again later')).toBeInTheDocument();
  });
});

import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import SignUp from './SignUp';

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

test("renders SignUp without crashing", () => {
    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );
    // Check that SignUp form is rendered and the labels are visible
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});

test("shows validation error when the fields are empty", async () => {
    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign up/i })); 

    await waitFor(() => {
        const errorMessages = screen.getAllByText("*This field is required");
        expect(errorMessages).toHaveLength(2);
    });
});


test("shows email format error", async () => {
    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "invalid-email" }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i })); 

    await waitFor(() => {
        expect(screen.getByText("*Please provide a valid email address in the format: example@domain.com")).toBeInTheDocument();
    });
});

test("shows password format error", async () => {
    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "weak" }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i })); 

    await waitFor(() => {
        expect(screen.getByText("*Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character")).toBeInTheDocument();
    });
});

test("shows success message after successful sign-up", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Account created successfully!' }),
    });

    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: "John" }
    });

    fireEvent.change(screen.getByLabelText(/Last Name/i), {
        target: { value: "Doe" }
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john.doe@example.com" }
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "Password1!" }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i })); 

    await waitFor(() => {
        expect(screen.getByText("Account created successfully! Redirecting to login...")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("shows error message on failed sign-up", async () => {
    // Mock fetch to simulate error response
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: '*This email is already registered. Try logging in instead.' }),
    });

    render(
        <MemoryRouter>
            <SignUp />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
        target: { value: "Jane" }
    });

    fireEvent.change(screen.getByLabelText(/Last Name/i), {
        target: { value: "Smith" }
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "jane.smith@example.com" }
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "Password1!" }
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i })); 

    await waitFor(() => {
        expect(screen.getByText('*This email is already registered. Try logging in instead.')).toBeInTheDocument();
    });
});



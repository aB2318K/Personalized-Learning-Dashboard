import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import LogIn from './LogIn';

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders LogIn without crashing", () => {
    render(
        <MemoryRouter>
            <LogIn />
        </MemoryRouter>
    );
    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});

test("shows validation error when the fields are empty", async () => {
    render(
        <MemoryRouter>
            <LogIn />
        </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /log in/i })); 

    await waitFor(() => {
        const errorMessages = screen.getAllByText("*This field is required");
        expect(errorMessages).toHaveLength(2);
    });
});

test("shows success message after successful login", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ userID: '12345', token: 'abc123' }),
    });

    render(
        <MemoryRouter>
            <LogIn />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john.doe@example.com" }
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "Password1!" }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i })); 

    await waitFor(() => {
        expect(screen.getByText("You have successfully logged in.")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("shows error message on failed login (incorrect email)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({
            message: '*This email address was not found. Please check for typos or create a new account.'
        }),
    });

    render(
        <MemoryRouter>
            <LogIn />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "nonexistent.email@example.com" }
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "password" }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
        expect(screen.getByText('*This email address was not found. Please check for typos or create a new account.')).toBeInTheDocument();
    });
});

test("shows error message on failed login (incorrect password)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: '*Incorrect password. Please try again or reset your password.' }),
    });

    render(
        <MemoryRouter>
            <LogIn />
        </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: "john.doe@example.com" }
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: "wrongPassword" }
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i })); 

    await waitFor(() => {
        expect(screen.getByText('*Incorrect password. Please try again or reset your password.')).toBeInTheDocument();
    });
});

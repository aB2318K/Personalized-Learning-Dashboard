import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NewPassword from "./NewPassword";
import { act } from 'react';

global.fetch = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "invalid-token",
  }),
}));

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

test("shows error message when reset token is invalid (GET 404)", async () => {
  // Mock the fetch call to return a 404 response
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status: 404,
    json: async () => ({
      message: "Invalid reset token",
    }),
  });

  // Render the component
  render(
    <MemoryRouter initialEntries={["/new-password/invalid-token"]}>
      <NewPassword />
    </MemoryRouter>
  );

  // Wait for the error message to appear
  await waitFor(() => {
    expect(
      screen.getByText(
        "The link you used to reset the password is either expired or invalid. Please request a new one."
      )
    ).toBeInTheDocument();
  });

  // Ensure the form elements are NOT rendered
  expect(screen.queryByText(/Create New Password/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/New Password/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/Re-enter Password/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /update password/i })).not.toBeInTheDocument();
});


test("renders NewPassword page without crashing", () => {
  render(
    <MemoryRouter initialEntries={["/new-password/valid-token"]}>
      <NewPassword />
    </MemoryRouter>
  );

  expect(screen.getByText(/Create New Password/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Re-enter Password/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /update password/i })).toBeInTheDocument();
});


test("shows password validation error for invalid password format", async () => {
  render(
    <MemoryRouter initialEntries={["/new-password/valid-token"]}>
      <NewPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/New Password/i), {
    target: { value: "invalid" },
  });

  fireEvent.click(screen.getByRole("button", { name: /update password/i }));

  expect(
    screen.getByText(
      "*Your password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character"
    )
  ).toBeInTheDocument();
});


test("shows password match error if passwords do not match", async () => {
  render(
    <MemoryRouter initialEntries={["/new-password/valid-token"]}>
      <NewPassword />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/New Password/i), {
    target: { value: "Password1!" },
  });

  fireEvent.change(screen.getByLabelText(/Re-enter Password/i), {
    target: { value: "DifferentPassword1!" },
  });

  fireEvent.click(screen.getByRole("button", { name: /update password/i }));

  expect(screen.getByText("*Passwords do not match")).toBeInTheDocument();
});

test("shows success message after successful password reset", async () => {
  // Mock GET request for token validation
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => "valid-token", // Mock a valid token response
    })
    // Mock POST request for password update
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Password successfully reset" }),
    });

  render(
    <MemoryRouter initialEntries={["/new-password/valid-token"]}>
      <NewPassword />
    </MemoryRouter>
  );

  // Wait for the component to process the GET request and validate the token
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  // Fill in the form
  fireEvent.change(screen.getByLabelText(/New Password/i), {
    target: { value: "Password1!" },
  });

  fireEvent.change(screen.getByLabelText(/Re-enter Password/i), {
    target: { value: "Password1!" },
  });

  // Submit the form
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
  });

  // Wait for the success message
  await waitFor(() => {
    expect(
      screen.getByText(/You have successfully updated your password. Redirecting to Log In page/i)
    ).toBeInTheDocument();
  });

  // Ensure both fetch calls were made
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("shows generic error message if password update fails", async () => {
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => "valid-token",
    })
    .mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: "Internal server error" }), 
    });

  render(
    <MemoryRouter initialEntries={["/new-password/valid-token"]}>
      <NewPassword />
    </MemoryRouter>
  );

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  fireEvent.change(screen.getByLabelText(/New Password/i), {
    target: { value: "Password1!" },
  });

  fireEvent.change(screen.getByLabelText(/Re-enter Password/i), {
    target: { value: "Password1!" },
  });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /update password/i }));
  });

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

  await waitFor(() => {
    expect(screen.getByText(/Internal server error/i)).toBeInTheDocument();
  });
 
});


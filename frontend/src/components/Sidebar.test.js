import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const setActiveTab = jest.fn();
const setSearchTerm = jest.fn();
const setIsSidebarOpen = jest.fn();
const navigate = jest.fn();

const renderSidebar = (isSidebarOpen = true) => {
  useNavigate.mockReturnValue(navigate);
  return render(
    <Sidebar
      setActiveTab={setActiveTab}
      setSearchTerm={setSearchTerm}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    />
  );
};

it('renders the sidebar with all menu items', () => {
  renderSidebar();

  expect(screen.getByText('Home')).toBeInTheDocument();
  expect(screen.getByText('Tasks')).toBeInTheDocument();
  expect(screen.getByText('Goals')).toBeInTheDocument();
  expect(screen.getByText('History')).toBeInTheDocument();
  expect(screen.getByText('Saved')).toBeInTheDocument();
});

it('calls the correct handler when Home is clicked', () => {
  renderSidebar();

  fireEvent.click(screen.getByText('Home'));
  expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
  expect(setSearchTerm).toHaveBeenCalledWith('');
  expect(navigate).toHaveBeenCalledWith('/dashboard');
  expect(setActiveTab).toHaveBeenCalledWith('myProgress');
});

it('calls the correct handler when Tasks is clicked', () => {
  renderSidebar();

  fireEvent.click(screen.getByText('Tasks'));
  expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
  expect(setSearchTerm).toHaveBeenCalledWith('');
  expect(navigate).toHaveBeenCalledWith('/dashboard/tasks');
});

it('calls the correct handler when Goals is clicked', () => {
  renderSidebar();

  fireEvent.click(screen.getByText('Goals'));
  expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
  expect(setSearchTerm).toHaveBeenCalledWith('');
  expect(navigate).toHaveBeenCalledWith('/dashboard/goals');
});

it('calls the correct handler when History is clicked', () => {
  renderSidebar();

  fireEvent.click(screen.getByText('History'));
  expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
  expect(setSearchTerm).toHaveBeenCalledWith('');
  expect(navigate).toHaveBeenCalledWith('/dashboard/history');
});

it('calls the correct handler when Saved is clicked', () => {
  renderSidebar();

  fireEvent.click(screen.getByText('Saved'));
  expect(setIsSidebarOpen).toHaveBeenCalledWith(false);
  expect(setSearchTerm).toHaveBeenCalledWith('');
  expect(navigate).toHaveBeenCalledWith('/dashboard/saved');
});

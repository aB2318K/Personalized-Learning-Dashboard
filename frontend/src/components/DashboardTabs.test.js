import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardTabs from './DashboardTabs';

 test('renders tab buttons and switches tabs correctly', () => {
    const mockSetActiveTab = jest.fn();
    render(<DashboardTabs userId="123" token="abc" activeTab="myProgress" setActiveTab={mockSetActiveTab} />);
    
    expect(screen.getByText(/My Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Upcoming Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended For Me/i)).toBeInTheDocument();
    expect(screen.getByText(/My Feedback/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Upcoming Tasks/i));
    expect(mockSetActiveTab).toHaveBeenCalledWith('upcomingTasks');
});
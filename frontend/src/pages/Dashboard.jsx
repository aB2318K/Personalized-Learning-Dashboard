import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardTabs from '../components/DashboardTabs';
import { Outlet, useLocation } from 'react-router-dom';

function Dashboard({ userId, token }) {  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('myProgress');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const location = useLocation();

  const isSearchPage = location.pathname.startsWith('/dashboard/search');
  const isTasksPage = location.pathname.startsWith('/dashboard/tasks');
  const isGoalsPage = location.pathname.startsWith('/dashboard/goals');
  const isHistoryPage = location.pathname.startsWith('/dashboard/history');
  const isSavedPage = location.pathname.startsWith('/dashboard/saved');
  const isProfilePage = location.pathname.startsWith('/dashboard/profile');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMediumScreen(true);
      } else {
        setIsMediumScreen(false);
      }
      
      if (window.innerWidth > 640) {
        setIsSidebarOpen(false); 
      }
    };
  
    handleResize(); 
  
    window.addEventListener('resize', handleResize);
  
    // Cleanup the event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  

  return (
    <div className="flex h-screen pt-12 md:pt-16"> 
      {/* Sidebar */}
      <Sidebar setActiveTab={setActiveTab} setSearchTerm={setSearchTerm} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="md:flex-1 flex flex-col ml-0 md:ml-64 md:pt-3"> 
        {/* Header */}
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} userId={userId} token={token} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Conditionally render DashboardTabs */}
        {!isSearchPage && !isTasksPage && !isGoalsPage && !isHistoryPage && !isSavedPage && !isProfilePage && (
          <DashboardTabs userId={userId} token={token} activeTab={activeTab} setActiveTab={setActiveTab} isSidebarOpen={isSidebarOpen} />
        )}

        {/* Pass `isSidebarOpen` and `setIsSidebarOpen` as context to the Outlet */}
        <Outlet context={{ isSidebarOpen, setIsSidebarOpen, isMediumScreen }} />
      </div>
    </div>
  );
}

export default Dashboard;

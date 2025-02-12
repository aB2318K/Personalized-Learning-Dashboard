import React from 'react';
import { HiHome, HiCheckCircle, HiClipboardList, HiBookmark, HiClock } from 'react-icons/hi'; 
import { useNavigate } from 'react-router-dom';

function Sidebar({ setActiveTab, setSearchTerm, isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const handleHomeClick = () => {
    setIsSidebarOpen(false);
    setSearchTerm("");
    navigate('/dashboard');
    setActiveTab('myProgress');
  };

  const handleTasksClick =() => {
    setIsSidebarOpen(false);
    setSearchTerm("");
    navigate('/dashboard/tasks')
  }

  const handleGoalsClick =() => {
    setIsSidebarOpen(false);
    setSearchTerm("");
    navigate('/dashboard/goals')
  }

  const handleHistoryClick = () => {
    setIsSidebarOpen(false);
    setSearchTerm("");
    navigate('/dashboard/history')
  }

  const handleSavedClick = () => {
    setIsSidebarOpen(false);
    setSearchTerm("");
    navigate('/dashboard/saved')
  }

  return (
    <>
      {/* Backdrop for dimming the content behind the sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <div 
          className={`sidebar w-48 sm:w-64 bg-white border-r border-gray-200 p-4 fixed md:top-0 top-12 left-0 h-full transition-transform duration-300 ease-in-out z-50
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:transition-none`}
        >
        <div className="space-y-2 md:space-y-4">
          {/* Home */}
          <div
            onClick={handleHomeClick}
            className="flex items-center space-x-2 text-gray-800 hover:bg-gray-100 p-2 rounded-lg cursor-pointer md:justify-start justify-center bg-gray-100 md:bg-transparent"
          >
            <HiHome />
            <span className="text-sm md:text-lg">Home</span>
          </div>

          {/* Tasks */}
          <div
            onClick={handleTasksClick}
            className="flex items-center space-x-2 text-gray-800 hover:bg-gray-100 p-2 rounded-lg cursor-pointer md:justify-start justify-center bg-gray-100 md:bg-transparent"
          >
            <HiClipboardList />
            <span className="text-sm md:text-lg">Tasks</span>
          </div>
          
          {/* Goals */}
          <div
            onClick={handleGoalsClick}
            className="flex items-center space-x-2 text-gray-800 hover:bg-gray-100 p-2 rounded-lg cursor-pointer md:justify-start justify-center bg-gray-100 md:bg-transparent"
          >
            <HiCheckCircle />
            <span className="text-sm md:text-lg">Goals</span>
          </div>

          {/* History */}
          <div
            onClick={handleHistoryClick}
            className="flex items-center space-x-2 text-gray-800 hover:bg-gray-100 p-2 rounded-lg cursor-pointer md:justify-start justify-center bg-gray-100 md:bg-transparent"
          >
            <HiClock />
            <span className="text-sm md:text-lg">History</span>
          </div>

          {/* Saved */}
          <div
            onClick={handleSavedClick}
            className="flex items-center space-x-2 text-gray-800 hover:bg-gray-100 p-2 rounded-lg cursor-pointer md:justify-start justify-center bg-gray-100 md:bg-transparent"
          >
            <HiBookmark />
            <span className="text-sm md:text-lg">Saved</span>
          </div>
        </div>
      </div>

    </>
  );
}


export default Sidebar;

import React from 'react';
import UpcomingTasks from './UpcomingTasks';
import Progress from './Progress';
import Recommended from './Recommended';
import Feedback from './Feedback';

function DashboardTabs({ userId, token, activeTab, setActiveTab }) {
  return (
    <main className="flex-1 bg-gray-100 p-4 w-screen md:w-full overflow-x-hidden">
      {/* Buttons for selecting the active tab */}
      <div className="flex space-x-2 sm:space-x-3 md:space-x-4 mb-4 justify-center md:justify-start">
        <button
          onClick={() => setActiveTab('myProgress')}
          className={`p-1 px-2 sm:p-2 sm:px-4 rounded-lg text-xs md:text-sm ${
            activeTab === 'myProgress' ? 'bg-gray-600 text-white' : 'bg-gray-200'
          }`}
        >
          My Progress
        </button>
        <button
          onClick={() => setActiveTab('upcomingTasks')}
          className={`p-1 px-2 sm:p-2 sm:px-4 rounded-lg text-xs md:text-sm ${
            activeTab === 'upcomingTasks' ? 'bg-gray-600 text-white' : 'bg-gray-200'
          }`}
        >
          Upcoming Tasks
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          className={`p-1 px-2 sm:p-2 sm:px-4 rounded-lg text-xs md:text-sm ${
            activeTab === 'recommended' ? 'bg-gray-600 text-white' : 'bg-gray-200'
          }`}
        >
          Recommended For Me
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`p-1 px-2 sm:p-2 sm:px-4 rounded-lg text-xs md:text-sm ${
            activeTab === 'feedback' ? 'bg-gray-600 text-white' : 'bg-gray-200'
          }`}
        >
          My Feedback
        </button>
      </div>

      {/* Conditional rendering based on the active tab */}
      <div>
        {activeTab === 'myProgress' && (
          <div>
            <Progress userId={userId} token={token} />
          </div>
        )}
        {activeTab === 'upcomingTasks' && (
          <div>
            <UpcomingTasks userId={userId} token={token} />
          </div>
        )}
        {activeTab === 'recommended' && (
          <div>
            <Recommended userId={userId} token={token} />
          </div>
        )}
        {activeTab === 'feedback' && (
          <div>
            <Feedback userId={userId} token={token} />
          </div>
        )}
      </div>
    </main>
  );
}

export default DashboardTabs;

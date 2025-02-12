import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { HiBell, HiUser, HiPencil, HiSpeakerphone, HiLogout, HiViewGrid, HiMenu } from 'react-icons/hi';

function Header({ searchTerm, setSearchTerm, forumSearchTerm, setForumSearchTerm, userId, token, isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const isForum = location.pathname.startsWith('/forum');

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen((prev) => !prev);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('recommendedVideos');
    localStorage.clear();
    navigate('/login');
  };

  // Get Notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/notification?userId=${userId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          // Limit to the latest 8 notifications, or fewer if less than 8
          const latestNotifications = data.notifications.slice(0, 8);
          setNotifications(latestNotifications);
        } else {
          console.warn('Unexpected response format:', data);
          setNotifications([]);
        }
      } else {
        console.error('Failed to fetch notifications:', response.statusText);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const removeNotification = async (notificationId) => {
    const requestBody = {
      userId,
      notificationId,
    };
  
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/notification/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Notification removed:', data);
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification._id !== notificationId)
        );
        setIsProfileDropdownOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to remove notification:', errorData);
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  // Fetch Notifications and Close dropdowns when clicking outside
  useEffect(() => {
    fetchNotifications();
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleNotificationClick = (notificationId, postId) => {
    // Remove notification
    removeNotification(notificationId);

    // Navigate to the post page with some state to trigger a refresh
    navigate(`/forum/post/${postId}`, { state: { refresh: Date.now() } });
    window.location.reload();
  };

  return (
    <header className={`header flex z-50 items-center justify-between p-2 md:p-4 bg-white shadow-md fixed top-0 ${isForum ? 'left-0' : 'left-0 md:left-64'} right-0 z-10`}>
      {/* Left: Title */}
      <div className="flex items-center space-x-4">
        <h1 className={`text-sm md:text-xl text-gray-700 font-bold hidden md:block ${isForum ? 'cursor-pointer' : ''}`} onClick={isForum ? () => navigate('/dashboard') : undefined}>
          MyDashboard
        </h1>

        {/* Show the hamburger menu icon on medium screens (<640px) */}
        {!isForum && <div className="md:hidden">
          <HiMenu
            className="h-5 w-5 text-gray-600 cursor-pointer"
            title="Open Sidebar"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>}
      </div>

      {/* Center: Search Bar */}
      <div className="flex-grow flex justify-center">
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          forumSearchTerm={forumSearchTerm}
          setForumSearchTerm={setForumSearchTerm}
        />
      </div>

      {/* Right: Profile and Notifications */}
      <div className="relative flex items-center space-x-4">
        {/* Notification Icon */}
        <div className="relative" ref={notificationDropdownRef}>
          <HiBell 
            className="bell-icon h-5 w-5 sm:h-6 sm:w-6 text-gray-600 hover:text-gray-800 cursor-pointer" 
            title="Notifications"
            onClick={toggleNotificationDropdown}
          />
          {isNotificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg">
              <ul className="py-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.postId} 
                    onClick={() => handleNotificationClick(notification._id, notification.postId)}
                  >
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                      {notification.type === 'question' ? (
                        <span className="text-gray-700">
                          <span className="text-gray-800 font-semibold">
                            {notification.triggeredBy.firstname} {notification.triggeredBy.lastname}
                          </span> posted a new question.
                        </span>
                      ) : (
                        <span className="text-gray-700">
                          <span className="text-gray-800 font-semibold">
                            {notification.triggeredBy.firstname} {notification.triggeredBy.lastname}
                          </span> answered your question.
                        </span>
                      )}
                    </li>
                  </div>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500 text-center text-sm">No new notifications</li>
              )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Icon */}
        <div className="relative" ref={profileDropdownRef}>
          <HiUser
            className="user-icon h-6 w-6 sm:h-8 sm:w-8 text-gray-600 hover:text-gray-800 cursor-pointer" 
            title="Profile"
            onClick={toggleProfileDropdown}
          />
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
              <ul className="py-2">
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => navigate('/dashboard/profile')}>
                  <HiPencil className="pencil-icon mr-2" />
                  Edit Profile
                </li>
                {isForum ? ( 
                  <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => navigate('/dashboard')}>
                    <HiViewGrid className="grid-icon mr-2" />
                    Dashboard
                  </li> 
                ) : (
                  <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => navigate('/forum')}>
                    <HiSpeakerphone className="speaker-icon mr-2" />
                    Forum
                  </li>
                )}
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={logout}>
                  <HiLogout className="mr-2" />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

import React, { useState, useEffect } from 'react';
import { HiTrash, HiBookmark } from 'react-icons/hi'; 
import WatchVideoModal from '../components/WatchVideoModal';

function History({ userId, token }) {
  const [history, setHistory] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  // Fetch history data from the API
  const fetchHistory = async () => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/history?userId=${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history); 
      } else {
        console.error('Failed to fetch history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    if (userId && token) {
      fetchHistory();
    }
  }, [userId, token]);

  // Handle Delete
  const handleDeleteHistory = async (videoId) => {
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          videoId,
        }),
      });

      if (response.ok) {
        // If the delete was successful, remove the video from the state
        setHistory(prevHistory => prevHistory.filter(item => item.data.id.videoId !== videoId));
      } else {
        console.error('Failed to delete video from history');
      }
    } catch (error) {
      console.error('Error deleting video from history:', error);
    }
  };

  const handleSaveVideo = async (video, category) => {
    try {
        const response = await fetch('https://personalized-learning-dashboard.onrender.com/saved', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Include the user's token
            },
            body: JSON.stringify({
                userId,
                data: video,
                category  
            }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log(result.message);
        } else {
            console.error(result.message);
        }
    } catch (error) {
        console.error('Error saving video:', error);
    }
  };

  const openModal = (videoId) => {
    setSelectedVideoId(videoId);
  };

  const closeModal = () => {
    setSelectedVideoId(null);
  };


  return (
    <div className="flex-1 p-4 bg-gray-100 w-screen md:w-full overflow-x-hidden">
      <h2 className="text-sm sm:text-lg font-bold text-gray-700 ml-3 sm:ml-1 mb-4">History of Your Visited Videos</h2>
      <ul>
        {history.length === 0 ? (
          <p className="text-gray-500">No history available.</p>
        ) : (
          history.map((entry) => {
            const video = entry.data; 
            const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            return (
              <li key={video.id.videoId} className="mb-4 sm:mb-6 sm:flex sm:items-start">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal(video.id.videoId); // Open the modal when clicked
                  }}
                  href="#"
                  className="mr-0 sm:mr-6 flex justify-center sm:justify-start sm:mr-0"
                >
                  <img
                    src={video.snippet.thumbnails.high.url}
                    alt={video.snippet.title}
                    className="w-[90vw] h-60 sm:w-64 sm:h-36 object-cover rounded-xl sm:rounded-lg"
                  />
                </a>
                <div className="sm:flex-1 ml-1">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openModal(video.id.videoId); // Open the modal when clicked
                    }}
                    href="#"
                    className="text-sm sm:text-lg font-semibold text-gray-800"
                  >
                    {video.snippet.title} 
                  </a>
                  <p className="text-xs sm:text-sm text-gray-600">{video.snippet.channelTitle}</p>
                </div>
                <div className="flex">
                  <div className="flex items-center ml-4 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => handleDeleteHistory(video.id.videoId)} >                      
                    {/* Trash Icon - Handle delete history */}
                    <HiTrash
                      className="mr-1 sm:mr-2"
                    />
                    <span className="text-xs sm:text-sm">Delete</span>
                  </div>
                  <div className="flex items-center ml-4 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => handleSaveVideo(video, entry.category)}>
                    {/* Bookmark Icon - Placeholder for future save functionality */}
                    <HiBookmark className="mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Save</span>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <WatchVideoModal videoId={selectedVideoId} onClose={closeModal} />
    </div>
  );
}

export default History;

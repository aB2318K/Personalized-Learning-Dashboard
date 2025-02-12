import React, { useState, useEffect } from 'react';
import { HiTrash, HiCheck } from 'react-icons/hi';
import { FaCheckCircle } from 'react-icons/fa';
import WatchVideoModal from '../components/WatchVideoModal';

function Saved({ userId, token }) {
  const [savedVideos, setSavedVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  // Fetch saved videos data from the API
  const fetchSavedVideos = async () => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/saved?userId=${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSavedVideos(data.saved); // Save the fetched saved videos to state
      } else {
        console.error('Failed to fetch saved videos');
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
    }
  };

  // Add to watch history
  const handleSaveHistory = async (video, category) => {
    const requestBody = {
      userId,
      data: video,
      category
    };

    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log('Added to history:', video.snippet.title);
      } else {
        console.error('Failed to add to history:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  // Toggle watched status
  const toggleWatchedStatus = async (videoId) => {
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/saved/watched', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, videoId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedVideos((prev) =>
          prev.map((entry) =>
            entry.data.id.videoId === videoId
              ? { ...entry, watched: data.watched }
              : entry
          )
        );
      } else {
        console.error('Failed to toggle watched status');
      }
    } catch (error) {
      console.error('Error toggling watched status:', error);
    }
  };

  // Delete a saved video
  const handleDeleteSavedVideo = async (videoId) => {
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/saved', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          videoId,
        }),
      });

      if (response.ok) {
        setSavedVideos((prevSavedVideos) =>
          prevSavedVideos.filter((item) => item.data.id.videoId !== videoId)
        );
      } else {
        console.error('Failed to delete video from saved list');
      }
    } catch (error) {
      console.error('Error deleting video from saved list:', error);
    }
  };

  const openModal = (videoId) => {
    setSelectedVideoId(videoId);
  };

  const closeModal = () => {
    setSelectedVideoId(null);
  };

  useEffect(() => {
    if (userId && token) {
      fetchSavedVideos();
    }
  }, [userId, token]);

  return (
    <div className="flex-1 p-4 bg-gray-100 w-screen md:w-full overflow-x-hidden">
      <h2 className="text-sm sm:text-lg font-bold text-gray-700 ml-3 sm:ml-1 mb-4">Your Saved Videos</h2>
      <ul>
        {savedVideos.length === 0 ? (
          <p className="text-gray-500">No saved videos available.</p>
        ) : (
          savedVideos.map((entry) => {
            const video = entry.data;
            const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            return (
              <li key={video.id.videoId} className="mb-4 sm:mb-6 sm:flex sm:items-start">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveHistory(video, entry.category);
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
                      handleSaveHistory(video, entry.category);
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
                  <div className="flex items-center ml-4 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => handleDeleteSavedVideo(video.id.videoId)}>
                    {/* Trash Icon - Handle delete saved video */}
                    <HiTrash className="mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Delete</span>
                  </div>
                  <div className={`flex items-center ml-4 text-xs sm:text-sm font-semibold cursor-pointer ${entry.watched ? 'text-gray-800' : 'text-gray-500 hover:text-gray-600'}`} onClick={() => toggleWatchedStatus(video.id.videoId)}>
                    {entry.watched ? <FaCheckCircle className="mr-1 sm:mr-2" /> : <HiCheck className="mr-2" />}
                    <span>{entry.watched ? 'Watched' : 'Mark as Watched'}</span>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {/* WatchVideoModal will be shown when a video is clicked */}
      <WatchVideoModal videoId={selectedVideoId} onClose={closeModal} />
    </div>
  );
}

export default Saved;

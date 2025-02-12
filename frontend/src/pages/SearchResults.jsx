import React, { useState, useEffect } from 'react';
import { HiBookmark } from 'react-icons/hi';
import { useSearchParams } from 'react-router-dom';
import WatchVideoModal from '../components/WatchVideoModal';

function SearchResults({ userId, token }) {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('searchTerm');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [selectedVideoId, setSelectedVideoId] = useState('');

  const handleSearch = async () => {
    console.log(localStorage);
    // Check if the search term is "invalid"
    if (searchTerm.toLowerCase() === 'invalid') {
        setErrorMessage('This search is invalid');
        setSearchResults([]); 
        setShowResults(true);
        return; // Don't proceed with the API call
    }

    setErrorMessage(''); 

    // Check if the search results are already stored in local storage
    const cachedResults = localStorage.getItem(searchTerm);
    if (cachedResults) {
        // Parse and use the cached results
        const parsedResults = JSON.parse(cachedResults);
        setSearchResults(parsedResults);
        setShowResults(true);
        return;
    }

    // Proceed with the API call if results are not in local storage
    try {
        const response = await fetch(`https://personalized-learning-dashboard.onrender.com/search?q=${searchTerm}`);
        const data = await response.json();

        // Store the fetched results in local storage
        localStorage.setItem(searchTerm, JSON.stringify(data.items));
        setSearchResults(data.items);
        setShowResults(true);
    } catch (error) {
        console.error('Error fetching search results:', error);
        setErrorMessage('Failed to fetch search results. Please try again later.');
    }
  };

  const handleSaveHistory = async (video, category) => {
    const requestBody = {
      userId,
      data: video,
      category: category
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
          category: category
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

  const handleVideoClick = (videoId) => {
    setSelectedVideoId(videoId); 
  };

  const closeModal = () => {
    setSelectedVideoId(''); 
  };


  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    }
  }, [searchTerm]);

  return (
    <main className="flex-1 p-4 bg-gray-100">
      {errorMessage && (
        <div className="text-gray-500 font-semibold mb-4">{errorMessage}</div>
      )}
      {showResults && !errorMessage && (
        <ul>
          {searchResults.map((video) => {
            const videoId = video.id.videoId; 
            return (
              <li key={videoId} className="mb-6 flex items-start">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveHistory(video, searchTerm);
                    handleVideoClick(videoId); // Pass videoId to the modal
                  }}
                  href="#"
                  className="mr-6"
                >
                  <img
                    src={video.snippet.thumbnails.high.url}
                    alt={video.snippet.title}
                    className="w-52 sm:w-64 h-28 sm:h-36 object-cover rounded-lg"
                  />
                </a>
                <div className="flex-1">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSaveHistory(video, searchTerm);
                      handleVideoClick(videoId); // Pass videoId to the modal
                    }}
                    href="#"
                    className="text-xs sm:text-sm md:text-lg font-semibold text-gray-800"
                  >
                    {video.snippet.title}
                  </a>
                  <p className="text-[0.7rem] sm:text-xs md:text-sm text-gray-600">{video.snippet.channelTitle}</p>
                </div>
                <div
                  className="flex items-center ml-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => handleSaveVideo(video, searchTerm)}
                >
                  <HiBookmark className="mr-2" />
                  <span className="text-sm">Save</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Watch Video Modal */}
      <WatchVideoModal videoId={selectedVideoId} onClose={closeModal} />
    </main>
  );
}

export default SearchResults;

import React, { useState, useEffect } from 'react';
import { validKeywords } from '../assets/validKeywords';

const Recommended = ({ userId, token }) => {
    const [recommended, setRecommended] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const getCategory = (title) => {
      const titleLower = title.toLowerCase(); 
      const foundKeyword = validKeywords.find(keyword => titleLower.includes(keyword.toLowerCase()));
      return foundKeyword || null;
    };

    const fetchRecommendations = async () => {
        try {
            const response = await fetch(`https://personalized-learning-dashboard.onrender.com/recommendations?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                try {
                    const data = await response.json();
                    setRecommended(data.recommendations);
                } catch (jsonError) {
                    console.error('Error parsing JSON:', jsonError);
                    setErrorMessage('Received invalid JSON response.');
                }
            } else {
                setErrorMessage('Failed to fetch recommended resources.');
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setErrorMessage('Error fetching recommendations.');
        }
    };
    

    const handleSaveHistory = async (video) => {
      const category = getCategory(video.snippet.title)
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

    useEffect(() => {
        const savedRecommendations = localStorage.getItem('recommendedVideos');
        if (savedRecommendations) {
            setRecommended(JSON.parse(savedRecommendations));
        } else {
            fetchRecommendations();
        }
    }, []);

    return (
        <main className="flex-1 p-4 bg-gray-100">
            {errorMessage && (
                <div className="text-gray-500 font-semibold mb-4">{errorMessage}</div>
            )}
            {recommended.length === 0 ? (
                <p className="text-gray-500">No recommendations available.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recommended.map((video, index) => {
                        const videoId = video.id.videoId;
                        return (
                            <div
                                key={`videoId-${index}`}
                                className="flex flex-col cursor-pointer"
                            >
                                <a
                                    onClick={() => handleSaveHistory(video)}
                                    href={`https://www.youtube.com/watch?v=${videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={video.snippet.thumbnails.high.url}
                                        alt={video.snippet.title}
                                        className="w-[90vw] sm:w-full h-60 sm:h-40 object-cover rounded-lg"
                                    />
                                </a>
                                <div className="mt-2">
                                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                                        {video.snippet.title}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        {video.snippet.channelTitle}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
};

export default Recommended;

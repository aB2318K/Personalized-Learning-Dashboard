import React, { useState, useEffect } from "react";

function Feedback({ userId, token }) {
    const [watched, setWatched] = useState([]);
    const [isFeedbackModalOpened, setIsFeedbackModalOpened] = useState(false);
    const [feedbackVideo, setFeedbackVideo] = useState(null);
    const [feedbackVideoId, setFeedbackVideoId] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [existingFeedbackId, setExistingFeedbackId] = useState(null);
    const [existingFeedbackText, setExistingFeedbackText] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [sentimentValue, setSentimentValue] = useState(0); 
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [textToAnalyse, setTextToAnalyse] = useState('');

    const MIN_FEEDBACK_LENGTH = 20;

    //Sentiment Analysis
    const analyzeSentiment = async (text) => {
        try {
            const response = await fetch(`https://personalized-learning-dashboard.onrender.com/sentiment?feedback=${text}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            // Check if the response is okay
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const sentimentScore = await response.json();
            
            // Set the sentiment value
            setSentimentValue(sentimentScore.score); 

        } catch (error) {
            console.error("Error analyzing sentiment:", error);
        }
    };

    // Fetch watched videos
    const fetchWatched = async () => {
        try {
            const response = await fetch(`https://personalized-learning-dashboard.onrender.com/saved/watched?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setWatched(data.watched || []);
        } catch (error) {
            console.error('Error fetching watched videos:', error);
        }
    };

    useEffect(() => {
        fetchWatched();
    }, [userId, token]);

    const closeModal = () => {
        setIsFeedbackModalOpened(false);
        setFeedbackVideo(null);
        setFeedbackVideoId('');
        setFeedbackText('');
        setExistingFeedbackId(null);
        setExistingFeedbackText('');
        setSuccessMessage('');
        setTextToAnalyse('');
        setFeedbackSubmitted(false);
    };

    const handleVideoClick = async (videoId, entryId) => {
        setIsFeedbackModalOpened(true);
        setFeedbackVideoId(entryId);

        const selectedVideo = watched.find((entry) => entry._id === entryId);
        setFeedbackVideo(selectedVideo?.data);

        const response = await fetch(`https://personalized-learning-dashboard.onrender.com/feedback?userId=${userId}&savedVideoId=${entryId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const feedbackData = await response.json();
            if (feedbackData.feedback) {
                setExistingFeedbackId(feedbackData.feedback._id);
                setFeedbackText(feedbackData.feedback.feedbackText);
                setExistingFeedbackText(feedbackData.feedback.feedbackText);
                setTextToAnalyse(feedbackData.feedback.feedbackText);
                analyzeSentiment(feedbackData.feedback.feedbackText);
                setFeedbackSubmitted(true);
            } else {
                setExistingFeedbackId(null);
                setFeedbackText('');
                setExistingFeedbackText('');
                setTextToAnalyse('');
                setFeedbackSubmitted(false);
            }
        } else {
            console.error('Error fetching feedback for the video');
        }
    };

    const handleFeedbackChange = (event) => {
        const text = event.target.value.replace(/\s+/g, ' ').trimStart();
        setFeedbackText(text);
        setTextToAnalyse('');
        setFeedbackSubmitted(false);
    };

    const isSubmitDisabled = feedbackText.trim().length < MIN_FEEDBACK_LENGTH;
    const isUpdateDisabled = feedbackText.trim() === existingFeedbackText.trim() || feedbackText.trim().length < MIN_FEEDBACK_LENGTH;

    // Handle creating new feedback
    const handleCreateFeedback = async () => {
        try {
            const feedbackPayload = {
                userId,
                savedVideoId: feedbackVideoId,
                feedbackText,
            };

            const response = await fetch('https://personalized-learning-dashboard.onrender.com/feedback', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackPayload),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Feedback submitted:', data);
            
            setExistingFeedbackId(data.feedback._id);
            setExistingFeedbackText(feedbackText);
            setTextToAnalyse(feedbackText);
            analyzeSentiment(feedbackText);
            setSuccessMessage('Feedback submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 2000);
            setFeedbackSubmitted(true);

        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    // Handle updating existing feedback
    const handleUpdateFeedback = async () => {
        const feedbackPayload = {
            userId,
            savedVideoId: feedbackVideoId,
            feedbackText,
        };

        try {
            const response = await fetch(`https://personalized-learning-dashboard.onrender.com/feedback/${existingFeedbackId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackPayload),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Feedback updated:', data);

            setExistingFeedbackText(feedbackText);  // Update the existingFeedbackText to disable the button
            setTextToAnalyse(feedbackText);
            analyzeSentiment(feedbackText);
            setSuccessMessage('Feedback updated successfully!');
            setTimeout(() => setSuccessMessage(''), 2000);
            setFeedbackSubmitted(true);
        } catch (error) {
            console.error('Error updating feedback:', error);
        }
    };

    // Handle submitting feedback (either create or update)
    const handleFeedbackSubmit = async () => {
        if (existingFeedbackId) {
            await handleUpdateFeedback();  // Update feedback if it already exists
        } else {
            await handleCreateFeedback();  // Create new feedback if no existing feedback
        }
    };

    // Handle deleting feedback
    const handleDeleteFeedback = async () => {
        if (!existingFeedbackId) return;

        try {
            const response = await fetch(`https://personalized-learning-dashboard.onrender.com/feedback/${existingFeedbackId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Feedback deleted successfully!');
                setSuccessMessage('Feedback deleted successfully!');
                setExistingFeedbackId(null);
                setExistingFeedbackText('');
                setTextToAnalyse('');
                setFeedbackSubmitted(false);
            } else {
                throw new Error(`Failed to delete feedback: ${response.statusText}`);
            }

            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (error) {
            console.error('Error deleting feedback:', error);
        }
    };

    return (
        <div className="flex-1 p-4 bg-gray-100 flex relative">
            <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4">Your Watched Videos</h2>
                {watched.length === 0 ? (
                    <p className="text-gray-500">No watched videos available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {watched.map((entry) => {
                            const video = entry.data;
                            return (
                                <div
                                    key={video.id.videoId}
                                    className="flex flex-col cursor-pointer"
                                    onClick={() => handleVideoClick(entry._id, entry._id)}
                                >
                                    <img
                                        src={video.snippet.thumbnails.high.url}
                                        alt={video.snippet.title}
                                        className="w-[90vw] sm:w-full h-60 sm:h-40 object-cover rounded-lg"
                                    />
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
            </div>

            {/* Background Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isFeedbackModalOpened ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeModal}
            />

            {/* Feedback Modal */}
            <div
                className={`fixed inset-0 z-50 flex justify-end transition-transform duration-300 ease-in-out ${isFeedbackModalOpened ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={closeModal}
            >
                <div
                    className="bg-white w-[80vw] sm:2/3 md:w-1/3 h-full p-6 overflow-y-auto relative"
                    onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside
                >
                    <button
                        className="absolute top-2 right-2 text-gray-600 font-bold text-xl"
                        onClick={closeModal}
                    >
                        ×
                    </button>
                    {feedbackVideo && (
                        <>
                            <h3 className="text-sm sm:text-lg md:text-2xl text-center text-gray-700 font-bold mb-4">Feedback for Video</h3>
                            <div className="mb-2 md:mb-4">
                                <img
                                    src={feedbackVideo.snippet.thumbnails.high.url}
                                    alt={feedbackVideo.snippet.title}
                                    className="w-3/4 h-48 object-cover mb-1 md:mb-4 rounded-lg mx-auto"
                                />
                                <h4 className="text-sm md:text-lg font-semibold text-gray-700 text-center md:text-left">
                                    {feedbackVideo.snippet.title}
                                </h4>
                                <p className="text-xs md:text-sm text-gray-600 mb-4 text-center md:text-left">
                                    {feedbackVideo.snippet.channelTitle}
                                </p>
                            </div>

                            <textarea
                                className="w-full h-20 md:h-24 p-2 border rounded mb-1 md:mb-4"
                                placeholder="Your feedback here..."
                                value={feedbackText}
                                onChange={handleFeedbackChange}
                            />
                            <div className="flex justify-end">
                                {existingFeedbackId ? (
                                    <>
                                        <button
                                            className={`px-2 py-1 sm:px-4 sm:py-2 text-sm md:text-base rounded-md focus:outline-none focus:ring-2 ${!isUpdateDisabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 text-gray-500 cursor-default'}`}
                                            disabled={isUpdateDisabled}
                                            onClick={handleUpdateFeedback}
                                        >
                                            Update Feedback
                                        </button>
                                        <button
                                            className={'px-2 py-1 sm:px-4 sm:py-2 text-sm md:text-base ml-2 rounded-md focus:outline-none focus:ring-2 bg-gray-600 hover:bg-gray-700 text-white'}
                                            onClick={handleDeleteFeedback}
                                        >
                                            Remove Feedback
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className={`px-2 py-1 sm:px-4 sm:py-2 text-sm md:text-base rounded-md focus:outline-none focus:ring-2 ${!isSubmitDisabled ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 text-gray-500 cursor-default'}`}
                                        disabled={isSubmitDisabled}
                                        onClick={handleFeedbackSubmit}
                                    >
                                        Submit Feedback
                                    </button>
                                )}
                            </div>

                            {/* Success message displayed below the buttons */}
                            {successMessage && (
                                <div className="mt-4 absolute bottom-20 left-0 right-0 text-gray-400 font-semibold text-center">
                                    {successMessage}
                                </div>
                            )}
                            <div className="mt-2 md:mt-4">
                                <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1">Feedback Insight:</p>
                                <div className="w-full bg-gray-400 h-4 sm:h-5 rounded-full relative">
                                    {feedbackSubmitted && <div
                                        className="h-4 sm:h-5 rounded-full"
                                        style={{
                                            width: `${sentimentValue}%`,
                                            backgroundColor:
                                            sentimentValue < 20
                                                ? '#8B0000' // Very Negative
                                                : sentimentValue < 50
                                                ? '#A52A2A' // Somewhat Negative
                                                : sentimentValue < 60
                                                ? '#B8860B' // Neutral
                                                : sentimentValue < 75
                                                ? '#9ACD32' // Somewhat Positive
                                                : '#006400', // Very Positive
                                            transition: 'width 0.3s ease',
                                        }}
                                    ></div>}
                                    {feedbackSubmitted && <div className="absolute top-0 left-0 w-full text-center text-xs sm:text-sm font-semibold text-white">
                                        {sentimentValue < 20
                                            ? "Very Negative"
                                            : sentimentValue < 50
                                            ? "Somewhat Negative"
                                            : sentimentValue < 60
                                            ? "Neutral"
                                            : sentimentValue < 75
                                            ? "Somewhat Positive"
                                            : "Very Positive"}
                                    </div>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Feedback;

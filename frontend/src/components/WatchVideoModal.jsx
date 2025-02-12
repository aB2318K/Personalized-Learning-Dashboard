import React from 'react';

function WatchVideoModal({ videoId, onClose }) {
  if (!videoId) return null;

  return (
    <div className="watch-modal fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="relative w-full max-w-4xl bg-gray-400 rounded-sm p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="video-close absolute top-0 right-0 text-white bg-gray-600 hover:bg-gray-700 p-1 z-10"
        >
          X
        </button>
        {/* Video iframe */}
        <div className="relative pt-[56.25%]">
          <iframe
            data-testid="video-iframe"
            className="absolute top-0 left-0 w-full h-full rounded-lg z-0" 
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default WatchVideoModal;

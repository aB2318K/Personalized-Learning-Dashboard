import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ForumTabs({ userId, token }) {
  const [activeForumTab, setActiveForumTab] = useState('newPosts');
  const navigate = useNavigate();

  const isMyPosts = location.pathname.startsWith('/forum/my-posts');
  const isForumSearch = location.pathname.startsWith('/forum/search');

  useEffect(() => {
    isMyPosts ? setActiveForumTab('myPosts') : setActiveForumTab('newPosts')
    isForumSearch && setActiveForumTab('')
  })
  
  return (
    <main className="p-4 mt-4 flex justify-center">
      {/* Buttons for selecting the active tab */}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => {
            navigate('/forum')
          }}
          className={`text-sm md:text-base p-1 px-2 md:p-2 md:px-4 rounded-lg ${
            activeForumTab === 'newPosts' ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          New Posts
        </button>
        <button
          onClick={() => {
            navigate('/forum/my-posts')
          }}
          className={`text-sm md:text-base p-1 px-2 md:p-2 md:px-4 rounded-lg ${
            activeForumTab === 'myPosts' ? 'bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          My Posts
        </button>
      </div>
    </main>
  );
}

export default ForumTabs;
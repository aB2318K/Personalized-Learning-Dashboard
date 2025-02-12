import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Posts = ({ token }) => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/questions/all`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        } else {
          console.warn('Unexpected response format:', data);
          setPosts([]);
        }
      } else {
        console.error('Failed to fetch posts:', response.statusText);
        setPosts([]);
      }

    } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [])

  return (
    <div className="py-6 px-4">
      <div className="space-y-6 max-w-3xl mx-auto">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div
              key={index}
              className="w-full mb-4 border-b border-gray-200 pb-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm">{post.user.firstname} {post.user.lastname}</span>
                <span className="text-sm text-gray-500">
                  Posted on <span className="font-medium">{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
                </span>
              </div>
            
              <Link to={`/forum/post/${post._id}`}>
                <h2 className="mt-2 text-xl font-semibold text-gray-700 hover:text-gray-900">
                  {post.title}
                </h2>
              </Link>
  
              <div className="text-gray-600 break-all">
                {post.description.length > 100
                  ? post.description.substring(0, 100) + '...'
                  : post.description}
              </div>
  
              <Link to={`/forum/post/${post._id}`} className="mt-4 flex items-center justify-between">
                <span className="text-gray-500 text-sm">{post.answersCount} Answers</span>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Posts;

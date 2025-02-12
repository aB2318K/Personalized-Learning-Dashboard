import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MyPosts = ({ userId, token }) => {
  const [myPosts, setMyPosts] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [initialTitle, setInitialTitle] = useState('');
  const [initialDescription, setInitialDescription] = useState('');

  //Hanle saving notifcation to be sent
  const handleCreateNotification = async (userId, type, postId) => {
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          type,
          postId
        })
      });
       const data = await response.json();
       
       if (response.ok) {
        console.log('Notification created successfully:', data); 
      } else {
        console.error('Error creating notification:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Handle post creation
  const handleCreatePost = async () => {
    const trimmedTitle = questionTitle.trim();
    const trimmedDescription = questionDescription.trim();
  
    if (!trimmedTitle || !trimmedDescription) return; 
  
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          questionTitle: trimmedTitle,
          questionDescription: trimmedDescription,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Post created successfully!');
        setQuestionTitle('');
        setQuestionDescription('');
  
        setTimeout(() => {
          setIsModalOpen(false); 
          setSuccessMessage(''); 
          fetchMyPosts();
        }, 2000);
        handleCreateNotification(userId, 'question', data.question._id);
      } else {
        console.error('Error creating post:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Editing a post
  const handleEditPost = async () => {
    const trimmedTitle = questionTitle.trim();
    const trimmedDescription = questionDescription.trim();
  
    if (!trimmedTitle || !trimmedDescription) return;
  
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionTitle: trimmedTitle,
          questionDescription: trimmedDescription,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Post updated successfully!');
        setQuestionTitle('');
        setQuestionDescription('');
        setEditingPost(null);
  
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSuccessMessage('');
          fetchMyPosts(); // Refresh posts after successful update
        }, 2000);
      } else {
        console.error('Error updating post:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  //Delete Post
  const handleDeletePost = async () => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/${editingPost._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        setDeleteMessage('Post deleted successfully!');
        
        setTimeout(() => {
          setIsDeleteModalOpen(false);
          setDeleteMessage('');
          setMyPosts(myPosts.filter(post => post._id !== editingPost._id));
        }, 2000);
      } else {
        console.error('Error deleting post:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  

  const fetchMyPosts = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/questions?userId=${userId}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.posts && Array.isArray(data.posts)) {
          setMyPosts(data.posts);
          setFirstName(data.firstName);
          setLastName(data.lastName);
        } else {
          console.warn('Unexpected response format:', data);
          setMyPosts([]);
        }
      } else {
        console.error('Failed to fetch posts:', response.statusText);
        setMyPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMyPosts([]);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setQuestionTitle(post.title);
    setQuestionDescription(post.description);
    setInitialTitle(post.title);
    setInitialDescription(post.description);
    setIsEditModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value.replace(/\s+/g, ' ').trimStart();
    setQuestionTitle(value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value.replace(/\s+/g, ' ').trimStart();
    setQuestionDescription(value);
  };

  const newPostModal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90vw] md:w-1/3">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
        
        {/* Input fields for title and description */}
        <div className="mb-4">
          <label htmlFor="questionTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Question Title
          </label>
          <input
            id="questionTitle"
            type="text"
            placeholder="Enter question title"
            value={questionTitle}
            onChange={handleTitleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            maxLength={100}
          />
        </div>
  
        <div className="mb-4">
          <label htmlFor="questionDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Question Description
          </label>
          <textarea
            id="questionDescription"
            placeholder="Enter question description"
            rows="4"
            value={questionDescription}
            onChange={handleDescriptionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            maxLength={500}
          ></textarea>
        </div>
  
        {/* Conditionally render either success message or the buttons */}
        {successMessage ? (
          <p className="text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg w-full">
            {successMessage}
          </p>
        ) : (
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setQuestionTitle('');
                setQuestionDescription('');
              }}
              className="text-sm md:text-base px-2 py-1 md:px-4 md:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePost}
              disabled={!questionTitle.trim() || !questionDescription.trim()}
              className={`createBtn text-sm: md:text-base px-2 py-1 rounded-md text-white ${
                !questionTitle.trim() || !questionDescription.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500'
              }`}
            >
              Create
            </button>
          </div>
        )}
      </div>
    </div>
  );  

  const editPostModal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90vw] md:w-1/3">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Post</h3>
        
        {/* Input fields for title and description */}
        <div className="mb-4">
          <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Question Title
          </label>
          <input
            id="editTitle"
            type="text"
            placeholder="Edit question title"
            value={questionTitle}
            onChange={handleTitleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            maxLength={100}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Question Description
          </label>
          <textarea
            id="editDescription"
            placeholder="Edit question description"
            rows="4"
            value={questionDescription}
            onChange={handleDescriptionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            maxLength={500}
          ></textarea>
        </div>
        
        {/* Conditionally render either success message or the buttons */}
        {successMessage ? (
          <p className="text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg w-full">
            {successMessage}
          </p>
        ) : (
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPost(null);
                setQuestionTitle('');
                setQuestionDescription('');
              }}
              className="px-2 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              data-testid="edit-button"
              onClick={handleEditPost}
              disabled={
                !questionTitle.trim() ||
                !questionDescription.trim() ||
                (questionTitle === initialTitle && questionDescription === initialDescription)
              }
              className={`px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-md text-white ${
                !questionTitle.trim() ||
                !questionDescription.trim() ||
                (questionTitle.trim() === initialTitle.trim() && questionDescription.trim() === initialDescription.trim())
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500'
              }`}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const deletePostModal = (
    <div className="delete_modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-[90vw] md:w-1/4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Post</h3>
        <p className="text-sm font-semibold text-gray-700 mb-4">
          Are you sure you want to delete this post?
        </p>
        {deleteMessage ? (
          <p className="text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg">
            {deleteMessage}
          </p>
        ) : (
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-600 text-white px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePost}
              className="bg-gray-600 text-white px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );  

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <div>
      <div className="my-4">
        <button
          className="p-1 px-2 md:p-2 md:px-3 rounded-lg bg-gray-600 text-white text-sm md:text-base hover:bg-gray-700 ml-4"
          onClick={() => setIsModalOpen(true)}
        >
          Create New
        </button>
      </div>

      {isModalOpen && newPostModal}
      {isEditModalOpen && editPostModal}
      {isDeleteModalOpen && deletePostModal}

      <div className="py-6 px-4">
        <div className="space-y-6 max-w-3xl mx-auto">
          {myPosts.length > 0 ? (
            myPosts.map((post, index) => (
              <div key={index} className="w-full mb-4 border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium text-sm">{firstName} {lastName}</span>
                  <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Posted on <span className="font-medium">{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
                  </span>

                    <button onClick={() => openEditModal(post)}>
                      <FaEdit className="editMdl w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                    <button onClick={() => {
                        setEditingPost(post); 
                        setIsDeleteModalOpen(true);
                    }}>
                        <FaTrash className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
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
            <p className="text-sm md:text-base text-gray-500">No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPosts;

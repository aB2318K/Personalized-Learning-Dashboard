import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSend, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';  
import { FaEdit, FaTrash } from 'react-icons/fa';

const PostPage = ({ userId, token, postId }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [initialTitle, setInitialTitle] = useState('');
  const [initialDescription, setInitialDescription] = useState('');
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  //Hanle saving notifcation to be sent
  const handleCreateNotification = async (answerId) => {
    try {
      const response = await fetch('https://personalized-learning-dashboard.onrender.com/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          type: 'answer',
          postId,
          answerId
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

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return;

    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: newAnswer, userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        data.answer.new = true;
        setAnswers((prevAnswers) => [...prevAnswers, data.answer]);
        setNewAnswer('');
        setPost((prevPost) => ({
          ...prevPost,
          answersCount: prevPost.answersCount + 1,
        }));
        handleCreateNotification(data.answer._id);
      } else {
        console.error('Failed to post answer:', response.status);
      }
    } catch (error) {
      console.error('Error posting answer:', error);
    }
  };

  const handleVote = async (answerId, voteType) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/answers/${answerId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) =>
            answer._id === answerId ? { ...answer, ...data.updatedAnswer } : answer
          )
        );
      } else {
        console.error('Failed to vote on answer:', response.status);
      }
    } catch (error) {
      console.error('Error voting on answer:', error);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/answers/${answerId}?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        setAnswers((prevAnswers) => prevAnswers.filter((answer) => answer._id !== answerId));
        setPost((prevPost) => ({
          ...prevPost,
          answersCount: prevPost.answersCount - 1,
        }));
      } else {
        console.error('Failed to delete answer:', response.status);
      }
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  // Editing a post
  const handleEditPost = async () => {
    const trimmedTitle = questionTitle.trim();
    const trimmedDescription = questionDescription.trim();
  
    if (!trimmedTitle || !trimmedDescription) return;
  
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/${post._id}`, {
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
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSuccessMessage('');
          setPostTitle(trimmedTitle);
          setPostDescription(trimmedDescription);
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
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/${post._id}`, {
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
          navigate('/forum')
        }, 2000);
      } else {
        console.error('Error deleting post:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value.replace(/\s+/g, ' ').trimStart();
    setQuestionTitle(value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value.replace(/\s+/g, ' ').trimStart();
    setQuestionDescription(value);
  };

  const openEditModal = () => {
    setQuestionTitle(postTitle);
    setQuestionDescription(postDescription);
    setInitialTitle(postTitle);
    setInitialDescription(postDescription);
    setIsEditModalOpen(true);
  };

  const editPostModal = (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" role="dialog">
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
                setQuestionTitle('');
                setQuestionDescription('');
              }}
              className="px-2 py-1 md:px-4 md:py-2 text-sm md:text-base bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              data-testid="edit-save"
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
      <div className="bg-white p-5 rounded-lg shadow-lg w-1/4">
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
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
            >
              Cancel
            </button>
            <button
              data-testid="delete-confirm"
              onClick={handleDeletePost}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const fetchPost = async () => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/questions/${postId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.post) {
          setPost(data.post);
          setPostTitle(data.post.title);
          setPostDescription(data.post.description);
          setIsLoggedInUser(userId === data.post.user._id);
          const sortedAnswers = data.answers.sort((a, b) => {
            const aVotes = a.upvotes - a.downvotes;
            const bVotes = b.upvotes - b.downvotes;
            return bVotes - aVotes; 
          });
  
          setAnswers(sortedAnswers);
        } else {
          console.error('Post not found:', data.message);
          navigate('/forum'); // Redirect to forum if the post is not found
        }
      } else {
        console.error('Failed to fetch post:', response.statusText);
        navigate('/forum'); // Redirect to forum if there's an error in the response
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      navigate('/forum'); // Redirect to forum if there's a network or other error
    }
  };  

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <div className="py-6 px-4 bg-gray-50 w-full max-w-3xl mx-auto mt-4 md:mt-8 h-screen md:h-auto">
      {isEditModalOpen && editPostModal}
      {isDeleteModalOpen && deletePostModal}
      {/* Post Header: Title, Author, Date */}
      <div className="border-b pb-4 mb-3 md:mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 font-medium text-sm">
            {post.user?.firstname} {post.user?.lastname}
          </span>
          <span className="text-sm text-gray-500">
            Posted on <span className="font-medium">{new Date(post.createdAt).toLocaleDateString('en-GB')}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <h1 className="text-lg md:text-2xl font-bold text-gray-700">{postTitle}</h1>
          {isLoggedInUser && <div>
            <button onClick={() => openEditModal()}>
              <FaEdit data-testid="edit" className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
            <button onClick={() => {
              setIsDeleteModalOpen(true);
            }}>
              <FaTrash data-testid="delete" className="w-5 h-5 text-gray-500 hover:text-gray-700 ml-2" />
            </button>
          </div>}
        </div>
        
        
      </div>

      {/* Post Content: Description */}
      <div className="text-gray-700 mb-3 md:mb-6 bg-white rounded-lg p-4 shadow break-all">
        <p>{postDescription}</p>
      </div>
      <span className="text-gray-500 text-sm">{post.answersCount} Answers</span>

      {/* Answers Section */}
      <div className="mt-3 md:mt-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Answers</h2>

        {/* List of Answers */}
        {answers.length === 0 ? (
          <p className="text-xs md:text-base text-gray-500">No answers yet. Be the first to answer!</p>
        ) : (
          answers.map((answer, index) => {
            const userVote = answer.votes.find(vote => vote.userId === userId);

            return (
              <div
                key={index}
                className="border-t pt-2 md:pt-4 mb-4 bg-gray-100 rounded-lg p-2 md:p-4 shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="text-gray-600 font-medium">
                      {answer.user.firstname} {answer.user.lastname}
                    </div>
                    <div className="text-gray-700 mt-2 w-full break-all">
                      {answer.answer}
                    </div>
                    <div className="text-gray-500 text-sm mt-2">
                      Answered on {new Date(answer.createdAt).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex items-center mt-4 space-x-4">
                      {/* Upvote Button with Conditional Styling */}
                      <button
                        onClick={() => handleVote(answer._id, 'upvote')}
                        className={`${
                          userVote?.voteType === 'upvote' ? 'text-gray-700' : 'text-gray-500'
                        } hover:text-gray-800 flex items-center space-x-1`}
                      >
                        <FiThumbsUp className="w-5 h-5" />
                        <span>{answer.upvotes}</span>
                      </button>

                      {/* Downvote Button with Conditional Styling */}
                      <button
                        onClick={() => handleVote(answer._id, 'downvote')}
                        className={`${
                          userVote?.voteType === 'downvote' ? 'text-gray-700' : 'text-gray-500'
                        } hover:text-gray-800 flex items-center space-x-1`}
                      >
                        <FiThumbsDown className="w-5 h-5" />
                        <span>{answer.downvotes}</span>
                      </button>

                      {/* Trash Icon for Deleting Answer (Only If User Is Author) */}
                      {((answer.user._id === userId) || answer.new) && (
                        <button
                          onClick={() => handleDeleteAnswer(answer._id)}
                          className="text-gray-400 hover:text-gray-600 flex items-center space-x-1"
                        >
                          <FaTrash className="del-ans w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Answer Input Field */}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Post your answer here"
            className="flex-1 border border-gray-300 rounded-lg px-2 md:px-4 py-1 md:py-2 text-gray-700 focus:outline-none focus:ring focus:ring-gray-600"
          />
          <button data-testid="send-answer" className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-2 py-2" onClick={handlePostAnswer}>
            <FiSend className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Link to="/forum" className="text-gray-500 hover:underline">Back to Forum</Link>
      </div>
    </div>
  );
};

export default PostPage; 
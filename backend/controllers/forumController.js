import mongoose from 'mongoose';
import Post from '../models/Post.js';
import PostAnswer from '../models/PostAnswer.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Post-related Controllers
export const createPost = async (req, res) => {
    try {
        const { userId, questionTitle, questionDescription } = req.body;
    
        // Validate required fields
        if (!userId || !questionTitle || !questionDescription) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
    
        // Create a new post
        const newQuestion = new Post({
          title: questionTitle,
          user: userId,
          description: questionDescription,
        });
    
        // Save to database
        const savedQuestion = await newQuestion.save();
    
        return res.status(201).json({
          message: 'Question posted successfully.',
          question: savedQuestion,
        });
      } catch (error) {
        console.error('Error posting question:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getPosts = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Fetch user by ID
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch posts by user
        const userPosts = await Post.find({ user: userId }).sort({ createdAt: -1 });

        // If no posts are found
        if (userPosts.length === 0) {
            return res.status(200).json({ 
                message: 'No posts found for this user.', 
                posts: [] 
            });
        }

        // If posts are found
        return res.status(200).json({ 
            message: 'Posts retrieved successfully.', 
            firstName: user.firstname,  
            lastName: user.lastname,
            posts: userPosts 
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error. Could not fetch posts.' });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { id } = req.params; 
        const { questionTitle, questionDescription } = req.body;

        if (!questionTitle || !questionDescription) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { 
                title: questionTitle, 
                description: questionDescription 
            },
            { new: true, runValidators: true } 
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        return res.status(200).json({
            message: 'Post updated successfully.',
            post: updatedPost,
        });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the post (question)
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Delete notifications related to this post
        await Notification.deleteMany({ postId: id });

        return res.status(200).json({
            message: 'Post and related notifications deleted successfully.',
            post: deletedPost,
        });
    } catch (error) {
        console.error('Error deleting post and related notifications:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const allPosts = await Post.find({}).populate('user', 'firstname lastname').sort({ createdAt: -1 });
        // If no posts exist
        if (allPosts.length === 0) {
            return res.status(200).json({
                message: 'No posts found.',
                posts: [],
            });
        }

        // If posts exist
        return res.status(200).json({
            message: 'All posts retrieved successfully.',
            posts: allPosts,
        });
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ message: 'Server error. Could not fetch posts.' });
    }
};

export const searchPosts = async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    try {
        // Use case-insensitive regex for partial matching
        const posts = await Post.find({
            title: { $regex: q, $options: 'i' },
        }).populate('user', 'firstname lastname');

        return res.status(200).json({
            message: 'Search results fetched successfully.',
            posts,
        });
    } catch (error) {
        console.error('Error searching posts:', error);
        return res.status(500).json({ message: 'Server error. Could not fetch search results.' });
    }
};

export const getPostDetails = async (req, res) => {
    try {
        const { id } = req.params;  
        // Find the post by ID and populate user information
        const post = await Post.findById(id).populate('user', 'firstname lastname');

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Find all answers associated with the post
        const answers = await PostAnswer.find({ post: id }).populate('user', 'firstname lastname');

        return res.status(200).json({
            message: 'Post retrieved successfully.',
            post: post,
            answers: answers, // Include the answers in the response
        });
    } catch (error) {
        console.error('Error fetching post by ID:', error);
        return res.status(500).json({ message: 'Internal server error. Could not fetch post.' });
    }
};

// Answer-related Controllers
export const createAnswer = async (req, res) => {
    const { id } = req.params;
    const { answer, userId } = req.body;

    if (!answer) {
        return res.status(400).json({ message: 'Answer content is required.' });
    }

    try {
        // Verify that the post exists
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Create and save the new answer
        const newAnswer = new PostAnswer({
            post: id,
            user: userId,
            answer,
        });

        await newAnswer.save();

        // Increase the post answer count
        post.answersCount += 1;
        await post.save();

        // Populate user details in the newly created answer
        const populatedAnswer = await PostAnswer.findById(newAnswer._id).populate('user', 'firstname lastname');

        // Return the newly created and populated answer
        res.status(201).json({
            message: 'Answer created successfully.',
            answer: populatedAnswer,
        });
    } catch (error) {
        console.error('Error creating answer:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const handleVote = async (req, res) => {
    const { id } = req.params;  
    const { voteType, userId } = req.body;  

    if (!['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({ message: 'Invalid vote type.' });
    }

    try {
        // Find the answer by ID
        const answer = await PostAnswer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        // Check if the user has already voted on this answer
        const existingVote = answer.votes.find(vote => vote.userId.toString() === userId);

        if (existingVote) {
            // If the user has voted, update their existing vote
            if (existingVote.voteType === voteType) {
                // If the user is trying to vote the same way, remove their vote
                answer.votes = answer.votes.filter(vote => vote.userId.toString() !== userId);
                voteType === 'upvote' ? answer.upvotes-- : answer.downvotes--;
            } else {
                // If the user is changing their vote, update the vote type
                existingVote.voteType = voteType;
                voteType === 'upvote' ? answer.upvotes++ : answer.downvotes++;
                voteType === 'downvote' ? answer.upvotes-- : answer.downvotes--;
            }
        } else {
            // If the user hasn't voted yet, add their vote
            answer.votes.push({ userId, voteType });
            voteType === 'upvote' ? answer.upvotes++ : answer.downvotes++;
        }

        await answer.save();

        res.status(200).json({
            message: 'Vote processed successfully.',
            updatedAnswer: {
                upvotes: answer.upvotes,
                downvotes: answer.downvotes,
                votes: answer.votes,
            },
        });
    } catch (error) {
        console.error('Error processing vote:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const deleteAnswer = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.query;

    try {
        // Find the answer by ID
        const answer = await PostAnswer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found.' });
        }

        // Check if the user is the owner of the answer
        if (answer.user.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this answer.' });
        }

        // Delete the notification related to this answer
        await Notification.findOneAndDelete({ answerId: id });

        // Remove the answer from the database
        await PostAnswer.findByIdAndDelete(id);

        // Decrease the post's answer count
        const post = await Post.findById(answer.post);
        if (post) {
            post.answersCount -= 1;
            await post.save();
        }

        res.status(200).json({ message: 'Answer and its notification deleted successfully.' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Notification Controllers
export const manageNotification = async (req, res) => {
    const { userId, type, postId, answerId } = req.body;

    try {
        if (type === 'question') {
            // Find all users except the one who posted the question
            const usersToNotify = await User.find({ _id: { $ne: userId } }).select('_id');
            const recipientIds = usersToNotify.map(user => user._id);
            
            // Create a single notification with an array of recipients
            const newNotification = new Notification({
                type,
                postId,
                triggeredBy: userId,
                recipients: recipientIds, // Save recipients as an array
            });
            
            await newNotification.save();

            return res.status(201).json({ message: 'Notifications for the question are saved.', notification: newNotification });
        } else if (type === 'answer') {
            // Find the user who posted the original question
            const question = await Post.findById(postId).select('user');

            if (!question) {
                return res.status(404).json({ message: 'Question not found.' });
            }

            if (question.user.equals(userId)) {
                return res.status(200).json({ message: 'Answer posted by the question author, no notification needed.' });
            } else {
                // Create a single notification for the question's author
                const newNotification = new Notification({
                    type,
                    postId,
                    answerId,
                    triggeredBy: userId,
                    recipients: [question.user], // Save the question author as the only recipient
                });

                await newNotification.save();

                return res.status(201).json({ message: 'Notification for the answer is saved.', notification: newNotification });
            }
        } else {
            return res.status(400).json({ message: 'Invalid notification type.' });
        }
    } catch (error) {
        console.error('Error saving notification:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const fetchNotifications = async (req, res) => {
    const { userId } = req.query;
    try {
        const notifications = await Notification.find({ recipients: userId }) 
            .populate('triggeredBy', 'firstname lastname') 
            .sort({ createdAt: -1 });

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const clearNotification = async (req, res) => {
    const { userId, notificationId } = req.body;
    try {
        // Update the notification by removing the user from the recipients array
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { $pull: { recipients: userId } }, // Remove the userId from the recipients array
            { new: true } // Return the updated document
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        // Check if there are any remaining recipients
        if (notification.recipients.length === 0) {
            // If no more recipients, delete the notification from the database
            await Notification.findByIdAndDelete(notificationId);
            return res.status(200).json({ message: 'Notification cleared and deleted successfully.' });
        }

        return res.status(200).json({ message: 'Notification updated successfully.', notification });
    } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
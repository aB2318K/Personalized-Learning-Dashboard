import mongoose from 'mongoose';
import Post from '../models/Post.js';
import PostAnswer from '../models/PostAnswer.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Post-related Controllers
export const createPost = async (req, res) => {
  try {
    const { userId, questionTitle, questionDescription } = req.body;

    if (!userId || !questionTitle || !questionDescription) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newPost = new Post({
      title: questionTitle,
      user: userId,
      description: questionDescription,
    });

    const savedPost = await newPost.save();
    res.status(201).json({
      message: 'Question posted successfully.',
      post: savedPost,
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ message: 'User ID required.' });
    
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'firstname lastname');

    res.status(200).json({
      message: posts.length ? 'Posts retrieved successfully.' : 'No posts found.',
      posts
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ message: 'Server error fetching posts.' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionTitle, questionDescription } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title: questionTitle, description: questionDescription },
      { new: true, runValidators: true }
    );

    if (!updatedPost) return res.status(404).json({ message: 'Post not found.' });
    
    res.status(200).json({
      message: 'Post updated successfully.',
      post: updatedPost
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) return res.status(404).json({ message: 'Post not found.' });

    await Notification.deleteMany({ postId: id });
    res.status(200).json({
      message: 'Post and notifications deleted.',
      post: deletedPost
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'firstname lastname')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: posts.length ? 'All posts retrieved.' : 'No posts available.',
      posts
    });
  } catch (error) {
    console.error('All posts fetch error:', error);
    res.status(500).json({ message: 'Server error fetching posts.' });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required.' });

    const posts = await Post.find({ title: { $regex: q, $options: 'i' } })
      .populate('user', 'firstname lastname');

    res.status(200).json({
      message: posts.length ? 'Search results found.' : 'No matching posts.',
      posts
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error during search.' });
  }
};

export const getPostDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('user', 'firstname lastname');
    
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const answers = await PostAnswer.find({ post: id })
      .populate('user', 'firstname lastname');

    res.status(200).json({
      message: 'Post details retrieved.',
      post,
      answers
    });
  } catch (error) {
    console.error('Post details error:', error);
    res.status(500).json({ message: 'Server error fetching post.' });
  }
};

// Answer-related Controllers
export const createAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer, userId } = req.body;

    if (!answer) return res.status(400).json({ message: 'Answer content required.' });

    const newAnswer = new PostAnswer({
      post: id,
      user: userId,
      answer
    });

    await newAnswer.save();
    await Post.findByIdAndUpdate(id, { $inc: { answersCount: 1 } });

    const populatedAnswer = await PostAnswer.findById(newAnswer._id)
      .populate('user', 'firstname lastname');

    res.status(201).json({
      message: 'Answer created successfully.',
      answer: populatedAnswer
    });
  } catch (error) {
    console.error('Answer creation error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const handleVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType, userId } = req.body;

    const answer = await PostAnswer.findById(id);
    if (!answer) return res.status(404).json({ message: 'Answer not found.' });

    const existingVoteIndex = answer.votes.findIndex(v => v.userId.equals(userId));

    if (existingVoteIndex > -1) {
      const existingVote = answer.votes[existingVoteIndex];
      if (existingVote.voteType === voteType) {
        // Remove vote
        answer.votes.splice(existingVoteIndex, 1);
        voteType === 'upvote' ? answer.upvotes-- : answer.downvotes--;
      } else {
        // Change vote
        existingVote.voteType = voteType;
        voteType === 'upvote' ? (answer.upvotes++, answer.downvotes--) : (answer.downvotes++, answer.upvotes--);
      }
    } else {
      // Add new vote
      answer.votes.push({ userId, voteType });
      voteType === 'upvote' ? answer.upvotes++ : answer.downvotes++;
    }

    await answer.save();
    res.status(200).json({
      message: 'Vote processed successfully.',
      upvotes: answer.upvotes,
      downvotes: answer.downvotes
    });
  } catch (error) {
    console.error('Voting error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const answer = await PostAnswer.findById(id);
    if (!answer) return res.status(404).json({ message: 'Answer not found.' });

    if (!answer.user.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized to delete this answer.' });
    }

    await PostAnswer.findByIdAndDelete(id);
    await Post.findByIdAndUpdate(answer.post, { $inc: { answersCount: -1 } });
    await Notification.deleteOne({ answerId: id });

    res.status(200).json({ message: 'Answer deleted successfully.' });
  } catch (error) {
    console.error('Answer deletion error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Notification Controllers
export const manageNotification = async (req, res) => {
  try {
    const { type, postId, answerId, userId } = req.body;

    let recipients = [];
    if (type === 'question') {
      recipients = await User.find({ _id: { $ne: userId } }).select('_id');
    } else if (type === 'answer') {
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: 'Post not found.' });
      if (!post.user.equals(userId)) recipients = [post.user];
    }

    if (recipients.length > 0) {
      const notification = new Notification({
        type,
        postId,
        answerId,
        triggeredBy: userId,
        recipients: recipients.map(u => u._id)
      });
      await notification.save();
    }

    res.status(201).json({ message: 'Notifications handled successfully.' });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const fetchNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const notifications = await Notification.find({ recipients: userId })
      .populate('triggeredBy', 'firstname lastname')
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

export const clearNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $pull: { recipients: userId } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    if (notification.recipients.length === 0) {
      await Notification.findByIdAndDelete(notificationId);
      return res.status(200).json({ message: 'Notification cleared and deleted.' });
    }

    res.status(200).json({ message: 'Notification updated.', notification });
  } catch (error) {
    console.error('Notification clear error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
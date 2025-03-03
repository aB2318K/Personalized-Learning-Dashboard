import mongoose from 'mongoose';
import History from '../models/History.js';
import Saved from '../models/Saved.js';
import User from '../models/User.js';

export const addHistory = async (req, res) => {
  try {
    const { userId, data, category } = req.body;

    if (!userId || !data) {
      return res.status(400).json({ message: 'User ID and video data are required.' });
    }

    const existingHistory = await History.findOne({ 
      userId, 
      'data.id.videoId': data.id.videoId 
    });

    if (existingHistory) {
      return res.status(200).json({ message: 'Video already exists in history.' });
    }

    const historyEntry = new History({
      userId,
      data,
      category,
      viewedAt: new Date(),
    });

    await historyEntry.save();
    return res.status(201).json({ message: 'Video added to history.', history: historyEntry });

  } catch (error) {
    console.error('Error saving to history:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const history = await History.find({ userId }).sort({ viewedAt: -1 });

    if (!history?.length) {
      return res.status(200).json({ message: 'No history found.', history: [] });
    }

    return res.status(200).json({ history });

  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ message: 'Server error. Could not fetch history.' });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    if (!userId || !videoId) {
      return res.status(400).json({ message: 'User ID and video ID are required.' });
    }

    const result = await History.deleteOne({ 
      userId, 
      'data.id.videoId': videoId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Video not found in history.' });
    }

    return res.status(200).json({ message: 'Video removed from history.' });

  } catch (error) {
    console.error('Error deleting history:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const addSaved = async (req, res) => {
  try {
    const { userId, data, category } = req.body;

    if (!userId || !data) {
      return res.status(400).json({ message: 'User ID and video data are required.' });
    }

    const existingSaved = await Saved.findOne({
      userId,
      'data.id.videoId': data.id.videoId
    });

    if (existingSaved) {
      return res.status(200).json({ message: 'Video already exists in saved.' });
    }

    const savedEntry = new Saved({
      userId,
      data,
      category,
      savedAt: new Date(),
    });

    await savedEntry.save();
    return res.status(201).json({ message: 'Video added to saved.', saved: savedEntry });

  } catch (error) {
    console.error('Error saving to Saved:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getSaved = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const savedVideos = await Saved.find({ userId }).sort({ savedAt: -1 });

    if (!savedVideos?.length) {
      return res.status(200).json({ message: 'No saved videos found.', saved: [] });
    }

    return res.status(200).json({ saved: savedVideos });

  } catch (error) {
    console.error('Error fetching saved videos:', error);
    return res.status(500).json({ message: 'Server error. Could not fetch saved videos.' });
  }
};

export const getWatched = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const watchedVideos = await Saved.find({ 
      userId, 
      watched: true 
    }).sort({ savedAt: -1 });

    if (!watchedVideos?.length) {
      return res.status(200).json({ message: 'No watched videos found.', watched: [] });
    }

    return res.status(200).json({ watched: watchedVideos });

  } catch (error) {
    console.error('Error fetching watched videos:', error);
    return res.status(500).json({ message: 'Server error. Could not fetch watched videos.' });
  }
};

export const deleteSaved = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    if (!userId || !videoId) {
      return res.status(400).json({ message: 'User ID and video ID are required.' });
    }

    const result = await Saved.deleteOne({
      userId,
      'data.id.videoId': videoId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Video not found in saved.' });
    }

    return res.status(200).json({ message: 'Video removed from saved.' });

  } catch (error) {
    console.error('Error deleting saved video:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const toggleWatched = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    if (!userId || !videoId) {
      return res.status(400).json({ message: 'User ID and video ID are required.' });
    }

    const savedEntry = await Saved.findOne({
      userId,
      'data.id.videoId': videoId
    });

    if (!savedEntry) {
      return res.status(404).json({ message: 'Video not found in saved.' });
    }

    savedEntry.watched = !savedEntry.watched;
    await savedEntry.save();

    return res.status(200).json({
      message: 'Watched status updated.',
      watched: savedEntry.watched,
      videoId: savedEntry.data.id.videoId
    });

  } catch (error) {
    console.error('Error toggling watched status:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
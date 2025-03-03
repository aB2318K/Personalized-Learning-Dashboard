import Feedback from '../models/Feedback.js';
import Saved from '../models/Saved.js';
import vader from 'vader-sentiment';

export const createFeedback = async (req, res) => {
  try {
    const { userId, savedVideoId, feedbackText } = req.body;
    
    if (!(await Saved.exists({ _id: savedVideoId }))) {
      return res.status(404).json({ message: 'Saved video not found.' });
    }

    const feedback = new Feedback({ userId, savedVideoId, feedbackText });
    await feedback.save();
    
    res.status(201).json({ message: 'Feedback saved.', feedback });
  } catch (error) {
    console.error('Feedback creation error:', error);
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const { userId, savedVideoId } = req.query;
    const feedback = await Feedback.findOne({ userId, savedVideoId });
    
    feedback 
      ? res.json({ feedback })
      : res.status(404).json({ message: 'No feedback found.' });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    res.status(500).json({ message: 'Failed to retrieve feedback.' });
  }
};

export const updateFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { feedbackText } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { feedbackText },
      { new: true }
    );
    
    feedback
      ? res.json({ message: 'Feedback updated.', feedback })
      : res.status(404).json({ message: 'Feedback not found.' });
  } catch (error) {
    console.error('Feedback update error:', error);
    res.status(500).json({ message: 'Failed to update feedback.' });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findByIdAndDelete(feedbackId);
    
    feedback
      ? res.json({ message: 'Feedback deleted.' })
      : res.status(404).json({ message: 'Feedback not found.' });
  } catch (error) {
    console.error('Feedback deletion error:', error);
    res.status(500).json({ message: 'Failed to delete feedback.' });
  }
};

export const analyzeSentiment = async (req, res) => {
  try {
    const { feedback } = req.query;
    if (!feedback) return res.status(400).json({ error: 'Feedback text required.' });
    
    const { compound } = vader.SentimentIntensityAnalyzer.polarity_scores(feedback);
    const score = Math.round(((compound + 1) / 2) * 100);
    
    res.json({ score });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment.' });
  }
};
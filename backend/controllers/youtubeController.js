import { HfInference } from '@huggingface/inference';
import Saved from '../models/Saved.js';
import Goal from '../models/Goal.js';

const client = new HfInference(process.env.HF_API_TOKEN);

// YouTube Search
export const searchYouTube = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Search query required." });

    const apiUrl = `${process.env.YOUTUBE_BASE_URL}?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=10&key=${process.env.YOUTUBE_API_KEY}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('YouTube search error:', error.message);
    res.status(500).json({ error: "Failed to fetch YouTube data." });
  }
};

// Recommendation Helpers
const getGoalData = async (userId) => {
  const completed = await Goal.find({ user: userId, completed: true }).select('name');
  const incompleted = await Goal.find({ user: userId, completed: false }).select('name');
  return {
    completed: completed.map(g => g.name),
    incompleted: incompleted.map(g => g.name),
    noGoals: completed.length + incompleted.length === 0
  };
};

const generateSearchTerms = async (completed, incompleted) => {
  try {
    const prompt = `User goals - Completed: ${completed.join(', ')}. Incomplete: ${incompleted.join(', ')}. Generate 3 YouTube search terms:`;
    
    const response = await client.chatCompletion({
      model: "microsoft/Phi-3-mini-4k-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });

    return response.choices[0].message.content
      .split('\n')
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch (error) {
    console.error('AI search term error:', error);
    return ['learning strategies', 'skill development', 'personal growth'];
  }
};

// Recommendations
export const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.query;
    const { completed, incompleted, noGoals } = await getGoalData(userId);
    if (noGoals) return res.json({ recommendations: [] });

    const searchTerms = await generateSearchTerms(completed, incompleted);
    const watchedVideos = await Saved.find({ userId, watched: true });
    const watchedIds = new Set(watchedVideos.map(v => v.data.id.videoId));

    const recommendations = [];
    const uniqueIds = new Set();

    for (const term of searchTerms) {
      const apiUrl = `${process.env.YOUTUBE_BASE_URL}?part=snippet&q=${encodeURIComponent(term)}&type=video&videoDuration=long&maxResults=4&key=${process.env.YOUTUBE_API_KEY}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      data.items?.forEach(item => {
        const videoId = item.id.videoId;
        if (!watchedIds.has(videoId) && !uniqueIds.has(videoId)) {
          recommendations.push(item);
          uniqueIds.add(videoId);
        }
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
};
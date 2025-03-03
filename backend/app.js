import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HfInference } from '@huggingface/inference';
import { authenticateToken } from './middleware/authMiddleware.js';
import Goal from './models/Goal.js';
import User from './models/User.js';

// Configurations
import connectDB from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

// Initialize app
const app = express();

// Middleware
dotenv.config();
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Route mounting
app.use(authRoutes);
app.use(userRoutes);
app.use(passwordRoutes);
app.use(taskRoutes);
app.use(goalRoutes);
app.use(mediaRoutes);
app.use(forumRoutes);
app.use(feedbackRoutes);

//Getting results from youtube search
app.get('/search', async (req, res) => {
    const { q } = req.query; // Extract the 'q' query parameter

    // Validate the query parameter
    if (!q) {
        return res.status(400).json({ error: "Please provide a search query in the 'q' parameter." });
    }

    try {
        // Build the YouTube API URL
        const apiUrl = `${process.env.BASE_URL}?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=10&key=${process.env.API_KEY}`;

        // Fetch data using node-fetch
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching YouTube data:', error.message);
        res.status(500).json({ error: "Failed to fetch data from YouTube API. Please try again later." });
    }
});

//Get Recommendations
const client = new HfInference(process.env.HF_API_TOKEN);

const getGoalsForRecommendations = async (userId) => {
    try {
        if (!userId) {
            return { message: 'User ID is required.' };
        }

        const user = await User.findById(userId);
        if (!user) {
            return { message: 'User not found.' };
        }

        // Fetch completed goals (only the name)
        const completedGoals = await Goal.find({ user: userId, completed: true }).select('name');
        // Fetch incompleted goals (only the name)
        const incompletedGoals = await Goal.find({ user: userId, completed: false }).select('name');

        // Check if there are no goals
        if (completedGoals.length === 0 && incompletedGoals.length === 0) {
            return { completed: [], incompleted: [], noGoals: true };
        }

        return {
            completed: completedGoals.map(goal => goal.name),
            incompleted: incompletedGoals.map(goal => goal.name),
            noGoals: false,
        };
    } catch (error) {
        console.error(error);
        return { message: 'Server error. Could not fetch goals for recommendations.' };
    }
};

const createRecommendationSearchTerm = async (incompleteGoals, completeGoals) => {
    try {
        // Prepare the input prompt by combining incomplete and complete goals
        const prompt = `
            A user has completed some of their goals but some are pending. These are their completed goals: 
            ${completeGoals.join(', ')}
            These are their incompleted goals: ${incompleteGoals.join(', ')}

            Based on the information above, generate 3 different search terms to search on YouTube that will help recommend the user what to watch next. Only return the search terms in the response (no extra text).
        `;

        // Call Hugging Face API to generate text
        const response = await client.chatCompletion({
            model: "microsoft/Phi-3-mini-4k-instruct",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 100
        });

        // Extract the generated search terms
        const generatedContent = response.choices[0].message.content;
        const searchTerms = generatedContent.split('\n')
                                            .map(line => line.replace(/^\d+\.\s*\*\*|^\d+\.\s*/, '').replace(/\*\*/g, '').trim())
                                            .filter(line => line.length > 0)
                                            .slice(0, 3);;

        return searchTerms;
    } catch (error) {
        console.error('Error generating search terms:', error.message);
        return ['Sorry, there was an issue generating search terms.'];
    }
};

app.get('/recommendations', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.query;
        const { completed, incompleted, noGoals } = await getGoalsForRecommendations(userId);
        // If there are no goals, return early
        if (noGoals) {
            return res.json({ recommendations: [] });
        }

        const searchTerms = await createRecommendationSearchTerm(completed, incompleted);

        // Fetch watched videos for the user
        const watchedVideos = await Saved.find({ userId, watched: true }).select('data.id.videoId');
        const watchedVideoIds = new Set(watchedVideos.map(video => video.data.id.videoId));

        const result = [];
        const addedVideoIds = new Set(); // Track already added video IDs

        for (let q of searchTerms) {
            const apiUrl = `${process.env.BASE_URL}?part=snippet&q=${encodeURIComponent(q)}&type=video&videoDuration=long&maxResults=4&key=${process.env.API_KEY}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            for (let item of data.items) {
                const videoId = item.id.videoId;

                // Skip if the video is watched or already in the result set
                if (!watchedVideoIds.has(videoId) && !addedVideoIds.has(videoId)) {
                    result.push(item);
                    addedVideoIds.add(videoId); 
                }
            }
        }

        res.json({ recommendations: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
});
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
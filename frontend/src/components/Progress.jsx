import React, { useState, useEffect } from "react";
import GoalCompletionPieChart from "./charts/GoalCompletionPieChart";
import GoalsDurationChart from "./charts/GoalsDurationChart";
import TaskLineChart from "./charts/TaskLineChart";
import VideoDonutChart from "./charts/VideoDonutChart";
import Motivation from "./Motivation";

const Progress = ({ userId, token }) => {
  const [incompleteGoals, setIncompleteGoals] = useState([]);
  const [completeGoals, setCompleteGoals] = useState([]);
  const [completeTasks, setCompleteTasks] = useState([]);
  const [categoryData, setCategoryData] = useState({});

  const fetchIncompleteGoals = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/goals?userId=${userId}&completed=false`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIncompleteGoals(data.goals);
      } else {
        console.error("Failed to fetch incomplete goals");
      }
    } catch (error) {
      console.error("Error fetching incomplete goals:", error);
    }
  };

  const fetchCompleteGoals = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/goals?userId=${userId}&completed=true`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCompleteGoals(data.goals);
      } else {
        console.error("Failed to fetch complete goals");
      }
    } catch (error) {
      console.error("Error fetching complete goals:", error);
    }
  };

  const fetchCompleteTasks = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/tasks?userId=${userId}&completed=true`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCompleteTasks(data.tasks);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSavedVideos = async () => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/saved?userId=${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        calculateCategoryData(data.saved); 
      } else {
        console.error('Failed to fetch saved videos');
      }
    } catch (error) {
      console.error('Error fetching saved videos:', error);
    }
  };

  const calculateCategoryData = (savedVideos) => {
    const watchedVideos = savedVideos.filter((video) => video.watched);
    const categoryCount = watchedVideos.reduce((acc, video) => {
      const category = video.category || 'Uncategorized'; 
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    setCategoryData(categoryCount);
  };

  useEffect(() => {
    if (userId && token) {
      fetchIncompleteGoals();
      fetchCompleteGoals();
      fetchCompleteTasks();
      fetchSavedVideos();
    }
  }, [userId, token]);

  const goalData = {
    completed: completeGoals.length,
    pending: incompleteGoals.length,
  };

  return (
    <div>
      <div className="hidden md:block p-0">
        <Motivation type="Motivation" />
      </div>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-x-4">
          {/* First chart */}
          <div className="goal-completion-chart p-4 w-full sm:w-1/2">
            <h2 className="text-sm font-bold text-gray-700 text-center mb-4">
              Goal Completion Progress
            </h2>
            <GoalCompletionPieChart data={goalData} />
          </div>
          {/* Second chart */}
          <div className="goals-duration-chart p-4 w-full sm:w-1/2">
            <h2 className="text-sm font-bold text-gray-700 text-center mb-4">
              Weekly Goal Completion
            </h2>
            <GoalsDurationChart goals={completeGoals} />
          </div>
        </div>
        <div className="task-completion-chart flex flex-col sm:flex-row space-y-4 sm:space-x-4">
          {/* Third chart */}
          <div className="p-4 w-full sm:w-1/2">
            <h2 className="text-sm font-bold text-gray-700 text-center mb-4">
              Task Completion Progress
            </h2>
            <TaskLineChart tasks={completeTasks} />
          </div>
          {/* Fourth chart */}
          <div className="videos-watched-chart p-4 w-full sm:w-1/2">
            <h2 className="text-sm font-bold text-gray-700 text-center mb-4">
              Videos Watched By Category
            </h2>
            <VideoDonutChart data={categoryData} />
          </div>
        </div>
      </div>
    </div>
  );  
};

export default Progress;

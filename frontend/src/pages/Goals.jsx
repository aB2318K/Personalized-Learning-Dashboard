import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaTrash, FaEdit, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { validKeywords } from '../assets/validKeywords';

function Goals({ userId, token }) {
  const { isMediumScreen } = useOutletContext();
  const [goalName, setGoalName] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goals, setGoals] = useState([]);
  const [editingGoalId, setEditingGoalId] = useState(null); 
  const [editingGoalData, setEditingGoalData] = useState({ name: '', targetDate: '' });
  const [completedGoals, setCompletedGoals] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (userId && token) {
      fetchGoals();
      fetchCompletedGoals();
    }
  }, [userId, token]);

  // Function to validate user input
  function escapeRegExp(str) {
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&');  // Escape special regex characters
  }  
  function isValidGoal(goal) {
    goal = goal.toLowerCase().trim();  // Normalize the goal text to lowercase
  
    // Loop through the valid keywords
    const matchedKeyword = validKeywords.find(keyword => {
      const escapedKeyword = escapeRegExp(keyword.toLowerCase());  // Escape special characters
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');  // Create regex with word boundaries
      return regex.test(goal);  // Check if the keyword is present as a whole word or phrase
    });
  
    // If a match is found, return the keyword, otherwise return false
    if (matchedKeyword) {
      return matchedKeyword;
    } else {
      return false;  // No match found
    }
  }
  

  // Fetch goals from backend
  const fetchGoals = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/goals?userId=${userId}&completed=false`, // Add `completed=false` to the query
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data.goals);
        setGoals(data.goals);
      } else {
        console.error('Failed to fetch goals');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };
  
  // Fetch completed Goals
  const fetchCompletedGoals = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/goals?userId=${userId}&completed=true`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Sort completed goals by the `completedAt` date in descending order
        const completedGoals = data.goals
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)); // Sort by completedAt in descending order
        setCompletedGoals(completedGoals);
      } else {
        console.error('Failed to fetch completed goals');
      }
    } catch (error) {
      console.error('Error fetching completed goals:', error);
    }
  };

  // Add Goal
  const handleAddGoal = async () => {
    if (goalName && goalTargetDate) {
      if(!isValidGoal(goalName)) {
        setErrorMessage('Your goal should be related to web development!');
        setTimeout(() => setErrorMessage(''), 2000);
      } else {
        const dueDate = new Date(goalTargetDate);
        const learningCategory = isValidGoal(goalName);
        
        // Ensure due date is not in the past
        if (dueDate < new Date()) {
          console.error('Due date cannot be in the past.');
          return;
        }

        const newGoal = {
          userId,
          name: goalName,
          dueDate: goalTargetDate,
          category: learningCategory
        };

        try {
          const response = await fetch('https://personalized-learning-dashboard.onrender.com/goals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(newGoal),
          });

          if (response.ok) {
            const addedGoal = await response.json();
            setGoals((prevGoals) => [...prevGoals, addedGoal.goal]);
            // Reset the input fields
            setGoalName('');
            setGoalTargetDate('');
          } else {
            console.error('Failed to add goal');
          }
        } catch (error) {
          console.error('Error adding goal:', error);
        }
      }
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (id, isCompleted) => {
    const requestData = {
      userId: userId
    }
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        console.log(response)
        if (isCompleted) {
          // Add delay before removing from completed list
          setTimeout(() => {
            setCompletedGoals((prevCompleted) =>
              prevCompleted.filter((goal) => goal._id !== id)
            );
          }, 1000);
        } else {
          setGoals((prevTGoals) => prevTGoals.filter((goal) => goal._id !== id));
        }
      } else {
        console.error('Failed to delete goal');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // Begin editing Goal
  const handleEditGoal = (goal) => {
    setEditingGoalId(goal._id);  
    const formattedDate = goal.dueDate.split('T')[0];
    setEditingGoalData({ name: goal.name, targetDate: formattedDate });
  };

  // Save goal after editing
  const handleSaveGoal = async () => {
    if(!isValidGoal(editingGoalData.name)) {
      setErrorMessage('Your goal should be related to web development');
      setTimeout(() => setErrorMessage(''), 2000);
    } else {
      const learningCategory = isValidGoal(editingGoalData.name);
      const updatedGoal = {
        userId,
        name: editingGoalData.name,
        dueDate: editingGoalData.targetDate,
        category: learningCategory
      };
  
      try {
        const response = await fetch(`https://personalized-learning-dashboard.onrender.com/goals/${editingGoalId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedGoal),
        });
  
        if (response.ok) {
          const updatedGoalData = await response.json();
          setGoals((prevGoals) =>
            prevGoals.map((goal) =>
              goal._id === editingGoalId ? updatedGoalData.goal : goal
            )
          );
          setEditingGoalId(null);
          setEditingGoalData({ name: '', dueDate: '' });
        } else {
          console.error('Failed to update goal');
        }
      } catch (error) {
        console.error('Error updating goal:', error);
      }
    }
  };

  // Handle goal completion
  const handleGoalComplete = async (id) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/goals/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== id));
        setCompletedGoals((prevCompleted) => [
          ...prevCompleted,
          { ...data.goal },
        ]);
      } else {
        console.error('Failed to complete the goal');
      }
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  // Handle goal incompletion (mark as incomplete)
  const handleGoalIncomplete = async (id) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/goals/${id}/incomplete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Move goal back to upcoming goals and reset completedAt
        setCompletedGoals((prevCompleted) =>
          prevCompleted.filter((goal) => goal._id !== id)
        );
        const updatedGoal = { ...data.goal, completedAt: null };
        setGoals((prevGoals) => {
          const updatedGoals = [...prevGoals, updatedGoal];
          // Re-sort the goals by due date
          return updatedGoals.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        });
      } else {
        console.error('Failed to mark the goal as incomplete');
      }
    } catch (error) {
      console.error('Error marking goal as incomplete:', error);
    }
  };

  const handleInputChange = (e, field) => {
    setEditingGoalData((prevData) => ({ ...prevData, [field]: e.target.value }));
  };

  // Helper Functions for Timeframes
  const getCurrentDate = () => new Date();
  const getOneMonthFromNow = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  };
  const getSixMonthsFromNow = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  };

  // Categorize Goals
  const categorizeGoals = () => {
    const currentDate = getCurrentDate();
    const oneMonthFromNow = getOneMonthFromNow();
    const sixMonthsFromNow = getSixMonthsFromNow();

    const shortTerm = [];
    const mediumTerm = [];
    const longTerm = [];

    goals.forEach((goal) => {
      const targetDate = new Date(goal.dueDate);

      if (targetDate <= oneMonthFromNow) {
        shortTerm.push(goal);
      } else if (targetDate <= sixMonthsFromNow) {
        mediumTerm.push(goal);
      } else {
        longTerm.push(goal);
      }
    });

    return { shortTerm, mediumTerm, longTerm };
  };

  const { shortTerm, mediumTerm, longTerm } = categorizeGoals();

  return (
    <div className="flex-1 p-4 bg-gray-100 w-screen md:w-full overflow-x-hidden">
      {/* Goal Input Section */}
      <div className="flex space-x-4 mb:2 md:mb-6 h-7 md:h-auto">
        <input
          type="text"
          placeholder="Goal"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          className="p-2 w-1/3 md:w-1/4 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded-lg bg-white"
        />
        <input
          type="date"
          data-testid="date-input"
          value={goalTargetDate}
          onChange={(e) => setGoalTargetDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]} 
          className="p-2 w-1/3 md:w-1/4 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded-lg bg-white"
        />
        <button
          onClick={handleAddGoal}
          disabled={!goalName || !goalTargetDate}
          className={`text-xs sm:auto md:text-sm p-1 px-2 md:p-2 md:px-4 rounded-lg bg-gray-600 text-white ${!goalName || !goalTargetDate ? 'cursor-default' : 'hover:bg-gray-700'}`}
        >
          Add Goal
        </button>
        {errorMessage && <p className='text-gray-600 font-semibold hidden md:block mt-2 text-center'>{errorMessage}</p>}
      </div>
        {errorMessage && <p className='text-gray-600 font-semibold text-center block md:hidden mt-3 text-xs'>{errorMessage}</p>}
      {/* Goals Boards Section */}
      <div className="flex justify-center sm:space-x-4 mt-3 items-start">
        {!isMediumScreen && <GoalColumn
          title="Short-Term"
          goals={shortTerm}
          handleDeleteGoal={handleDeleteGoal}
          handleGoalComplete={handleGoalComplete}
          handleEditGoal={handleEditGoal}
          editingGoalId={editingGoalId}
          editingGoalData={editingGoalData}
          handleInputChange={handleInputChange}
          handleSaveGoal={handleSaveGoal}
        />}
        {!isMediumScreen && <GoalColumn
          title="Medium-Term"
          goals={mediumTerm}
          handleDeleteGoal={handleDeleteGoal}
          handleGoalComplete={handleGoalComplete}
          handleEditGoal={handleEditGoal}
          editingGoalId={editingGoalId}
          editingGoalData={editingGoalData}
          handleInputChange={handleInputChange}
          handleSaveGoal={handleSaveGoal}
        />}
        {!isMediumScreen && <GoalColumn
          title="Long-Term"
          goals={longTerm}
          handleDeleteGoal={handleDeleteGoal}
          handleGoalComplete={handleGoalComplete}
          handleEditGoal={handleEditGoal}
          editingGoalId={editingGoalId}
          editingGoalData={editingGoalData}
          handleInputChange={handleInputChange}
          handleSaveGoal={handleSaveGoal}
        />}
        {isMediumScreen && <GoalColumn
          title=""
          goals={goals}
          handleDeleteGoal={handleDeleteGoal}
          handleGoalComplete={handleGoalComplete}
          handleEditGoal={handleEditGoal}
          editingGoalId={editingGoalId}
          editingGoalData={editingGoalData}
          handleInputChange={handleInputChange}
          handleSaveGoal={handleSaveGoal}
        />}
        <div className="completed-goals min-w-[23vw] bg-gray-50 p-4 rounded-lg">
          <h2 className="text-sm sm:text-lg md:text-xl text-center font-bold text-gray-700 mb-4">Completed Goals</h2>
          {completedGoals.length === 0 ? (
            <p className="text-gray-500 text-center">No completed goals.</p>
          ) : (
            completedGoals.map((goal) => (
              <div
                key={goal._id}
                className="w-48 sm:w-64 md:w-80 p-2 sm:p-3 md:p-4 mb-4 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-100"
              >
                <div className="flex-1">
                  <h4 className="text-sm md:text-lg font-semibold text-gray-800">{goal.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Completed: {goal.formattedCompletedAt}
                  </p>
                </div>
                <button
                  data-testid="incomplete"
                  onClick={() => handleGoalIncomplete(goal._id)}
                  className="text-gray-600 hover:text-gray-800 mr-1"
                >
                  <FaTimesCircle />
                </button>
                <button
                  onClick={() => handleDeleteGoal(goal._id, true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

// GoalColumn Component
const GoalColumn = ({
  title,
  goals,
  handleDeleteGoal,
  handleGoalComplete,
  handleEditGoal,
  editingGoalId,
  editingGoalData,
  handleInputChange,
  handleSaveGoal,
}) => (
  <div className="w-1/2 md:w-1/3 overflow-y-auto h-[500px]">
    {title && <h2 className="text-lg font-bold mb-2 text-gray-700">{title}</h2>}
    <div className="space-y-2 md:space-y-4">
      {goals.length === 0 ? (
        <p className="text-gray-500">No goals available.</p>
      ) : (
        goals.map((goal) => (
          <div key={goal._id} className="flex rounded-lg border border-300 md:border-none items-center mb-2 p-2 md:p-0 mr-2 md:mr-0">
            {editingGoalId === goal._id ? (
              <div className="w-2/3 max-w-full">
                <input
                  type="text"
                  data-testid="edit-goal-input"
                  value={editingGoalData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  className="p-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded w-full mb-1 ml-1"
                />
                <input
                  type="date"
                  data-testid="edit-date-input"
                  value={editingGoalData.targetDate}
                  onChange={(e) => handleInputChange(e, 'targetDate')}
                  className="p-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded w-full ml-1"
                />
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={handleSaveGoal}
                    className="text-xs sm:text-sm text-gray-600 hover:underline ml-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal._id, false)}
                    className="text-xs sm:text-sm text-gray-600 hover:underline ml-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-2/3 max-w-full mr-1 md:mr-0">
                <h4 className="text-sm md:text-lg font-semibold text-gray-800 break-words">{goal.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600">Target: {goal.formattedDueDate}</p>
              </div>
            )}
            {editingGoalId !== goal._id && (
              <>
                <FaEdit
                  data-testid="edit"
                  onClick={() => handleEditGoal(goal)}
                  className="cursor-pointer text-gray-600 hover:text-gray-800 mr-1"
                />
                <FaCheckCircle 
                  data-testid="complete"
                  onClick={() => handleGoalComplete(goal._id)}
                  className="cursor-pointer text-gray-600 hover:text-gray-800 mr-2"
                />
                <FaTrash
                  data-testid="delete"
                  onClick={() => handleDeleteGoal(goal._id, false)}
                  className="cursor-pointer text-gray-600 hover:text-gray-800"
                />
              </>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

export default Goals;

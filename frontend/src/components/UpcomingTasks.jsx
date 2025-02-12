import React, { useState, useEffect } from 'react';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import Motivation from './Motivation';

function UpcomingTasks({ userId, token }) {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (userId && token) {
      fetchUpcomingTasks();
      fetchCompletedTasks();
    }
  }, [userId, token]);

  // Fetch upcoming tasks (incomplete tasks)
  const fetchUpcomingTasks = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/tasks?userId=${userId}&completed=false`, // Added `completed=false` to the query
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        // Filter tasks with due dates in the future and sort by due date
        const upcomingTasks = data.tasks
          //.filter((task) => new Date(task.dueDate) > new Date())
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setTasks(upcomingTasks);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Fetch completed tasks
  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/tasks?userId=${userId}&completed=true`, // Added `completed=true` to the query
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Sort completed tasks by the `completedAt` date in descending order
        const completedTasks = data.tasks
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)); // Sort by completedAt in descending order
        setCompletedTasks(completedTasks);
      } else {
        console.error('Failed to fetch completed tasks');
      }
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id, isCompleted) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        if (isCompleted) {
          // Add delay before removing from completed list
          setCompletedTasks((prevCompleted) =>
            prevCompleted.filter((task) => task._id !== id)
          );          
        } else {
          setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
        }
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle task completion
  const handleTaskComplete = async (id) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Move task to completed tasks
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
        setCompletedTasks((prevCompleted) => [
          ...prevCompleted,
          { ...data.task },
        ]);
      } else {
        console.error('Failed to complete the task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  // Handle task incompletion (mark as incomplete)
  const handleTaskIncomplete = async (id) => {
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/tasks/${id}/incomplete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        // Move task back to upcoming tasks and reset completedAt
        setCompletedTasks((prevCompleted) =>
          prevCompleted.filter((task) => task._id !== id)
        );
        const updatedTask = { ...data.task, completedAt: null };
        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks, updatedTask];
          // Re-sort the tasks by due date
          return updatedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        });
      } else {
        console.error('Failed to mark the task as incomplete');
      }
    } catch (error) {
      console.error('Error marking task as incomplete:', error);
    }
  };

  return (
    <>
      <div className="hidden md:block p-0">
        <Motivation type="Motivation" />
      </div>
      <div className="flex justify-center max-w-screen-lg space-x-4 sm:space-x-10 md:space-x-36 p-2 sm:p-4 md:p-6">
        {/* Upcoming Tasks Section */}
        <div className="upcoming-tasks">
          {tasks.length === 0 ? (
            <p className="text-gray-600">No upcoming tasks.</p>
          ) : (
            tasks.map((task) => {
              const isExpired = new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
              return (
                <div
                  key={task._id}
                  className={`w-48 sm:w-64 md:w-80 p-2 sm:p-3 md:p-4 mb-4 rounded-lg border border-gray-300 flex justify-between items-center ${
                    isExpired ? 'border-gray-900 border-2 bg-gray-200' : 'hover:bg-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="text-sm md:text-lg font-semibold text-gray-800">
                      {task.name}{' '}
                      {isExpired && (
                        <FaExclamationCircle className="inline text-gray-900 ml-1" />
                      )}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Due: {task.formattedDueDate}
                    </p>
                  </div>
                  <button
                    aria-label='complete'
                    onClick={() => handleTaskComplete(task._id)}
                    className="text-gray-600 hover:text-gray-800 mr-1"
                  >
                    <FaCheckCircle />
                  </button>
                  <button
                    aria-label='delete'
                    onClick={() => handleDeleteTask(task._id, false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Completed Tasks Section */}
        <div className="completed-tasks min-w-[23vw] bg-gray-50 p-4 rounded-lg">
          <h2 className="text-sm sm:text-lg md:text-xl text-center font-bold text-gray-700 mb-4">Completed Tasks</h2>
          {completedTasks.length === 0 ? (
            <p className="text-gray-600 text-center">No completed tasks.</p>
          ) : (
            completedTasks.map((task) => (
              <div
                key={task._id}
                className="w-48 sm:w-64 md:w-80 p-2 sm:p-3 md:p-4 mb-4 bg-white border border-gray-300 rounded-lg flex justify-between items-center hover:bg-gray-100"
              >
                <div className="flex-1">
                  <h4 className="text-sm md:text-lg font-semibold text-gray-800">{task.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Completed: {task.formattedCompletedAt}
                  </p>
                </div>
                <button
                  aria-label='incomplete'
                  onClick={() => handleTaskIncomplete(task._id)}
                  className="text-gray-600 hover:text-gray-800 mr-1"
                >
                  <FaTimesCircle />
                </button>
                <button
                  aria-label='comp-del'
                  onClick={() => handleDeleteTask(task._id, true)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default UpcomingTasks;

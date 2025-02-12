import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';

function Tasks({ userId, token}) {
  const [taskName, setTaskName] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskData, setEditingTaskData] = useState({ name: '', dueDate: '' }); 

  // Fetch tasks when component mounts
  useEffect(() => {
    if (userId && token) {
      fetchTasks();
    }
  }, [userId, token]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `https://personalized-learning-dashboard.onrender.com/tasks?userId=${userId}&completed=false`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data.tasks);
        setTasks(data.tasks);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add task
  const handleAddTask = async () => {
    if (taskName && taskDueDate) {
      const dueDate = new Date(taskDueDate);
  
      // Ensure due date is not in the past
      if (dueDate < new Date()) {
        console.error('Due date cannot be in the past.');
        return;
      }
  
      const newTask = {
        userId,
        name: taskName,
        dueDate: taskDueDate,
      };
  
      try {
        const response = await fetch('https://personalized-learning-dashboard.onrender.com/tasks', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newTask),
        });
  
        if (response.ok) {
          const addedTask = await response.json();
  
          // Directly add the task with formattedDueDate from the backend response
          setTasks((prevTasks) => [...prevTasks, addedTask.task]);
  
          // Reset the input fields
          setTaskName('');
          setTaskDueDate('');
        } else {
          console.error('Failed to add task');
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };  

  // Delete task
  const handleDeleteTask = async (id) => {
    const requestData = {
      userId: userId
    }
    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Begin editing task
  const handleEditTask = (task) => {
    setEditingTaskId(task._id);  
    const formattedDate = task.dueDate.split('T')[0];
    setEditingTaskData({ name: task.name, dueDate: formattedDate });
  };

  // Save task after editing
  const handleSaveTask = async () => {
    const updatedTask = {
      userId,
      name: editingTaskData.name,
      dueDate: editingTaskData.dueDate,
    };

    try {
      const response = await fetch(`https://personalized-learning-dashboard.onrender.com/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${token}`,
         },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const updatedTaskData = await response.json();
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === editingTaskId ? updatedTaskData.task : task
          )
        );
        setEditingTaskId(null);
        setEditingTaskData({ name: '', dueDate: '' });
      } else {
        console.error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
};


  const handleInputChange = (e, field) => {
    setEditingTaskData((prevData) => ({ ...prevData, [field]: e.target.value }));
  };

  // Utility functions to categorize tasks
  const getCurrentDate = () => new Date();
  const getStartOfWeek = () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return startOfWeek;
  };
  const getEndOfWeek = () => {
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
    return endOfWeek;
  };
  const getStartOfMonth = () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    return startOfMonth;
  };
  const getEndOfMonth = () => {
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    return endOfMonth;
  };

  const categorizeTasks = () => {
    const currentDate = getCurrentDate();
    const startOfWeek = getStartOfWeek();
    const endOfWeek = getEndOfWeek();
    const startOfMonth = getStartOfMonth();
    const endOfMonth = getEndOfMonth();

    const doThisWeek = [];
    const doThisMonth = [];
    const doLater = [];

    tasks.forEach((task) => {
      const dueDate = new Date(task.dueDate);

      if (dueDate >= startOfWeek && dueDate <= endOfWeek) {
        doThisWeek.push(task);
      } else if (dueDate >= startOfMonth && dueDate <= endOfMonth) {
        doThisMonth.push(task);
      } else {
        doLater.push(task);
      }
    });

    return { doThisWeek, doThisMonth, doLater };
  };

  const { doThisWeek, doThisMonth, doLater } = categorizeTasks();

  return (
    <div className="flex-1 p-4 bg-gray-100 w-screen md:w-full overflow-x-hidden">
      {/* Task Input Section */}
      <div className="flex space-x-4 mb-6 h-7 md:h-auto">
        <input
          type="text"
          placeholder="Task"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="p-2 w-1/3 md:w-1/4 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded-lg bg-white"
        />
        <input
          type="date"
          data-testid="due-date-input"
          value={taskDueDate}
          onChange={(e) => setTaskDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="p-2 w-1/3 md:w-1/4 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded-lg bg-white"
        />
        <button
          onClick={handleAddTask}
          disabled={!taskName || !taskDueDate}
          className={`text-xs sm:auto md:text-sm p-1 px-2 md:p-2 md:px-4 rounded-lg bg-gray-600 text-white ${
            !taskName || !taskDueDate ? 'cursor-default' : 'hover:bg-gray-700'
          }`}
        >
          Add Task
        </button>
      </div>

      {/* Task Boards Section */}
      <div className="flex space-x-4">
        <TaskColumn
          title="Do This Week"
          tasks={doThisWeek}
          handleDeleteTask={handleDeleteTask}
          handleEditTask={handleEditTask}
          editingTaskId={editingTaskId}
          editingTaskData={editingTaskData}
          handleInputChange={handleInputChange}
          handleSaveTask={handleSaveTask}
        />
        <TaskColumn
          title="Do This Month"
          tasks={doThisMonth}
          handleDeleteTask={handleDeleteTask}
          handleEditTask={handleEditTask}
          editingTaskId={editingTaskId}
          editingTaskData={editingTaskData}
          handleInputChange={handleInputChange}
          handleSaveTask={handleSaveTask}
        />
        <TaskColumn
          title="Do Later"
          tasks={doLater}
          handleDeleteTask={handleDeleteTask}
          handleEditTask={handleEditTask}
          editingTaskId={editingTaskId}
          editingTaskData={editingTaskData}
          handleInputChange={handleInputChange}
          handleSaveTask={handleSaveTask}
        />
      </div>
    </div>
  );
}

const TaskColumn = ({
  title,
  tasks,
  handleDeleteTask,
  handleEditTask,
  editingTaskId,
  editingTaskData,
  handleInputChange,
  handleSaveTask,
}) => (
  <div className="w-full sm:w-1/3 overflow-y-auto h-[500px]">
  <h2 className="md:text-lg text-base font-bold mb-2 text-gray-700">{title}</h2>
  <div className="space-y-4">
    {tasks.length === 0 ? (
      <p className="text-gray-500 text-xs sm:text-sm">No tasks available.</p>
    ) : (
      tasks.map((task) => (
        <div key={task._id} className="flex items-center mb-2">
          {editingTaskId === task._id ? (
            <div className="w-2/3 max-w-full">
              <input
                type="text"
                data-testid="edit-task-input"
                value={editingTaskData.name}
                onChange={(e) => handleInputChange(e, 'name')}
                className="p-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded w-full mb-1 ml-1"
              />
              <input
                type="date"
                data-testid="edit-date-input"
                value={editingTaskData.dueDate} 
                onChange={(e) => handleInputChange(e, 'dueDate')}
                className="p-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 rounded w-full ml-1"
              />
              <div className="flex space-x-2 mt-1">
                <button
                  onClick={handleSaveTask}
                  className="text-gray-600 hover:underline  text-xs sm:text-sm ml-1"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-gray-600 hover:underline  text-xs sm:text-sm ml-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="sm:w-2/3 w-full max-w-full">
              <h3 className="font-semibold text-gray-800 break-words  text-xs sm:text-sm">
                {task.name}
              </h3>
              <p className=" text-xs sm:text-sm text-gray-600">Due: {task.formattedDueDate}</p>
            </div>
          )}
          {editingTaskId !== task._id && (
            <FaEdit
              data-testid="edit"
              onClick={() => handleEditTask(task)}
              className="cursor-pointer text-gray-600 hover:text-gray-800 mr-2"
            />
          )}
          {editingTaskId !== task._id && (
            <FaTrash
              data-testid="delete"
              onClick={() => handleDeleteTask(task._id)}
              className="cursor-pointer text-gray-600 hover:text-gray-800 "
            />
          )}
        </div>
      ))
    )}
  </div>
</div>

);

export default Tasks;

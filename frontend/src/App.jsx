import React from 'react';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SearchResults from './pages/SearchResults';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import History from './pages/History';
import Saved from './pages/Saved';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import EditProfile from './pages/EditProfile';
import NewPassword from './pages/NewPassword';
import Forum from './pages/Forum';
import MyPosts from './components/forumComponents/MyPosts';
import PostPage from './components/forumComponents/PostPage';
import './App.css';
import ForumSearchResults from './components/forumComponents/ForumSearchResults';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  const userID = localStorage.getItem('userID');

  const isTokenValid = token && tokenExpiration && Date.now() < parseInt(tokenExpiration, 10);

  if (!isTokenValid) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  return React.cloneElement(element, { userId: userID, token: token });
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password/:id" element={<NewPassword />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}>
        <Route path="tasks" element={<ProtectedRoute element={<Tasks />} />} />
        <Route path="goals" element={<ProtectedRoute element={<Goals />} />} />
        <Route path="history" element={<ProtectedRoute element={<History />} />} />
        <Route path="saved" element={<ProtectedRoute element={<Saved />} />} />
        <Route path="profile" element={<ProtectedRoute element={<EditProfile />} />} />
        <Route path="search" element={<ProtectedRoute element={<SearchResults />} />} />
      </Route>

      <Route path="/forum" element={<ProtectedRoute element={<Forum />} />}>
        <Route path="my-posts" element={<ProtectedRoute element={<MyPosts />} />} />
        <Route path="post/:id" element={<ProtectedRoute element={<PostPage />} />} />
        <Route path="search" element={<ProtectedRoute element={<ForumSearchResults />} />} />
      </Route>
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

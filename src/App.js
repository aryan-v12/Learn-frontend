// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DiscussionForum from './pages/DiscussionForum';
import LiveClasses from './pages/LiveClasses';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import AdminQuizCreation from './components/AdminQuizCreation';
import AdminTopicManagement from './components/AdminTopicManagement';
import AdminLiveClasses from './components/AdminLiveClasses';
import AdminDiscussionForum from './components/AdminDiscussionForum';
import Footer from './components/Footer';
import './App.css';
import AdminLeaderboard from './components/AdminLeaderboard';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from '../src/components/ProtectedRoute'; // Import ProtectedRoute

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quizzes" element={<QuizPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/discussion-forum" element={<DiscussionForum />} />
          <Route path="/live-classes" element={<LiveClasses />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/quizzes" element={<AdminQuizCreation />} />
          <Route path="/admin/topics" element={<AdminTopicManagement />} />
          <Route path="/admin/live-classes" element={<AdminLiveClasses />} />
          <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
          <Route path="/admin/discussion-forum" element={<AdminDiscussionForum />} />
          <Route path="/chatbot" element={<ChatPage />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
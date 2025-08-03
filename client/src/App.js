import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar/index';
import Home from './components/Home/index';
import MyProfile from './components/MyProfile/index';
import EditProfile from './components/EditProfile/index';
import Jobs from './components/Jobs/index';
import JobPost from './components/JobPost/index';
import Register from './components/auth/Register/index';
import Login from './components/auth/Login/index';
import Chatbot from './components/Chatbot/index';
import ProtectedRoute from './components/ProtectedRoute';

class App extends Component {
  state = {
    isAuthenticated: !!localStorage.getItem('token'),
  };

  handleLogin = () => {
    this.setState({ isAuthenticated: true });
  };

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('matchScoresCache');
    this.setState({ isAuthenticated: false });
  };

  render() {
    const { isAuthenticated } = this.state;
    return (
      <Router>
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
          <Navbar isAuthenticated={isAuthenticated} onLogout={this.handleLogout} />
          <div className="pt-20">
            <Routes>
              <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
              <Route path="/register" element={<Register onLoginSuccess={this.handleLogin} />} />
              <Route path="/login" element={<Login onLoginSuccess={this.handleLogin} />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route
                path="/my-profile"
                element={
                  <ProtectedRoute>
                    <MyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-profile"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <ProtectedRoute>
                    <JobPost />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <Chatbot />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;

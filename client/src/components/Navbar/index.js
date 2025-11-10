import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import withRouter from '../withRouter';
import './index.css';

class Navbar extends Component {
  render() {
    const { isAuthenticated, onLogout, navigate } = this.props;

    const handleLogoutAndRedirect = () => {
      onLogout();
      navigate('/');
    };

    return (
      <nav className="navbar">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">
            ConnectUS
          </Link>
          <div className="flex space-x-6 items-center">
            <NavLink to="/jobs" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>Jobs</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/my-profile" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>My Profile</NavLink>
                <NavLink to="/view-applications" className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}>View Applications</NavLink>
                <Link to="/post-job" className="btn-primary-sm">Post a Job</Link>
                <button onClick={handleLogoutAndRedirect} className="btn-secondary-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-secondary-sm">Register</Link>
                <Link to="/login" className="btn-primary-sm">Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }
}

export default withRouter(Navbar);

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../withRouter';
import './index.css';

class Home extends Component {
  render() {
    const { isAuthenticated } = this.props;
    const getStartedLink = isAuthenticated ? '/chatbot' : '/register';
    const getStartedButtonText = isAuthenticated ? 'Ask Our Bot' : 'Get Started';

    return (
      <div className="home-container">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600 animate-pulse">
            ConnectUS
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            A next-generation Job & Networking Portal, blending Web3, AI, and HR Tech to reshape how you discover work and monetize your skills.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link to={getStartedLink} className="btn-primary">
              {getStartedButtonText}
            </Link>
            <Link to="/jobs" className="btn-secondary">
              Explore Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Home);

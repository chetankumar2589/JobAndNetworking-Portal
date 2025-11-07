import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../withRouter';
import './index.css';

class MyProfile extends Component {
  state = {
    user: null,
    loading: true,
  };

  componentDidMount() {
    this.fetchProfileData();
  }

  fetchProfileData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate('/login', { state: { from: '/my-profile' } });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile/me', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const user = await response.json();
      this.setState({ user, loading: false });
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.setState({ loading: false });
      localStorage.removeItem('token');
      this.props.navigate('/login', { state: { from: '/my-profile' } });
    }
  };

  render() {
    const { user, loading } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading profile...</div>;
    }

    if (!user) {
      return <div className="text-center mt-20 text-xl">No profile found. Please log in.</div>;
    }

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="text-4xl font-bold text-lime-400">My Profile</h1>
          <p className="profile-text text-gray-400 mt-2">Member since: {memberSince}</p>
        </div>
        
        <div className="profile-details-card">
          <div className="profile-detail">
            <h3 className="profile-detail-label">Email:</h3>
            <p className="profile-detail-value">{user.email}</p>
          </div>
          <div className="profile-detail">
            <h3 className="profile-detail-label">Bio:</h3>
            <p className="profile-detail-value">{user.bio || 'Not provided'}</p>
          </div>
          <div className="profile-detail">
            <h3 className="profile-detail-label">LinkedIn:</h3>
            <p className="profile-detail-value">
              {user.linkedIn ? (
                <a href={user.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {user.linkedIn}
                </a>
              ) : 'Not provided'}
            </p>
          </div>
          <div className="profile-detail">
            <h3 className="profile-detail-label">Skills:</h3>
            <p className="profile-detail-value">
              {user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'Not provided'}
            </p>
          </div>
          <div className="profile-detail">
            <h3 className="profile-detail-label">Wallet Address:</h3>
            <p className="profile-detail-value">{user.publicWalletAddress || 'Not provided'}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Link to="/edit-profile" className="btn-edit-profile">
            Edit Profile
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(MyProfile);

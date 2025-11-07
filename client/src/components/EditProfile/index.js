import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';
import Modal from '../Modal';

class EditProfile extends Component {
  state = {
    loading: true,
    bio: '',
    linkedIn: '',
    skills: '',
    publicWalletAddress: '',
    isModalOpen: false,
    modalMessage: '',
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchProfileData(token);
    } else {
      this.props.navigate('/login', { state: { from: '/edit-profile' } });
    }
  }

  fetchProfileData = async (token) => {
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
      this.setState({
        loading: false,
        bio: user.bio || '',
        linkedIn: user.linkedIn || '',
        skills: (user.skills || []).join(', '),
        publicWalletAddress: user.publicWalletAddress || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.setState({ loading: false });
      localStorage.removeItem('token');
      this.props.navigate('/login', { state: { from: '/edit-profile' } });
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { bio, linkedIn, skills, publicWalletAddress } = this.state;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          bio,
          linkedIn,
          skills,
          publicWalletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await response.json();
      this.setState({ 
        loading: false,
        isModalOpen: true,
        modalMessage: 'Profile updated successfully!',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      this.setState({ 
        loading: false,
        isModalOpen: true,
        modalMessage: 'Failed to update profile. Please try again.',
      });
    }
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
    this.props.navigate('/my-profile');
  };

  render() {
    const { loading, bio, linkedIn, skills, publicWalletAddress, isModalOpen, modalMessage } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading profile...</div>;
    }

    return (
      <div className="profile-container">
        <h1 className="text-4xl font-bold mb-4 text-lime-400">Edit Profile</h1>
        <form onSubmit={this.handleSubmit} className="profile-form">
          <textarea
            name="bio"
            placeholder="Bio"
            value={bio}
            onChange={this.handleChange}
            className="profile-input"
          />
          <input
            type="text"
            name="linkedIn"
            placeholder="LinkedIn URL"
            value={linkedIn}
            onChange={this.handleChange}
            className="profile-input"
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={skills}
            onChange={this.handleChange}
            className="profile-input"
          />
          <input
            type="text"
            name="publicWalletAddress"
            placeholder="Public Wallet Address"
            value={publicWalletAddress}
            onChange={this.handleChange}
            className="profile-input"
          />
          <button type="submit" className="btn-primary-form">
            Update Profile
          </button>
        </form>
        {isModalOpen && (
          <Modal onClose={this.closeModal} message={modalMessage} />
        )}
      </div>
    );
  }
}

export default withRouter(EditProfile);

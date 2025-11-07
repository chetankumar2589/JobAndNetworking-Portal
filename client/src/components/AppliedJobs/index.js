import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';

class AppliedJobs extends Component {
  state = {
    applications: [],
    loading: true,
    error: '',
  };

  componentDidMount() {
    this.fetchAppliedJobs();
  }

  fetchAppliedJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate('/login', { state: { from: '/applied-jobs' } });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/applications/mine', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applied jobs');
      }

      const applications = await response.json();
      this.setState({ applications, loading: false });
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      this.setState({ error: 'Failed to load applied jobs. Please try again.', loading: false });
    }
  };

  render() {
    const { applications, loading, error } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading applied jobs...</div>;
    }

    if (error) {
      return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;
    }

    if (applications.length === 0) {
      return (
        <div className="applied-jobs-container">
          <h1 className="text-4xl font-bold mb-8 text-lime-400">Applied Jobs</h1>
          <div className="text-center mt-10 text-xl text-gray-400">
            You haven't applied to any jobs yet. <a href="/jobs" className="text-lime-400 hover:underline">Browse jobs</a>
          </div>
        </div>
      );
    }

    return (
      <div className="applied-jobs-container">
        <h1 className="text-4xl font-bold mb-8 text-lime-400">Applied Jobs</h1>
        
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="applied-job-card">
              <div className="job-header">
                <h2 className="text-2xl font-semibold text-lime-400">
                  {app.job && app.job.title ? app.job.title : 'Job Title Not Available'}
                </h2>
                <span className={`status-badge status-${app.status || 'submitted'}`}>
                  {app.status || 'submitted'}
                </span>
              </div>
              
              <div className="job-details">
                {app.job && app.job.description && (
                  <p className="text-gray-300 mb-4">{app.job.description}</p>
                )}
                
                <div className="detail-grid">
                  {app.job && app.job.salary && (
                    <div className="detail-item">
                      <span className="detail-label">Salary:</span>
                      <span className="detail-value">{app.job.salary}</span>
                    </div>
                  )}
                  
                  {app.job && app.job.budget && (
                    <div className="detail-item">
                      <span className="detail-label">Budget:</span>
                      <span className="detail-value">{app.job.budget}</span>
                    </div>
                  )}
                  
                  {app.job && app.job.deadline && (
                    <div className="detail-item">
                      <span className="detail-label">Deadline:</span>
                      <span className={`detail-value ${new Date(app.job.deadline) < new Date() ? 'text-red-400' : 'text-gray-200'}`}>
                        {new Date(app.job.deadline).toLocaleDateString()} {new Date(app.job.deadline).toLocaleTimeString()}
                        {new Date(app.job.deadline) < new Date() && ' (Passed)'}
                      </span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="detail-label">Applied On:</span>
                    <span className="detail-value">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {app.job && app.job.skills && app.job.skills.length > 0 && (
                  <div className="skills-section">
                    <span className="detail-label">Required Skills:</span>
                    <div className="skills-list">
                      {app.job.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(AppliedJobs);


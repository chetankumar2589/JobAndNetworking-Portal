import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';

class ViewApplications extends Component {
  state = {
    applications: [],
    loading: true,
    error: '',
  };

  componentDidMount() {
    this.fetchApplications();
  }

  fetchApplications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate('/login', { state: { from: '/view-applications' } });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/applications/my-jobs', {
        headers: {
          'x-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const applications = await response.json();
      this.setState({ applications, loading: false });
    } catch (error) {
      console.error('Error fetching applications:', error);
      this.setState({ error: 'Failed to load applications. Please try again.', loading: false });
    }
  };

  handleViewResume = (resumeUrl) => {
    const fullUrl = `http://localhost:5000${resumeUrl}`;
    window.open(fullUrl, '_blank');
  };

  handleDownloadResume = (resumeUrl, applicantName) => {
    const fullUrl = `http://localhost:5000${resumeUrl}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = `${applicantName || 'resume'}-resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  render() {
    const { applications, loading, error } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading applications...</div>;
    }

    if (error) {
      return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;
    }

    if (applications.length === 0) {
      return (
        <div className="applications-container">
          <h1 className="text-4xl font-bold mb-8 text-lime-400">View Applications</h1>
          <div className="text-center mt-10 text-xl text-gray-400">
            No applications received yet. Applications will appear here when candidates apply to your posted jobs.
          </div>
        </div>
      );
    }

    return (
      <div className="applications-container">
        <h1 className="text-4xl font-bold mb-8 text-lime-400">View Applications</h1>
        
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="application-card">
              <div className="application-header">
                <h2 className="text-2xl font-semibold text-lime-400">
                  {app.job && app.job.title ? app.job.title : 'Job Title Not Available'}
                </h2>
                <span className={`status-badge status-${app.status || 'submitted'}`}>
                  {app.status || 'submitted'}
                </span>
              </div>
              
              <div className="application-details">
                <div className="detail-row">
                  <span className="detail-label">Applicant Name:</span>
                  <span className="detail-value">{app.applicant && app.applicant.name ? app.applicant.name : 'N/A'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{app.contactEmail || 'N/A'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{app.contactPhone || (app.applicant && app.applicant.phone) || 'N/A'}</span>
                </div>
                
                {app.applicant && app.applicant.linkedIn && (
                  <div className="detail-row">
                    <span className="detail-label">LinkedIn:</span>
                    <a href={app.applicant.linkedIn} target="_blank" rel="noopener noreferrer" className="detail-value text-blue-400 hover:underline">
                      {app.applicant.linkedIn}
                    </a>
                  </div>
                )}
                
                {app.applicant && app.applicant.skills && app.applicant.skills.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Skills:</span>
                    <span className="detail-value">{app.applicant.skills.join(', ')}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <span className="detail-label">Applied On:</span>
                  <span className="detail-value">
                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="resume-actions">
                <button
                  onClick={() => this.handleViewResume(app.resumeUrl)}
                  className="btn-view-resume"
                >
                  View Resume
                </button>
                <button
                  onClick={() => this.handleDownloadResume(app.resumeUrl, app.applicant && app.applicant.name)}
                  className="btn-download-resume"
                >
                  Download Resume
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(ViewApplications);


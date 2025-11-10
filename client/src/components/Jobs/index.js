import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';
class Jobs extends Component {
  state = {
    jobs: [],
    loading: true,
    searchQuery: '',
    filteredJobs: [],
    matchScores: {},
    loadingMatches: false,
    userProfile: null,

    // Apply modal state
    isApplyOpen: false,
    selectedJobId: null,
    contactEmail: '',
    contactPhone: '',
    resumeFile: null,
    submitting: false,
    applyError: '',
    applySuccess: '',

    // Read more modal state
    isReadMoreOpen: false,
    selectedJobForReadMore: null,
  };

  componentDidMount() {
    this.checkCacheOrFetch();
  }

  checkCacheOrFetch = () => {
    // Always fetch fresh jobs from server to ensure real-time updates
    this.fetchJobs();
    // Optionally load cached match scores if available (but jobs will be fresh)
    const cachedData = localStorage.getItem('matchScoresCache');
    if (cachedData) {
      try {
        const { matchScores, userProfile } = JSON.parse(cachedData);
        this.setState({ matchScores, userProfile });
      } catch (e) {
        // Ignore cache parse errors
      }
    }
  };

  fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      const jobs = await response.json();
      this.setState({ jobs, filteredJobs: jobs, loading: false }, () => {
        this.fetchUserProfileAndMatchScores();
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      this.setState({ loading: false });
    }
  };
  
  fetchUserProfileAndMatchScores = async () => {
    this.setState({ loadingMatches: true });
    const token = localStorage.getItem('token');

    if (!token) {
        this.setState({ loadingMatches: false });
        return;
    }
    
    let userId = null;
    try {
        const userResponse = await fetch('http://localhost:5000/api/profile/me', {
            headers: {
                'x-auth-token': token,
            },
        });
        const user = await userResponse.json();
        userId = user._id;
        this.setState({ userProfile: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        this.setState({ loadingMatches: false });
        return;
    }

    const { jobs } = this.state;
    const matchScores = {};

    for (const job of jobs) {
      try {
        const response = await fetch('http://localhost:5000/api/ai/match-job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ userId, jobId: job._id }),
        });
        const data = await response.json();
        matchScores[job._id] = data.matchScore;
      } catch (error) {
        console.error('Error fetching match score:', error);
        
        // Fallback: Basic exact matching with normalization
        if (this.state.userProfile && this.state.userProfile.skills && job.skills) {
          // Normalize skills for better matching
          const normalizeSkill = (skill) => {
            if (!skill) return '';
            return String(skill).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ');
          };
          
          const userSkills = (this.state.userProfile.skills || [])
            .map(s => normalizeSkill(s))
            .filter(s => s.length > 0);
          const jobSkills = (job.skills || [])
            .map(s => normalizeSkill(s))
            .filter(s => s.length > 0);
          
          if (jobSkills.length === 0) {
            matchScores[job._id] = 0;
          } else {
            const userSkillSet = new Set(userSkills);
            const matchedSkills = jobSkills.filter(jobSkill => userSkillSet.has(jobSkill));
            const score = Math.round((matchedSkills.length / jobSkills.length) * 100);
            matchScores[job._id] = Math.max(0, Math.min(100, score));
          }
        } else {
          matchScores[job._id] = 0;
        }
      }
    }

    this.setState({ matchScores, loadingMatches: false });
    // Cache the results in local storage
    localStorage.setItem('matchScoresCache', JSON.stringify({
      matchScores,
      userProfile: this.state.userProfile,
      jobs: this.state.jobs,
    }));
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value }, () => {
      this.filterJobs();
    });
  };
  
  handleRecalculateMatches = () => {
    localStorage.removeItem('matchScoresCache');
    this.setState({ matchScores: {}, userProfile: null }, () => {
      this.fetchJobs();
    });
  };

  openApplyModal = (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate('/login', { state: { from: '/jobs' } });
      return;
    }
    
    // Check if deadline has passed
    const job = this.state.jobs.find(j => j._id === jobId);
    if (job && job.deadline && new Date(job.deadline) < new Date()) {
      this.setState({ 
        isApplyOpen: true, 
        selectedJobId: null,
        applyError: 'The deadline for this job has passed. You cannot apply anymore.',
        applySuccess: '',
      });
      return;
    }
    
    const { userProfile } = this.state;
    this.setState({
      isApplyOpen: true,
      selectedJobId: jobId,
      contactEmail: (userProfile && userProfile.email) || '',
      contactPhone: (userProfile && userProfile.phone) || '',
      resumeFile: null,
      applyError: '',
      applySuccess: '',
    });
  };

  closeApplyModal = () => {
    this.setState({ isApplyOpen: false, selectedJobId: null, resumeFile: null, applyError: '', applySuccess: '' });
  };

  openReadMoreModal = (job) => {
    this.setState({ isReadMoreOpen: true, selectedJobForReadMore: job });
  };

  closeReadMoreModal = () => {
    this.setState({ isReadMoreOpen: false, selectedJobForReadMore: null });
  };

  truncateDescription = (description, maxLength = 120) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  onResumeChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    this.setState({ resumeFile: file });
  };

  submitApplication = async (e) => {
    e.preventDefault();
    const { selectedJobId, contactEmail, contactPhone, resumeFile, userProfile } = this.state;
    const token = localStorage.getItem('token');

    if (!token) {
      this.props.navigate('/login');
      return;
    }
    if (!selectedJobId || !resumeFile) {
      this.setState({ applyError: 'Please select a resume file.' });
      return;
    }

    this.setState({ submitting: true, applyError: '', applySuccess: '' });

    try {
      const form = new FormData();
      form.append('jobId', selectedJobId);
      form.append('contactEmail', (userProfile && userProfile.email) ? userProfile.email : contactEmail);
      if (userProfile && userProfile.phone) {
        form.append('contactPhone', userProfile.phone);
      } else if (contactPhone) {
        form.append('contactPhone', contactPhone);
      }
      form.append('resume', resumeFile);

      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'x-auth-token': token,
        },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.msg || 'Failed to submit application.';
        if (errorMsg.includes('already applied')) {
          this.setState({ applyError: 'You have already applied to this job.' });
        } else {
          this.setState({ applyError: errorMsg });
        }
      } else {
        this.setState({ applySuccess: 'Application submitted successfully!' });
        setTimeout(() => this.closeApplyModal(), 1200);
      }
    } catch (err) {
      console.error('Application submit error:', err);
      this.setState({ applyError: 'Server error. Please try again.' });
    } finally {
      this.setState({ submitting: false });
    }
  };

  

  filterJobs = () => {
    const { jobs, searchQuery } = this.state;
    const lowerCaseQuery = searchQuery.toLowerCase();

    const filteredJobs = jobs.filter((job) =>
      job.title.toLowerCase().includes(lowerCaseQuery) ||
      job.description.toLowerCase().includes(lowerCaseQuery) ||
      job.skills.some((skill) => skill.toLowerCase().includes(lowerCaseQuery))
    );

    this.setState({ filteredJobs });
  };

  render() {
    const { loading, searchQuery, filteredJobs, matchScores, loadingMatches, isApplyOpen, selectedJobId, contactEmail, contactPhone, submitting, applyError, applySuccess, userProfile, isReadMoreOpen } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading jobs...</div>;
    }

    const needsEmail = !(userProfile && userProfile.email);
    const needsPhone = !(userProfile && userProfile.phone);

    return (
      <div className="jobs-container">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">Job Listings</h1>
            <div className="flex gap-3">
              <button onClick={() => this.props.navigate('/posted-jobs')} className="btn-secondary-sm">
                Posted Jobs
              </button>
              <button onClick={() => this.props.navigate('/applied-jobs')} className="btn-secondary-sm">
                View Applied Jobs
              </button>
              <button onClick={this.handleRecalculateMatches} className="btn-secondary-sm">
                Recalculate Matches
              </button>
            </div>
        </div>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search jobs by title, description, or skills..."
            value={searchQuery}
            onChange={this.handleSearchChange}
            className="search-input"
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center mt-10 text-xl">No job postings found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const description = job.description || '';
              const isDescriptionLong = description.length > 120;
              const truncatedDescription = this.truncateDescription(description, 120);
              
              return (
                <div key={job._id} className="job-card">
                  <div className="job-card-header">
                    <h2 className="job-card-title">{job.title}</h2>
                  </div>
                  
                  <div className="job-card-body">
                    <p className="job-card-description">{truncatedDescription}</p>
                    {isDescriptionLong && (
                      <button 
                        onClick={() => this.openReadMoreModal(job)}
                        className="read-more-link"
                      >
                        Read More
                      </button>
                    )}
                    
                    <div className="job-card-skills">
                      {job.skills && job.skills.length > 0 && job.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="job-card-details">
                      <div className="job-card-salary-match">
                        <span className="job-card-salary">
                          {job.salary ? `Salary: ₹${job.salary}` : job.budget ? `Budget: ₹${job.budget}` : 'Not specified'}
                        </span>
                        {loadingMatches ? (
                          <span className="job-card-match-loading">Matching...</span>
                        ) : (
                          <span className="job-card-match">
                            {matchScores[job._id] || 'N/A'}% Match
                          </span>
                        )}
                      </div>
                      
                      {job.deadline && (
                        <div className="job-card-deadline">
                          <i className="fas fa-calendar-alt mr-2"></i>
                          {new Date(job.deadline).toLocaleDateString()} {new Date(job.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="job-card-footer">
                    <button 
                      className="job-card-apply-btn" 
                      onClick={() => this.openApplyModal(job._id)}
                      disabled={job.deadline && new Date(job.deadline) < new Date()}
                    >
                      {job.deadline && new Date(job.deadline) < new Date() ? 'Deadline Passed' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isReadMoreOpen && this.state.selectedJobForReadMore && (
          <div className="modal-overlay" onClick={this.closeReadMoreModal}>
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={this.closeReadMoreModal} className="modal-close-button">&times;</button>
              <h3 className="text-2xl font-bold text-lime-400 mb-4">{this.state.selectedJobForReadMore.title}</h3>
              <div className="job-readmore-content">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">Job Description</h4>
                  <p className="text-gray-300 whitespace-pre-wrap">{this.state.selectedJobForReadMore.description}</p>
                </div>
                {this.state.selectedJobForReadMore.skills && this.state.selectedJobForReadMore.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-300 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap">
                      {this.state.selectedJobForReadMore.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {this.state.selectedJobForReadMore.salary ? `Salary: ₹${this.state.selectedJobForReadMore.salary}` : this.state.selectedJobForReadMore.budget ? `Budget: ₹${this.state.selectedJobForReadMore.budget}` : 'Not specified'}
                    </span>
                    {this.state.selectedJobForReadMore.deadline && (
                      <span className="text-gray-400">
                        Deadline: {new Date(this.state.selectedJobForReadMore.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={() => {
                      this.closeReadMoreModal();
                      this.openApplyModal(this.state.selectedJobForReadMore._id);
                    }}
                    className="btn-primary-sm"
                    disabled={this.state.selectedJobForReadMore.deadline && new Date(this.state.selectedJobForReadMore.deadline) < new Date()}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isApplyOpen && (
          <div className="modal-overlay">
            <div className="modal-content max-w-lg">
              <button onClick={this.closeApplyModal} className="modal-close-button">&times;</button>
              <h3 className="text-xl font-semibold mb-4">Apply for Job</h3>
              {applyError && !selectedJobId ? (
                <div className="space-y-4">
                  <p className="text-red-500 text-sm">{applyError}</p>
                  <div className="flex justify-end">
                    <button type="button" onClick={this.closeApplyModal} className="btn-secondary-sm">Close</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={this.submitApplication} className="space-y-4">
                  {needsEmail && (
                    <input
                      type="email"
                      placeholder="Email"
                      value={contactEmail}
                      onChange={(e) => this.setState({ contactEmail: e.target.value })}
                      className="profile-input"
                      required
                    />
                  )}
                  {needsPhone && (
                    <input
                      type="text"
                      placeholder="Phone number (optional)"
                      value={contactPhone}
                      onChange={(e) => this.setState({ contactPhone: e.target.value })}
                      className="profile-input"
                    />
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={this.onResumeChange}
                    className="profile-input"
                    required
                  />
                  {applyError && <p className="text-red-500 text-sm">{applyError}</p>}
                  {applySuccess && <p className="text-emerald-400 text-sm">{applySuccess}</p>}
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={this.closeApplyModal} className="btn-secondary-sm">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary-sm">{submitting ? 'Submitting...' : 'Submit'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Jobs);

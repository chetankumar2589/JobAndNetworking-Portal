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
  };

  componentDidMount() {
    this.checkCacheOrFetch();
  }

  checkCacheOrFetch = () => {
    const cachedData = localStorage.getItem('matchScoresCache');
    if (cachedData) {
      const { matchScores, userProfile, jobs } = JSON.parse(cachedData);
      this.setState({
        jobs,
        filteredJobs: jobs,
        matchScores,
        userProfile,
        loading: false,
      });
    } else {
      this.fetchJobs();
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
        
        if (this.state.userProfile && this.state.userProfile.skills && job.skills) {
          const userSkills = this.state.userProfile.skills.map(s => s.toLowerCase());
          const jobSkills = job.skills.map(s => s.toLowerCase());
          const matchedSkills = userSkills.filter(skill => jobSkills.includes(skill));
          let score = Math.floor((matchedSkills.length / jobSkills.length) * 100);
          if (score > 100) score = 100;
          matchScores[job._id] = score;
        } else {
          matchScores[job._id] = 'N/A';
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
    const { loading, searchQuery, filteredJobs, matchScores, loadingMatches } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading jobs...</div>;
    }

    return (
      <div className="jobs-container">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">Job Listings</h1>
            <button onClick={this.handleRecalculateMatches} className="btn-secondary-sm">
                Recalculate Matches
            </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="job-card">
                <h2 className="text-2xl font-semibold text-lime-400">{job.title}</h2>
                <p className="text-gray-300 mt-2">{job.description}</p>
                <div className="flex flex-wrap mt-4">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-gray-400">{job.salary ? `Salary: $${job.salary}` : `Budget: ${job.budget}`}</span>
                  {loadingMatches ? (
                      <span className="text-gray-400">Matching...</span>
                  ) : (
                      <span className="text-lg font-bold text-lime-400">
                          Match: {matchScores[job._id] || 'N/A'}%
                      </span>
                  )}
                  <button className="btn-primary-sm">Apply</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Jobs);

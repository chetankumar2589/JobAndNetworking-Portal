import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';

class PostedJobs extends Component {
  state = {
    jobs: [],
    payments: [],
    loading: true,
    error: '',
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate('/login', { state: { from: '/posted-jobs' } });
      return;
    }

    try {
      const [jobsResponse, paymentsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/jobs/my-jobs', {
          headers: { 'x-auth-token': token },
        }),
        fetch('http://localhost:5000/api/profile/payment-history', {
          headers: { 'x-auth-token': token },
        }),
      ]);

      if (!jobsResponse.ok || !paymentsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const jobs = await jobsResponse.json();
      const payments = await paymentsResponse.json();

      // Create a map of job titles to payments
      const paymentMap = {};
      payments.forEach(payment => {
        if (!paymentMap[payment.jobTitle]) {
          paymentMap[payment.jobTitle] = [];
        }
        paymentMap[payment.jobTitle].push(payment);
      });

      this.setState({ jobs, payments: paymentMap, loading: false });
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      this.setState({ error: 'Failed to load posted jobs. Please try again.', loading: false });
    }
  };

  render() {
    const { jobs, payments, loading, error } = this.state;

    if (loading) {
      return <div className="text-center mt-20 text-xl">Loading posted jobs...</div>;
    }

    if (error) {
      return <div className="text-center mt-20 text-xl text-red-500">{error}</div>;
    }

    if (jobs.length === 0) {
      return (
        <div className="posted-jobs-container">
          <h1 className="text-4xl font-bold mb-8 text-lime-400">Posted Jobs</h1>
          <div className="text-center mt-10 text-xl text-gray-400">
            You haven't posted any jobs yet. <a href="/post-job" className="text-lime-400 hover:underline">Post your first job</a>
          </div>
        </div>
      );
    }

    return (
      <div className="posted-jobs-container">
        <h1 className="text-4xl font-bold mb-8 text-lime-400">Posted Jobs</h1>
        
        <div className="space-y-6">
          {jobs.map((job) => {
            const jobPayments = payments[job.title] || [];
            const totalPaid = jobPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

            return (
              <div key={job._id} className="posted-job-card">
                <div className="job-header">
                  <h2 className="text-2xl font-semibold text-lime-400">{job.title}</h2>
                  <span className="job-date">
                    Posted: {job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="job-details">
                  <p className="text-gray-300 mb-4">{job.description}</p>
                  
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Salary:</span>
                      <span className="detail-value">{job.salary ? `₹${job.salary}` : job.budget ? `₹${job.budget}` : 'Not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">Total Paid:</span>
                      <span className="detail-value text-lime-400 font-semibold">
                        {totalPaid > 0 ? `${totalPaid.toFixed(4)} SOL` : 'No payment recorded'}
                      </span>
                    </div>
                  </div>

                  {job.skills && job.skills.length > 0 && (
                    <div className="skills-section">
                      <span className="detail-label">Required Skills:</span>
                      <div className="skills-list">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {jobPayments.length > 0 && (
                  <div className="payment-history-section">
                    <h3 className="payment-history-title">Payment History</h3>
                    <div className="payment-list">
                      {jobPayments.map((payment) => (
                        <div key={payment._id} className="payment-item">
                          <div className="payment-info">
                            <span className="payment-amount">{payment.amount.toFixed(4)} SOL</span>
                            <span className="payment-date">
                              {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="payment-tx">
                            <span className="tx-label">Transaction:</span>
                            <a
                              href={`https://explorer.solana.com/tx/${payment.txSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="tx-link"
                            >
                              {payment.txSignature.substring(0, 8)}...{payment.txSignature.substring(payment.txSignature.length - 8)}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default withRouter(PostedJobs);


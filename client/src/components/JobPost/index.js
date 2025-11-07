import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import Modal from '../Modal';

class JobPost extends Component {
  state = {
    title: '',
    description: '',
    skills: '',
    budget: '',
    salary: '',
    deadline: '',
    error: '',
    loading: false,
    walletConnected: false,
    publicWalletAddress: '',
    isModalOpen: false,
    modalMessage: '',
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleWalletConnect = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        this.setState({
          walletConnected: true,
          publicWalletAddress: response.publicKey.toString(),
        });
      } else {
        this.setState({
          isModalOpen: true,
          modalMessage: 'Phantom wallet not found. Please install it to continue.',
        });
      }
    } catch (err) {
      console.error(err);
      this.setState({ error: 'Failed to connect wallet.' });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ loading: true, error: '' });
    const { title, description, skills, budget, salary, deadline } = this.state;
    
    if (!deadline) {
      this.setState({ error: 'Please select a deadline date.', loading: false });
      return;
    }
    
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      this.setState({ error: 'Deadline must be in the future.', loading: false });
      return;
    }
    const token = localStorage.getItem('token');

    if (!token) {
        this.setState({ error: 'You must be logged in to post a job.' });
        this.props.navigate('/login');
        return;
    }
    
    const { solana } = window;
    if (!solana || !solana.publicKey) {
        this.setState({ error: 'Please connect your Phantom wallet.' });
        return;
    }

    try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const adminWallet = new PublicKey('3m5Y3XZeZ4AGpqLzgTZJUgsMztHtr7ZCR3ZWgkqc9tXT');
        
        const userResponse = await fetch('http://localhost:5000/api/profile/me', { // Localhost URL
          headers: {
            'x-auth-token': token,
          },
        });
        const user = await userResponse.json();

        if (!user || user.publicWalletAddress !== solana.publicKey.toString()) {
          this.setState({ error: 'Connected wallet does not match your profile wallet address. Please update your profile.' });
          return;
        }

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: solana.publicKey,
                toPubkey: adminWallet,
                lamports: 0.01 * LAMPORTS_PER_SOL,
            })
        );
        transaction.feePayer = solana.publicKey;
        
        let blockhashObj = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhashObj.blockhash;

        const signedTransaction = await solana.signAndSendTransaction(transaction);
        const txSignature = signedTransaction.signature;
        
        await connection.confirmTransaction(txSignature, 'confirmed');

        const response = await fetch('http://localhost:5000/api/jobs', { // Localhost URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token,
            },
            body: JSON.stringify({
                title,
                description,
                skills,
                budget,
                salary,
                deadline,
                txSignature,
            }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log('Job posted successfully:', data);
            localStorage.removeItem('matchScoresCache');
            this.props.navigate('/jobs');
        } else {
            this.setState({ error: data.msg });
        }
    } catch (error) {
        console.error('Job post failed:', error);
        this.setState({ error: 'Transaction failed. Please try again.' });
    } finally {
        this.setState({ loading: false });
    }
  };
  
  closeModal = () => {
    this.setState({ isModalOpen: false, modalMessage: '' });
  };

  render() {
    const { title, description, skills, budget, salary, deadline, error, loading, walletConnected, publicWalletAddress, isModalOpen, modalMessage } = this.state;

    return (
      <div className="job-post-container">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">
          Post a New Job
        </h1>
        <form onSubmit={this.handleSubmit} className="job-post-form">
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={title}
            onChange={this.handleChange}
            className="job-input"
            required
          />
          <textarea
            name="description"
            placeholder="Job Description"
            value={description}
            onChange={this.handleChange}
            className="job-input"
            required
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (e.g., React, Node.js, MongoDB)"
            value={skills}
            onChange={this.handleChange}
            className="job-input"
            required
          />
          <input
            type="text"
            name="budget"
            placeholder="Budget (e.g., ₹50000)"
            value={budget}
            onChange={this.handleChange}
            className="job-input"
          />
          <input
            type="text"
            name="salary"
            placeholder="Salary (e.g., ₹750000)"
            value={salary}
            onChange={this.handleChange}
            className="job-input"
          />
          <input
            type="datetime-local"
            name="deadline"
            placeholder="Application Deadline"
            value={deadline}
            onChange={this.handleChange}
            className="job-input"
            required
            min={new Date().toISOString().slice(0, 16)}
          />

          {!walletConnected ? (
            <button
              type="button"
              onClick={this.handleWalletConnect}
              className="btn-connect-wallet"
            >
              Connect Phantom Wallet
            </button>
          ) : (
            <>
              {publicWalletAddress && <p className="text-gray-400 text-sm mb-4">Connected: {publicWalletAddress}</p>}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                className="btn-primary-form"
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
            </>
          )}
        </form>
        {isModalOpen && (
          <Modal onClose={this.closeModal} message={modalMessage} />
        )}
      </div>
    );
  }
}

export default withRouter(JobPost);

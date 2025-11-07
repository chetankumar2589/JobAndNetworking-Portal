import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../../withRouter';
import './index.css';

class Login extends Component {
  state = {
    email: '',
    password: '',
    showSubmitError: false,
    errorMsg: '',
    showPassword: false,
  };

  onChangeEmail = event => {
    this.setState({ email: event.target.value });
  };

  onChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  onSubmitSuccess = () => {
    this.props.onLoginSuccess();
    this.props.navigate('/');
  };

  onSubmitFailure = errorMsg => {
    this.setState({ showSubmitError: true, errorMsg });
  };

  submitForm = async event => {
    event.preventDefault();
    const { email, password } = this.state;
    const userDetails = { email, password };
    const url = 'http://localhost:5000/api/auth/login';
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        this.onSubmitSuccess();
      } else {
        this.onSubmitFailure(data.msg);
      }
    } catch (error) {
      this.onSubmitFailure('Server error. Please try again.');
    }
  };

  toggleShowPassword = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  };

  render() {
    const { email, password, showSubmitError, errorMsg, showPassword } = this.state;
    return (
      <div className="auth-container">
        <h1 className="text-3xl font-bold mb-6 text-lime-400">Login</h1>
        <form className="auth-form" onSubmit={this.submitForm}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={this.onChangeEmail}
            className="auth-input"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={password}
              onChange={this.onChangePassword}
              className="auth-input pr-10"
            />
            <button
              type="button"
              onClick={this.toggleShowPassword}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 focus:outline-none"
            >
              <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
            </button>
          </div>
          <button type="submit" className="btn-primary-form">
            Login
          </button>
          {showSubmitError && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
        </form>
        <p className="mt-4 text-sm text-gray-400">
          Don't have an account? <Link to="/register" className="text-lime-400 hover:underline">Register here</Link>
        </p>
      </div>
    );
  }
}

export default withRouter(Login);

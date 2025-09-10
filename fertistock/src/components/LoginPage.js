import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState('admin');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  if (!userId.trim() || !password.trim()) {
    setError('Please fill in all fields.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userId.toLowerCase(),
        password,
        role: role.toLowerCase(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    localStorage.setItem('role', role.toLowerCase());
    localStorage.setItem('userId', userId.toLowerCase());

    if (role === 'admin') {
      navigate('/AdminDashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setError('Server error. Please try again later.');
  }
};


  return (
    <div className="login-container">
      <h2 className="login-title">Login to Your Account</h2>
      <div className="role-toggle">
        <button
          className={`role-button ${role === 'admin' ? 'active' : ''}`}
          onClick={() => setRole('admin')}
          type="button"
        >
          Admin Login
        </button>
        <button
          className={`role-button ${role === 'worker' ? 'active' : ''}`}
          onClick={() => setRole('worker')}
          type="button"
        >
          Worker Login
        </button>
      </div>
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <label>User ID</label>
          <input
            type="text"
            placeholder="Enter your user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="login-input"
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="login-button">Login</button>
        <p className="login-footer-text">Access is restricted to authorized personnel only.</p>
      </form>
    </div>
  );
};

export default LoginPage;

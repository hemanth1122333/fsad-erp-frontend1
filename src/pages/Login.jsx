import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import CaptchaGrid from '../components/CaptchaGrid';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState({ sessionId: '', question: '', images: [] });
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCaptcha = async () => {
    const response = await api.get('/auth/captcha-images');
    setCaptcha(response.data);
    setSelectedImageIds([]);
  };

  useEffect(() => {
    loadCaptcha().catch(() => setError('Could not load CAPTCHA'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await login({
        email,
        password,
        captchaSessionId: captcha.sessionId,
        selectedImageIds,
      });
      navigate(response.homeRoute || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Connection to server failed or invalid credentials');
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const toggleSelected = (imageId) => {
    setSelectedImageIds((current) => (current.includes(imageId) ? current.filter((id) => id !== imageId) : [...current, imageId]));
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-copy">
          <div>
            <div className="auth-brand">
              <span>EduERP</span>
            </div>
            <p className="eyebrow" style={{ marginTop: 18 }}>Education operations</p>
            <h1>Sign in</h1>
            <p>Use your email and password to access the ERP dashboard for your role.</p>
          </div>

          <div className="auth-highlights">
            <div>
              <strong>Secure access</strong>
              <span>JWT login with image CAPTCHA verification.</span>
            </div>
            <div>
              <strong>Role aware</strong>
              <span>Students, teachers, and admins land on the right workspace.</span>
            </div>
            <div>
              <strong>Live records</strong>
              <span>Attendance, grades, messages, and notifications stay in sync.</span>
            </div>
          </div>
        </div>

        {error ? <div className="alert error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@school.edu" required />
          </label>

          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </label>

          <CaptchaGrid challenge={captcha} selectedImageIds={selectedImageIds} onToggle={toggleSelected} onRefresh={loadCaptcha} />

          <button type="submit" disabled={loading} className="primary-button full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="auth-switch">New here? <Link to="/signup">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;

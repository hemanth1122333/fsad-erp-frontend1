import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import CaptchaGrid from '../components/CaptchaGrid';

const emptyChallenge = { sessionId: '', question: '', images: [] };

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ROLE_STUDENT' });
  const [captcha, setCaptcha] = useState(emptyChallenge);
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signup({ ...form, captchaSessionId: captcha.sessionId, selectedImageIds });
      navigate(response.homeRoute || '/dashboard');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Signup failed');
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
      <div className="auth-card wide-card">
        <div className="auth-copy">
          <div>
            <div className="auth-brand">
              <span>EduERP</span>
            </div>
            <p className="eyebrow" style={{ marginTop: 18 }}>Platform onboarding</p>
            <h1>Create an account</h1>
            <p>Set up a role-based ERP account with BCrypt passwords, JWT login, and image CAPTCHA verification.</p>
          </div>

          <div className="auth-highlights">
            <div>
              <strong>Instant role setup</strong>
              <span>Choose student, teacher, or admin and land in the correct workspace.</span>
            </div>
            <div>
              <strong>Fast onboarding</strong>
              <span>Profiles are created automatically when you sign up.</span>
            </div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="split-grid">
            <label className="field"><span>Name</span><input name="name" value={form.name} onChange={handleChange} placeholder="Full name" /></label>
            <label className="field"><span>Email</span><input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@school.edu" /></label>
          </div>

          <div className="split-grid">
            <label className="field"><span>Password</span><input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Strong password" /></label>
            <label className="field"><span>Role</span>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="ROLE_STUDENT">Student</option>
                <option value="ROLE_TEACHER">Teacher</option>
                <option value="ROLE_ADMIN">Admin</option>
                <option value="ROLE_ADMINISTRATOR">Administrator</option>
              </select>
            </label>
          </div>

          {error ? <div className="alert error">{error}</div> : null}

          <CaptchaGrid challenge={captcha} selectedImageIds={selectedImageIds} onToggle={toggleSelected} onRefresh={loadCaptcha} />

          <button type="submit" className="primary-button full" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
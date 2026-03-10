import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Ghost, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
      router.push('/analyze');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up — GhostEngineer</title>
      </Head>

      <div className="auth-page">
        <div className="landing-glow glow-1" />

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="auth-logo">
              <Ghost size={36} style={{ color: 'var(--primary)' }} />
              <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>GhostEngineer</span>
            </div>
          </Link>

          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Join GhostEngineer and start exploring codebases</p>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating account...</>
              ) : (
                <>Sign Up <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link href="/login" className="auth-switch-link">Log in</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

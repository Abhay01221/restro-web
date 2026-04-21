import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword, getAuthErrorMessage } from '../firebase/auth';

export default function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      console.error('[Auth Error]', err.code, err.message, err);
      const msg = getAuthErrorMessage(err.code, err.message);
      setErrorMsg(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%', maxWidth: 400,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2.5rem',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Mail size={24} color="var(--primary)" />
            </div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
              Reset Password
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {sent
                ? 'Check your inbox for the reset link.'
                : "Enter your email and we'll send you a reset link."}
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '1rem' }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
              <p style={{ color: '#22C55E', fontWeight: 600, marginBottom: 8 }}>Reset link sent!</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                We've sent a password reset link to{' '}
                <strong style={{ color: 'var(--text)' }}>{email}</strong>.
                Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Error banner */}
              {errorMsg && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem',
                }}>
                  <AlertCircle size={16} color="#EF4444" style={{ marginTop: 1, flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
                    placeholder="your@email.com"
                    className="input-dark"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Sending…
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {!sent && (
            <Link
              to="/login"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: '1.5rem', fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          )}
        </motion.div>
      </div>
    </>
  );
}

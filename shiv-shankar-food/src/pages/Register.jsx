import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { registerWithEmail, loginWithGoogle, getAuthErrorMessage } from '../firebase/auth';

// ─── Password strength ────────────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)           s++;
  if (pw.length >= 10)          s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  return s <= 1 ? 1 : s <= 3 ? 2 : 3;
};
const STRENGTH_LABEL = ['', 'Weak', 'Medium', 'Strong'];
const STRENGTH_COLOR = ['', '#EF4444', '#F97316', '#22C55E'];

// ─── Inline spinner ───────────────────────────────────────────────────────────
const Spinner = ({ light = true }) => (
  <span style={{
    width: 16, height: 16, flexShrink: 0,
    border: `2px solid ${light ? 'rgba(255,255,255,0.3)' : '#ccc'}`,
    borderTopColor: light ? 'white' : '#333',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  }} />
);

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [fieldErr, setFieldErr]   = useState({});
  const [errorMsg, setErrorMsg]   = useState('');
  const [done, setDone]           = useState(false);
  const [doneEmail, setDoneEmail] = useState('');

  const strength = getStrength(form.password);

  // ─── Field helpers ────────────────────────────────────────────────────────────
  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setFieldErr(e => ({ ...e, [k]: '' }));
    setErrorMsg('');
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())                                    e.name     = 'Full name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address.';
    if (form.password.length < 6)                             e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm)                       e.confirm  = 'Passwords do not match.';
    if (!agreed)                                              e.agreed   = 'You must accept the terms to continue.';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  // ─── Email register ───────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setLoading(true);
    try {
      await registerWithEmail(form.name.trim(), form.email.trim(), form.password);
      setDoneEmail(form.email.trim());
      setDone(true);
      toast.success('Account created! Check your email to verify.');
    } catch (err) {
      console.error('[Auth Error]', err.code, err.message, err);
      const msg = getAuthErrorMessage(err.code, err.message);
      setErrorMsg(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  // ─── Google ───────────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setErrorMsg('');
    setGLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        toast.success('Signed in with Google! 🎉');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[Auth Error]', err.code, err.message, err);
      const msg = getAuthErrorMessage(err.code, err.message);
      if (msg) {
        setErrorMsg(msg);
        toast.error(msg, { duration: 6000 });
      }
    } finally {
      setGLoading(false);
    }
  };

  // ─── Verification sent screen ─────────────────────────────────────────────────
  if (done) {
    return (
      <>
        <Helmet><title>Verify Email | Shiv Shankar Chinese Food</title></Helmet>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: '100%', maxWidth: 420,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '2.5rem', textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Mail size={32} color="#22C55E" />
            </div>

            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--text)', marginBottom: 12 }}>
              Verify Your Email
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 8 }}>
              We've sent a verification link to:
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 20 }}>
              {doneEmail}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
              Click the link in the email to activate your account.
              Check your <strong>spam / junk folder</strong> if you don't see it.
            </p>

            <div style={{
              background: 'rgba(241,196,15,0.06)', border: '1px solid rgba(241,196,15,0.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: 'left',
            }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                💡 After verifying, go to{' '}
                <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Login</Link>
                {' '}and sign in with your email and password.
              </p>
            </div>

            <Link
              to="/login"
              className="btn-primary"
              style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  // ─── Registration form ────────────────────────────────────────────────────────
  return (
    <>
      <Helmet><title>Register | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem 1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 70%)', top: '5%', right: '5%', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%', maxWidth: 440,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2.5rem',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🐉</div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
              Create Account
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Join the Shiv Shankar family</p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem',
                }}
              >
                <AlertCircle size={16} color="#EF4444" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Your full name"
                className="input-dark"
                autoComplete="name"
                disabled={loading}
                style={{ borderColor: fieldErr.name ? '#EF4444' : undefined }}
              />
              {fieldErr.name && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{fieldErr.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="your@email.com"
                className="input-dark"
                autoComplete="email"
                disabled={loading}
                style={{ borderColor: fieldErr.email ? '#EF4444' : undefined }}
              />
              {fieldErr.email && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{fieldErr.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setField('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-dark"
                  autoComplete="new-password"
                  style={{ paddingRight: 44, borderColor: fieldErr.password ? '#EF4444' : undefined }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= strength ? STRENGTH_COLOR[strength] : 'var(--border)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: STRENGTH_COLOR[strength] }}>
                    {STRENGTH_LABEL[strength]}
                  </p>
                </div>
              )}
              {fieldErr.password && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{fieldErr.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Confirm Password</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setField('confirm', e.target.value)}
                placeholder="Repeat your password"
                className="input-dark"
                autoComplete="new-password"
                style={{ borderColor: fieldErr.confirm ? '#EF4444' : undefined }}
                disabled={loading}
              />
              {fieldErr.confirm && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{fieldErr.confirm}</p>}
            </div>

            {/* Terms */}
            <div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setFieldErr(er => ({ ...er, agreed: '' })); }}
                  style={{ marginTop: 2, accentColor: 'var(--primary)', width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <span style={{ color: 'var(--accent)' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: 'var(--accent)' }}>Privacy Policy</span>
                </span>
              </label>
              {fieldErr.agreed && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{fieldErr.agreed}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner /> Creating account…</span>
                : 'Create Account'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || gLoading}
            style={{
              width: '100%', padding: '12px',
              background: 'white', color: '#333',
              border: '1px solid #ddd', borderRadius: 8,
              cursor: loading || gLoading ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: loading || gLoading ? 0.7 : 1,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading && !gLoading) e.currentTarget.style.background = '#f5f5f5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
          >
            {gLoading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner light={false} /> Signing in…</span>
              : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )
            }
          </button>

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

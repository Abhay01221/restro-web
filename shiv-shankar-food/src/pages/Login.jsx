import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  loginWithEmail,
  loginWithGoogle,
  resendVerificationEmail,
  getAuthErrorMessage,
} from '../firebase/auth';

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

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/dashboard';
  const justVerified = searchParams.get('verified') === 'true';

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [gLoading, setGLoading]   = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  // Resend verification state
  const [showResend, setShowResend]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ─── Email login ─────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setShowResend(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      toast.success('Welcome back! 🎉');
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error('[Auth Error]', err.code, err.message, err);

      if (err.code === 'auth/email-not-verified') {
        setShowResend(true);
        setErrorMsg(
          'Your email is not verified yet. ' +
          'Click the link in the verification email, then try again.'
        );
      } else {
        const msg = getAuthErrorMessage(err.code, err.message);
        if (msg) {
          setErrorMsg(msg);
          toast.error(msg, { duration: 6000 });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Google login ─────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setErrorMsg('');
    setGLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        // popup succeeded
        toast.success('Signed in with Google! 🎉');
        navigate(redirect, { replace: true });
      }
      // null = popup closed or redirect initiated — both are silent
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

  // ─── Resend verification ──────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    if (!email.trim() || !password.trim()) {
      toast.error('Enter your email and password above, then click Resend.');
      return;
    }
    setResendLoading(true);
    try {
      // Pass credentials so we can sign in temporarily if needed
      await resendVerificationEmail(email.trim(), password);
      toast.success('Verification email sent! Check your inbox.');
      setResendCooldown(60);
    } catch (err) {
      console.error('[Auth Error]', err.code, err.message, err);
      const msg = getAuthErrorMessage(err.code, err.message) || err.message;
      toast.error(msg, { duration: 6000 });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Login | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 70%)', top: '10%', left: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(241,196,15,0.08) 0%, transparent 70%)', bottom: '10%', right: '10%', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%', maxWidth: 420,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2.5rem',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🐉</div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--text)', marginBottom: 4 }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign in to your account</p>
          </div>

          {/* ── Email verified success banner ── */}
          {justVerified && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: '1.5rem',
            }}>
              <CheckCircle size={16} color="#22C55E" />
              <p style={{ fontSize: 13, color: '#22C55E', fontWeight: 600 }}>
                Email verified! You can now sign in.
              </p>
            </div>
          )}

          {/* ── Error banner ── */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px', marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} color="#EF4444" style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Resend verification panel ── */}
          <AnimatePresence>
            {showResend && (
              <motion.div
                key="resend"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(241,196,15,0.06)', border: '1px solid rgba(241,196,15,0.25)',
                  borderRadius: 10, padding: '12px 14px', marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Mail size={15} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
                      Email not verified
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.5 }}>
                      Check your inbox and spam folder for the verification link.
                      If you didn't receive it, click below to resend.
                    </p>
                    <button
                      onClick={handleResend}
                      disabled={resendLoading || resendCooldown > 0}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 12, fontWeight: 600,
                        color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent)',
                        background: 'none', border: 'none',
                        cursor: resendCooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
                        padding: 0,
                        textDecoration: resendCooldown > 0 ? 'none' : 'underline',
                      }}
                    >
                      {resendLoading
                        ? <><Spinner light={false} /> Sending…</>
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : <><RefreshCw size={12} /> Resend verification email</>
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Login form ── */}
          <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
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
                disabled={loading || gLoading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="Your password"
                  className="input-dark"
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                  disabled={loading || gLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || gLoading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 4 }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Spinner /> Signing in…</span>
                : 'Sign In'
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

          {/* Register link */}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Create an account
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

import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { handleGoogleRedirect } from './firebase/auth';
import { getUserProfile } from './firebase/firestore';
import useAuthStore from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ChatBot from './components/ChatBot';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { ChevronUp } from 'lucide-react';

// Lazy-loaded pages
const Home         = lazy(() => import('./pages/Home'));
const Menu         = lazy(() => import('./pages/Menu'));
const Cart         = lazy(() => import('./pages/Cart'));
const Checkout     = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Login        = lazy(() => import('./pages/Login'));
const Register     = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const About        = lazy(() => import('./pages/About'));
const Contact      = lazy(() => import('./pages/Contact'));
const NotFound     = lazy(() => import('./pages/NotFound'));
const Admin        = lazy(() => import('./pages/Admin'));

const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner" />
  </div>
);

function AppContent() {
  const { setUser, setUserProfile, setLoading, clearUser } = useAuthStore();
  const [appReady, setAppReady]         = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [cookieDismissed, setCookieDismissed] = useState(
    () => localStorage.getItem('cookie-dismissed') === 'true'
  );

  useEffect(() => {
    // ── 1. Handle Google redirect result (fires when popup was blocked) ──────
    handleGoogleRedirect().catch(err =>
      console.error('[App] Google redirect error:', err.code, err.message)
    );

    // ── 2. Auth state listener ────────────────────────────────────────────────
    // onAuthStateChanged is the single source of truth for auth state.
    // We wait for it to fire before showing the app (no arbitrary timer).
    const unsub = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          console.log(
            '[App] Auth state: signed in →',
            firebaseUser.email,
            '| emailVerified:', firebaseUser.emailVerified
          );
          setUser(firebaseUser);

          // Load Firestore profile — non-blocking
          getUserProfile(firebaseUser.uid)
            .then(profile => setUserProfile(profile))
            .catch(err => console.warn('[App] Firestore profile load failed:', err.message));
        } else {
          console.log('[App] Auth state: signed out');
          clearUser();
        }

        setLoading(false);
        setAppReady(true);   // ← app is ready once we know auth state
      },
      (err) => {
        console.error('[App] onAuthStateChanged error:', err.code, err.message);
        setLoading(false);
        setAppReady(true);
      }
    );

    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dismissCookie = () => {
    localStorage.setItem('cookie-dismissed', 'true');
    setCookieDismissed(true);
  };

  // ── Loading screen — shown until Firebase resolves auth state ──────────────
  if (!appReady) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🐉</div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 22,
            color: 'var(--text)',
            marginBottom: 4,
          }}>
            Shiv Shankar
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Chinese Food
          </div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/menu"           element={<Menu />} />
            <Route path="/cart"           element={<Cart />} />
            <Route path="/checkout"       element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-success"  element={<OrderSuccess />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/register"       element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/about"          element={<About />} />
            <Route path="/contact"        element={<Contact />} />
            <Route path="/admin"          element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CartDrawer />
      <ChatBot />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/919876543210?text=Hi! I'd like to place an order."
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        aria-label="Chat on WhatsApp"
      >
        <span style={{ fontSize: 24 }}>💬</span>
      </a>

      {/* Back to top */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          style={{ right: 24, bottom: 90 }}
        >
          <ChevronUp size={18} color="var(--text)" />
        </button>
      )}

      {/* Cookie banner */}
      {!cookieDismissed && (
        <div className="cookie-banner">
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              🍪 We use cookies to enhance your experience. By continuing, you agree to our{' '}
              <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
            <button
              onClick={dismissCookie}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' }, duration: 6000 },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </HelmetProvider>
  );
}

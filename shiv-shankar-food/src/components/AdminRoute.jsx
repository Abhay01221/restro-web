import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getUserRole } from '../firebase/firestore';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthStore();
  const [role, setRole]     = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    getUserRole(user.uid)
      .then(r => setRole(r))
      .catch(() => setRole('user'))
      .finally(() => setChecking(false));
  }, [user]);

  if (loading || checking) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login?redirect=/admin" replace />;
  if (role !== 'admin') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: 'var(--text)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>You do not have admin privileges.</p>
      </div>
    );
  }

  return children;
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 Not Found | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Chopsticks 404 */}
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(5rem, 15vw, 10rem)', fontWeight: 900, color: 'var(--surface-2)', lineHeight: 1, userSelect: 'none' }}>
              404
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
              🥢
            </div>
          </div>

          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: 'var(--text)', marginBottom: 12 }}>
            Oops! This page got lost in the kitchen.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: '2rem', maxWidth: 400 }}>
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Home size={16} /> Go Home
            </Link>
            <Link to="/menu" className="btn-gold">
              Browse Menu
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

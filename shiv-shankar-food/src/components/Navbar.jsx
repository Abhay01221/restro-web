import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { logoutUser } from '../firebase/auth';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        🍜 Free delivery on orders above ₹499 &nbsp;|&nbsp; Open daily 11 AM – 11 PM
      </div>

      {/* Navbar */}
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        style={{
          background: scrolled ? undefined : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img
              src="/logo.png"
              alt="Shiv Shankar Chinese Food"
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
            />
            <div>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text)',
                lineHeight: 1.1,
              }}>
                Shiv Shankar
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase' }}>
                Chinese Foods
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  letterSpacing: 0.5,
                  position: 'relative',
                  paddingBottom: 4,
                  transition: 'color 0.2s',
                })}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          background: 'var(--accent)',
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Cart */}
            <button
              onClick={openDrawer}
              style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 6 }}
              aria-label="Open cart"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "'Cinzel', serif",
                  }}
                  aria-label="User menu"
                >
                  {user.displayName ? user.displayName[0].toUpperCase() : <User size={16} />}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        position: 'absolute',
                        top: 44,
                        right: 0,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        minWidth: 180,
                        zIndex: 100,
                        overflow: 'hidden',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                      }}
                    >
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.displayName || 'User'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', color: 'var(--text)', textDecoration: 'none', fontSize: 13, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary hide-mobile" style={{ padding: '8px 18px', fontSize: 13 }}>
                Login
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              className="show-mobile-only"
              onClick={() => setMobileOpen(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'rgba(13,13,13,0.98)',
                borderTop: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    style={({ isActive }) => ({
                      textDecoration: 'none',
                      padding: '12px 0',
                      fontSize: 16,
                      fontWeight: 600,
                      color: isActive ? 'var(--accent)' : 'var(--text)',
                      borderBottom: '1px solid var(--border)',
                    })}
                  >
                    {link.label}
                  </NavLink>
                ))}
                {!user ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary"
                    style={{ marginTop: 12, justifyContent: 'center' }}
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      style={{ textDecoration: 'none', padding: '12px 0', fontSize: 16, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '12px 0', fontSize: 16, textAlign: 'left' }}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

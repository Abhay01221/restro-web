import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
);

export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>🐉</span>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                  Shiv Shankar
                </div>
                <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase' }}>
                  Chinese Food
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>
              Authentic flavors. Royal experience. Hinjawadi's finest Chinese restaurant since 2015.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: <InstagramIcon />, href: 'https://instagram.com', label: 'Instagram' },
                { icon: <FacebookIcon />, href: 'https://facebook.com', label: 'Facebook' },
                { icon: <TwitterIcon />, href: 'https://twitter.com', label: 'Twitter' },
                { icon: <YoutubeIcon />, href: 'https://youtube.com', label: 'YouTube' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--accent)', marginBottom: 16, letterSpacing: 1 }}>
              QUICK LINKS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/menu', label: 'Menu' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
                { to: '/dashboard', label: 'My Orders' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  → {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Menu Categories */}
          <div>
            <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--accent)', marginBottom: 16, letterSpacing: 1 }}>
              MENU
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Soups', 'Starters', 'Main Course', 'Noodles & Rice', 'Desserts', 'Beverages'].map(cat => (
                <Link
                  key={cat}
                  to="/menu"
                  style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  → {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--accent)', marginBottom: 16, letterSpacing: 1 }}>
              CONTACT
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <MapPin size={14} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Hinjawadi Chowk, Wakad Road,<br />Hinjawadi, Pune – 411057
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={14} color="var(--primary)" />
                <a href="tel:+919876543210" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
                  +91 98765 43210
                </a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={14} color="var(--primary)" />
                <a href="mailto:contact@shivshankarfood.com" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
                  contact@shivshankarfood.com
                </a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Clock size={14} color="var(--primary)" />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mon–Sun: 11:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '1.5rem 0' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            © 2024 Shiv Shankar Chinese Food. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Made with ❤️ in Pune
          </p>
        </div>
      </div>
    </footer>
  );
}

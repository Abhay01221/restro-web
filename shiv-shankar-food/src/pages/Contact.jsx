import { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendContactForm } from '../utils/api';

const SUBJECTS = [
  'General Inquiry',
  'Order Issue',
  'Feedback',
  'Catering / Bulk Order',
  'Partnership',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields.');
    setLoading(true);
    try {
      await sendContactForm(form);
      setSent(true);
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch {
      toast.error('Failed to send message. Please try calling us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Shiv Shankar Chinese Food</title>
        <meta name="description" content="Contact Shiv Shankar Chinese Food. Visit us at Hinjawadi Chowk, Wakad Road, Pune or call +91 98765 43210." />
      </Helmet>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)', padding: '3rem 1.5rem 2rem', textAlign: 'center' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title" style={{ marginBottom: 8 }}>
          Contact Us
        </motion.h1>
        <div className="gold-divider" />
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>We'd love to hear from you</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem' }}
          >
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: 'var(--text)', marginBottom: '1.5rem' }}>Send a Message</h2>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '2rem 0' }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: '#22C55E', marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>We'll reply within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-primary" style={{ marginTop: 16 }}>Send Another</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Name <span style={{ color: 'var(--primary)' }}>*</span></label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-dark" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Email <span style={{ color: 'var(--primary)' }}>*</span></label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="input-dark" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-dark" style={{ cursor: 'pointer' }}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Message <span style={{ color: 'var(--primary)' }}>*</span></label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="How can we help you?"
                    className="input-dark"
                    rows={5}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                  <Send size={16} />
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {[
              {
                icon: <MapPin size={22} color="var(--primary)" />,
                title: 'Visit Us',
                lines: ['Hinjawadi Chowk, Wakad Road,', 'Hinjawadi, Pune – 411057'],
              },
              {
                icon: <Phone size={22} color="var(--primary)" />,
                title: 'Call Us',
                lines: ['+91 98765 43210'],
                href: 'tel:+919876543210',
              },
              {
                icon: <Mail size={22} color="var(--primary)" />,
                title: 'Email Us',
                lines: ['contact@shivshankarfood.com'],
                href: 'mailto:contact@shivshankarfood.com',
              },
              {
                icon: <Clock size={22} color="var(--primary)" />,
                title: 'Opening Hours',
                lines: ['Monday – Sunday', '11:00 AM – 11:00 PM'],
              },
            ].map((info, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {info.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{info.title}</p>
                  {info.lines.map((line, j) => (
                    info.href && j === 0 ? (
                      <a key={j} href={info.href} style={{ display: 'block', fontSize: 15, color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={j} style={{ fontSize: j === 0 ? 15 : 13, color: j === 0 ? 'var(--text)' : 'var(--text-muted)', fontWeight: j === 0 ? 500 : 400 }}>{line}</p>
                    )
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp */}
            <a
              href="https://wa.me/919876543210?text=Hi! I'd like to know more about Shiv Shankar Chinese Food."
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 12, textDecoration: 'none', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: 28 }}>💬</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#25D366' }}>Chat on WhatsApp</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quick response guaranteed</p>
              </div>
            </a>
          </motion.div>
        </div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '3rem', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 400 }}
        >
          <iframe
            title="Shiv Shankar Chinese Food Map"
            src="https://maps.google.com/maps?q=Hinjawadi+Chowk+Wakad+Road+Hinjawadi+Pune&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
          />
        </motion.div>
      </div>
    </>
  );
}

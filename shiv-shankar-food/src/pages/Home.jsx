import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowRight, Truck, ChefHat, Star, Leaf, Phone, Mail, Clock, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import FoodCard from '../components/FoodCard';
import TestimonialCarousel from '../components/TestimonialCarousel';
import GalleryGrid from '../components/GalleryGrid';
import SkeletonCard from '../components/SkeletonCard';
import { featuredItems, menuCategories } from '../data/menuData';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/menu?category=${catId}`);
  };

  return (
    <>
      <Helmet>
        <title>Shiv Shankar Chinese Food | Order Online | Hinjawadi, Pune</title>
        <meta name="description" content="Authentic Chinese food at Hinjawadi Chowk, Wakad Road, Pune. Order online for delivery or dine-in. Schezwan, Manchurian, Hakka Noodles and more." />
      </Helmet>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1600&q=80"
          alt="Shiv Shankar Chinese Food"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="hero-overlay" style={{ position: 'absolute', inset: 0 }} />

        <div style={{
          position: 'relative', zIndex: 1,
          height: '100%', display: 'flex', alignItems: 'center',
          maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem',
        }}>
          <div style={{ maxWidth: 600 }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.4)',
                borderRadius: 50, padding: '6px 16px', marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
                🏮 Hinjawadi's Finest
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                marginBottom: 16,
              }}
            >
              <span className="gold-shimmer">Shiv Shankar</span>
              <br />
              <span style={{ color: 'var(--text)' }}>Chinese Food</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'var(--text-muted)',
                marginBottom: 32,
                fontStyle: 'italic',
              }}
            >
              Authentic Flavors. Royal Experience. Hinjawadi's Finest.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <Link to="/menu" className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
                Order Now <ArrowRight size={16} />
              </Link>
              <Link to="/menu" className="btn-gold" style={{ fontSize: 15, padding: '12px 28px' }}>
                View Menu
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="bounce-anim" style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)', zIndex: 1,
        }}>
          <ChevronDown size={28} />
        </div>
      </section>

      {/* FEATURED DISHES */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">Chef's Recommendations</h2>
          <div className="gold-divider" />
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
            Handpicked by our head chef — the dishes that define Shiv Shankar
          </p>
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {featuredItems.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/menu" className="btn-gold">
            View Full Menu <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CATEGORIES QUICK NAV */}
      <section style={{ padding: '2rem 1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="scroll-x" style={{ display: 'flex', gap: 12, paddingBottom: 4 }}>
            {menuCategories.filter(c => c.id !== 'all').map(cat => (
              <button
                key={cat.id}
                className="category-pill"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">Why Choose Us</h2>
          <div className="gold-divider" />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🍳', title: 'Fresh Ingredients', desc: 'We source the freshest vegetables, meats, and spices daily from local markets.' },
            { icon: '🚀', title: 'Fast Delivery', desc: 'Hot food delivered to your door in 30–45 minutes within a 5 km radius.' },
            { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Our chefs bring decades of authentic Chinese culinary expertise to every dish.' },
            { icon: '⭐', title: '500+ Happy Customers', desc: 'Trusted by hundreds of families and corporates in Hinjawadi every month.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--accent)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT PREVIEW */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <motion.div {...fadeUp}>
            <span style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>Our Story</span>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--text)', margin: '12px 0 20px' }}>
              A Legacy of Authentic Flavors
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
              Founded in 2015 in the heart of Hinjawadi's tech hub, Shiv Shankar Chinese Food was born from a passion for bringing authentic Chinese culinary traditions to Pune. We believe great food tells a story.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 24, fontSize: 15 }}>
              Every dish is crafted using traditional recipes passed down through generations, combined with the freshest locally sourced ingredients. From our fiery Schezwan specialties to delicate dim sums, we prepare every plate with care and pride.
            </p>
            <Link to="/about" className="btn-primary">
              Learn More <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}
          >
            <img
              src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=80"
              alt="Our restaurant"
              style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 20, left: 20,
              background: 'rgba(13,13,13,0.9)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 16px',
            }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: 'var(--accent)' }}>Est. 2015</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hinjawadi, Pune</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="gold-divider" />
        </motion.div>
        <TestimonialCarousel />
      </section>

      {/* GALLERY */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Food Gallery</h2>
            <div className="gold-divider" />
          </motion.div>
          <GalleryGrid />
        </div>
      </section>

      {/* LOCATION & HOURS */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">Find Us</h2>
          <div className="gold-divider" />
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Map */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', height: 350 }}>
            <iframe
              title="Shiv Shankar Chinese Food Location"
              src="https://maps.google.com/maps?q=Hinjawadi+Chowk+Wakad+Road+Pune&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { icon: <MapPin size={20} color="var(--primary)" />, title: 'Address', content: 'Hinjawadi Chowk, Wakad Road,\nHinjawadi, Pune – 411057' },
              { icon: <Phone size={20} color="var(--primary)" />, title: 'Phone', content: '+91 98765 43210', href: 'tel:+919876543210' },
              { icon: <Mail size={20} color="var(--primary)" />, title: 'Email', content: 'contact@shivshankarfood.com', href: 'mailto:contact@shivshankarfood.com' },
              { icon: <Clock size={20} color="var(--primary)" />, title: 'Hours', content: 'Mon–Sun: 11:00 AM – 11:00 PM' },
            ].map((info, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {info.icon}
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{info.title}</p>
                  {info.href ? (
                    <a href={info.href} style={{ fontSize: 15, color: 'var(--text)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p style={{ fontSize: 15, color: 'var(--text)', whiteSpace: 'pre-line' }}>{info.content}</p>
                  )}
                </div>
              </div>
            ))}

            <a
              href="https://wa.me/919876543210?text=Hi! I'd like to place an order."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#25D366', color: 'white',
                padding: '12px 20px', borderRadius: 10,
                textDecoration: 'none', fontWeight: 700, fontSize: 14,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: 20 }}>💬</span>
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

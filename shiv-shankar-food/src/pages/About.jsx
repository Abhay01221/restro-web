import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const timeline = [
  { year: '2015', event: 'Founded', desc: 'Shiv Shankar Chinese Food opens its doors at Hinjawadi Chowk.' },
  { year: '2016', event: '1,000 Orders', desc: 'Reached our first milestone of 1,000 happy orders.' },
  { year: '2018', event: 'Expanded Menu', desc: 'Introduced our signature Schezwan and Triple Noodles range.' },
  { year: '2020', event: 'Online Ordering', desc: 'Launched online ordering and delivery services.' },
  { year: '2022', event: '500+ Reviews', desc: 'Crossed 500 five-star reviews across platforms.' },
  { year: '2024', event: 'New Website', desc: 'Launched our new digital experience for seamless ordering.' },
];

const chefs = [
  { name: 'Chef Rajesh Kumar', specialty: 'Schezwan & Wok Specialties', exp: '15 years', emoji: '👨‍🍳' },
  { name: 'Chef Priya Nair', specialty: 'Dim Sum & Desserts', exp: '10 years', emoji: '👩‍🍳' },
  { name: 'Chef Amit Sharma', specialty: 'Soups & Broths', exp: '12 years', emoji: '👨‍🍳' },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About Us | Shiv Shankar Chinese Food</title>
        <meta name="description" content="Learn about Shiv Shankar Chinese Food — our story, our chefs, and our passion for authentic Chinese cuisine in Hinjawadi, Pune." />
      </Helmet>

      {/* Hero */}
      <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1400&q=80"
          alt="Our restaurant"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title"
            style={{ marginBottom: 8 }}
          >
            Our Story
          </motion.h1>
          <div className="gold-divider" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 500 }}
          >
            A decade of authentic flavors, crafted with passion
          </motion.p>
        </div>
      </div>

      {/* Story */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <motion.div {...fadeUp}>
            <span style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>Est. 2015</span>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--text)', margin: '12px 0 20px' }}>
              Born from a Passion for Authentic Chinese Cuisine
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
              Founded in 2015 in the heart of Hinjawadi's tech hub, Shiv Shankar Chinese Food was born from a deep passion for bringing authentic Chinese culinary traditions to Pune. What started as a small family kitchen has grown into one of the most beloved Chinese restaurants in the area.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>
              We believe that great food tells a story. Every dish we serve is crafted using traditional recipes passed down through generations, combined with the freshest locally sourced ingredients. From our fiery Schezwan specialties to delicate soups, we prepare every plate with care and pride.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 15 }}>
              Our mission is simple: to bring the authentic taste of China to your table, whether you dine with us or order from the comfort of your home.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=700&q=80"
              alt="Our food"
              style={{ width: '100%', borderRadius: 16, objectFit: 'cover', height: 380 }}
            />
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Our Values</h2>
            <div className="gold-divider" />
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🌿', title: 'Quality', desc: 'We never compromise on ingredient quality. Every item is sourced fresh daily from trusted local suppliers.' },
              { icon: '🏮', title: 'Tradition', desc: 'Our recipes honor centuries-old Chinese culinary traditions, adapted with a modern touch for Indian palates.' },
              { icon: '🤝', title: 'Community', desc: 'We are proud to be part of the Hinjawadi community, serving tech professionals and families alike.' },
            ].map((v, i) => (
              <motion.div
                key={i}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{v.icon}</div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--accent)', marginBottom: 10 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef Spotlight */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">Meet Our Chefs</h2>
          <div className="gold-divider" />
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {chefs.map((chef, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '2rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: 60, marginBottom: 12 }}>{chef.emoji}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: 'var(--text)', marginBottom: 6 }}>{chef.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>{chef.specialty}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{chef.exp} experience</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Our Journey</h2>
            <div className="gold-divider" />
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                className="timeline-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ position: 'relative' }}
              >
                {i < timeline.length - 1 && <div className="timeline-line" />}
                <div className="timeline-dot" style={{ marginTop: 4 }} />
                <div style={{ paddingLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--accent)', fontWeight: 700 }}>{item.year}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.event}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <motion.div {...fadeUp} style={{ marginBottom: '3rem' }}>
          <h2 className="section-title">Recognition & Awards</h2>
          <div className="gold-divider" />
        </motion.div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem' }}>
          {[
            { icon: '🏆', title: 'Best Chinese Restaurant', sub: 'Pune Food Awards 2022' },
            { icon: '⭐', title: '4.8/5 Rating', sub: 'Google Reviews 2024' },
            { icon: '🎖️', title: 'Top Delivery Partner', sub: 'Swiggy & Zomato 2023' },
            { icon: '🌟', title: 'Customer Choice Award', sub: 'Hinjawadi Business Awards 2023' },
          ].map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem 2rem', minWidth: 180 }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>{a.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{a.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

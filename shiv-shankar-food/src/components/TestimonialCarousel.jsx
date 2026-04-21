import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { id: 1, name: 'Priya Sharma', date: 'March 2024', rating: 5, text: 'Absolutely the best Chinese food in Hinjawadi! The Schezwan Fried Rice is to die for. Fast delivery and the food was piping hot. Will definitely order again!' },
  { id: 2, name: 'Rahul Mehta', date: 'February 2024', rating: 5, text: 'Crispy Chilli Paneer was perfectly cooked — crispy outside, soft inside. The portions are generous and the price is very reasonable. Highly recommend!' },
  { id: 3, name: 'Ananya Patel', date: 'March 2024', rating: 5, text: 'Ordered for our office team of 15 people. Everyone loved it! The Manchow Soup and Dragon Chicken were the stars. Great packaging too.' },
  { id: 4, name: 'Vikram Singh', date: 'January 2024', rating: 5, text: 'The dine-in experience is fantastic. Cozy ambiance, attentive staff, and the food quality is consistently excellent. My go-to restaurant in Pune.' },
  { id: 5, name: 'Sneha Kulkarni', date: 'March 2024', rating: 5, text: 'Triple Schezwan Noodles are a must-try! Spicy, flavorful, and absolutely delicious. The online ordering system is very smooth too.' },
  { id: 6, name: 'Arjun Nair', date: 'February 2024', rating: 4, text: 'Great food, great service. The Hot & Sour Soup is the best I have had in Pune. Delivery was on time and the packaging kept everything fresh.' },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % (testimonials.length - visibleCount + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [visibleCount]);

  const maxIndex = testimonials.length - visibleCount;
  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(maxIndex, c + 1));

  const visible = testimonials.slice(current, current + visibleCount);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleCount}, 1fr)`, gap: '1.5rem' }}>
        <AnimatePresence mode="popLayout">
          {visible.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="testimonial-card"
            >
              <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                {Array.from({ length: t.rating }, (_, i) => (
                  <span key={i} style={{ color: 'var(--accent)', fontSize: 16 }}>⭐</span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.date}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: '1.5rem' }}>
        <button
          onClick={prev}
          disabled={current === 0}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: current === 0 ? 'var(--surface)' : 'var(--primary)',
            border: '1px solid var(--border)',
            cursor: current === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', opacity: current === 0 ? 0.4 : 1,
          }}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          disabled={current >= maxIndex}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: current >= maxIndex ? 'var(--surface)' : 'var(--primary)',
            border: '1px solid var(--border)',
            cursor: current >= maxIndex ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', opacity: current >= maxIndex ? 0.4 : 1,
          }}
          aria-label="Next testimonial"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

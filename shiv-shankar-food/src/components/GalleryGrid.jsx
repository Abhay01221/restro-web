import { motion } from 'framer-motion';
import { galleryImages } from '../data/menuData';

export default function GalleryGrid() {
  return (
    <div className="masonry-grid">
      {galleryImages.map((img, i) => (
        <motion.div
          key={i}
          className="masonry-item gallery-item"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <img
            src={img.url}
            alt={img.name}
            loading="lazy"
            style={{ width: '100%', display: 'block', borderRadius: 8 }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80'; }}
          />
          <div className="overlay">
            <p style={{ color: 'white', fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, textAlign: 'center', padding: '0 1rem' }}>
              {img.name}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../store/cartStore';

const SpiceIndicator = ({ level }) => {
  if (level === 0) return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No spice</span>;
  return (
    <span style={{ fontSize: 12 }}>
      {Array.from({ length: 3 }, (_, i) => (
        <span key={i} style={{ opacity: i < level ? 1 : 0.25 }}>🌶️</span>
      ))}
    </span>
  );
};

export default function FoodCard({ item, index = 0 }) {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} added to cart ✓`, {
      style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid #2E2E2E' },
      iconTheme: { primary: '#22C55E', secondary: '#fff' },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="card-surface overflow-hidden relative red-glow-hover transition-all duration-300 hover:-translate-y-1 img-zoom"
      style={{ position: 'relative' }}
    >
      {item.isPopular && (
        <div className="popular-badge">⭐ Popular</div>
      )}

      {/* Image */}
      <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)'
        }} />
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
            {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
          <SpiceIndicator level={item.spiceLevel} />
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: 4,
        }}>
          {item.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2" style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: 12,
        }}>
          {item.description}
        </p>

        {/* Price + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--accent)',
          }}>
            ₹{item.price}
          </span>

          {qty === 0 ? (
            <button
              onClick={handleAdd}
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: 13, borderRadius: 8 }}
              aria-label={`Add ${item.name} to cart`}
            >
              <ShoppingCart size={14} />
              Add
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.id, qty - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>
                {qty}
              </span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item.id, qty + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

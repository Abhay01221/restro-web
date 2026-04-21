import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useCart } from '../store/cartStore';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, gst, platformFee, deliveryFee, grandTotal, discount, promoCode, applyPromo, removePromo, orderType } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setTimeout(() => {
      const result = applyPromo(promoInput.trim());
      if (result.success) {
        toast.success(result.message, { style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid #2E2E2E' } });
        setPromoInput('');
      } else {
        toast.error(result.message, { style: { background: '#1A1A1A', color: '#F5F0E8', border: '1px solid #2E2E2E' } });
      }
      setPromoLoading(false);
    }, 500);
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet><title>Cart | Shiv Shankar Chinese Food</title></Helmet>
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: 'var(--text)', marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Looks like you haven't added anything yet.</p>
            <Link to="/menu" className="btn-primary">Browse Menu <ArrowRight size={16} /></Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet><title>Cart | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Cinzel', serif", fontSize: 28, color: 'var(--text)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <ShoppingBag color="var(--accent)" size={28} />
          Your Cart
        </motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', gap: 14, padding: '1rem',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&q=80'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{item.name}</p>
                      <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`} style={{ fontSize: 10 }}>
                        {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                        <span style={{ fontSize: 14 }}>−</span>
                      </button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                        <span style={{ fontSize: 14 }}>+</span>
                      </button>
                    </div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                      ₹{(item.price * item.quantity).toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', position: 'sticky', top: 120 }}
          >
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)', marginBottom: '1.5rem' }}>Order Summary</h3>

            {/* Promo */}
            {promoCode ? (
              <div className="promo-applied" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><Tag size={12} style={{ marginRight: 6 }} />{promoCode} applied!</span>
                <button onClick={removePromo} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E', fontSize: 12, fontWeight: 700 }}>Remove</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  className="input-dark"
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !promoInput.trim()}
                  className="btn-primary"
                  style={{ padding: '10px 14px', fontSize: 13, flexShrink: 0 }}
                >
                  {promoLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}

            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Try: WELCOME10, SHIV20, FREESHIP
            </p>

            {/* Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Subtotal', value: `₹${subtotal.toFixed(0)}` },
                { label: 'GST (5%)', value: `₹${gst.toFixed(0)}` },
                { label: 'Platform Fee', value: `₹${platformFee.toFixed(0)}` },
                { label: 'Delivery', value: orderType !== 'delivery' ? 'N/A' : deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`, green: orderType === 'delivery' && deliveryFee === 0 },
                ...(discount > 0 ? [{ label: `Discount (${promoCode})`, value: `-₹${discount.toFixed(0)}`, green: true }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: row.green ? '#22C55E' : 'var(--text-muted)' }}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            {orderType === 'delivery' && subtotal > 0 && subtotal < 499 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
                Add ₹{(499 - subtotal).toFixed(0)} more for free delivery!
              </p>
            )}

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', fontSize: 15, padding: '14px' }}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}

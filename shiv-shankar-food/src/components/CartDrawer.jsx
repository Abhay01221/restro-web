import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/cartStore';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, subtotal, gst, platformFee, deliveryFee, grandTotal, itemCount, orderType } = useCart();

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeDrawer();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              maxWidth: '100vw',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShoppingBag size={20} color="var(--accent)" />
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)' }}>
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span style={{
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                  <p style={{ fontSize: 15 }}>Your cart is empty</p>
                  <button
                    onClick={() => { closeDrawer(); navigate('/menu'); }}
                    className="btn-primary"
                    style={{ marginTop: 16 }}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      gap: 12,
                      padding: '10px',
                      background: 'var(--surface-2)',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&q=80'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                            <span style={{ fontSize: 14, lineHeight: 1 }}>−</span>
                          </button>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', alignSelf: 'flex-start', padding: 4 }}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>GST (5%)</span><span>₹{gst.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>Platform Fee</span><span>₹{platformFee.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                    <span>Delivery</span>
                    <span style={{ color: orderType !== 'delivery' ? 'var(--text-muted)' : deliveryFee === 0 ? '#22C55E' : 'var(--text-muted)' }}>
                      {orderType !== 'delivery' ? 'N/A' : deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--accent)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                    <span>Total</span><span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleViewCart} className="btn-ghost" style={{ flex: 1, fontSize: 13 }}>
                    View Cart
                  </button>
                  <button onClick={handleCheckout} className="btn-primary" style={{ flex: 1, fontSize: 13, justifyContent: 'center' }}>
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

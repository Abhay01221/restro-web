import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Home, ShoppingBag, Clock } from 'lucide-react';
import { getOrderById } from '../firebase/firestore';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📋' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '✅' },
];

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const currentStatusIndex = order ? STATUS_STEPS.findIndex(s => s.key === order.status) : 0;

  return (
    <>
      <Helmet><title>Order Confirmed | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <CheckCircle size={80} color="#22C55E" style={{ margin: '0 auto' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text)', marginBottom: 8 }}>
            🎉 Order Placed Successfully!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: '0.5rem' }}>
            Your order has been confirmed and is being prepared.
          </p>
          {order && (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              A confirmation email has been sent to <strong style={{ color: 'var(--text)' }}>{order.customerEmail}</strong>
            </p>
          )}
        </motion.div>

        {/* Order ID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            margin: '2rem auto',
            padding: '1rem 2rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            display: 'inline-block',
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Order ID</p>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: 'var(--accent)', fontWeight: 700 }}>
            #{orderId || 'SSF-XXXXXXXXXX'}
          </p>
        </motion.div>

        {/* Estimated Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px',
            background: 'rgba(241,196,15,0.08)',
            border: '1px solid rgba(241,196,15,0.2)',
            borderRadius: 10,
            marginBottom: '2rem',
          }}
        >
          <Clock size={18} color="var(--accent)" />
          <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>
            Estimated Delivery: 30–45 minutes
          </span>
        </motion.div>

        {/* Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--text)', marginBottom: '1.5rem' }}>
            Order Status
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            {STATUS_STEPS.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    left: '50%',
                    width: '100%',
                    height: 2,
                    background: i < currentStatusIndex ? '#22C55E' : 'var(--border)',
                    zIndex: 0,
                  }} />
                )}
                <div style={{
                  width: 32, height: 32,
                  borderRadius: '50%',
                  background: i <= currentStatusIndex ? (i === currentStatusIndex ? 'var(--primary)' : '#22C55E') : 'var(--surface-2)',
                  border: `2px solid ${i <= currentStatusIndex ? (i === currentStatusIndex ? 'var(--primary)' : '#22C55E') : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, zIndex: 1, position: 'relative',
                  marginBottom: 8,
                }}>
                  {i < currentStatusIndex ? '✓' : s.icon}
                </div>
                <p style={{ fontSize: 11, color: i <= currentStatusIndex ? 'var(--text)' : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        {order && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}
          >
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--text)', marginBottom: '1rem' }}>Order Summary</h3>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
              <span>Total Paid</span>
              <span>₹{order.grandTotal?.toFixed(0)}</span>
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/dashboard" className="btn-primary" style={{ gap: 8 }}>
            <ShoppingBag size={16} /> My Orders
          </Link>
          <Link to="/menu" className="btn-gold">
            Continue Shopping
          </Link>
          <Link to="/" className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Home size={16} /> Go Home
          </Link>
        </motion.div>
      </div>
    </>
  );
}

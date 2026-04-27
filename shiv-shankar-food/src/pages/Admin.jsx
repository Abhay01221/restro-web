import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { acceptOrder, rejectOrder, completeOrder } from '../firebase/firestore';
import { sendOrderAcceptedEmail, sendOrderRejectedEmail } from '../utils/emailjs';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Package, ChevronDown, ChevronUp, X } from 'lucide-react';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: 'Pending',   color: '#EAB308', bg: 'rgba(234,179,8,0.15)',   border: 'rgba(234,179,8,0.3)'   },
  confirmed: { label: 'Confirmed', color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)'   },
  accepted:  { label: 'Accepted',  color: '#22C55E', bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.3)'   },
  rejected:  { label: 'Rejected',  color: '#EF4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)'   },
  completed: { label: 'Completed', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)'  },
  cancelled: { label: 'Cancelled', color: '#6B7280', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

const Spinner = () => (
  <span style={{
    width: 14, height: 14, flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
  }} />
);

const FILTERS = ['all', 'pending', 'confirmed', 'accepted', 'completed', 'rejected', 'cancelled'];

export default function Admin() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');
  const [expanded, setExpanded]         = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy]                 = useState(null); // firestoreId + action

  // ── Real-time listener ──────────────────────────────────────────────────────
  useEffect(() => {
    console.log('[ADMIN] Setting up real-time orders listener...');
    const unsub = onSnapshot(
      query(collection(db, 'orders')),
      (snap) => {
        const data = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        data.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        console.log('[ADMIN] Orders snapshot:', data.length);
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error('[ADMIN] Snapshot error:', err);
        toast.error('Failed to load orders: ' + err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const visible = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (o.orderId || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.customerEmail || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length,
    accepted:  orders.filter(o => o.status === 'accepted').length,
    completed: orders.filter(o => o.status === 'completed').length,
    rejected:  orders.filter(o => o.status === 'rejected').length,
    revenue:   orders
      .filter(o => o.status === 'completed')
      .reduce((s, o) => s + (Number(o.grandTotal) || Number(o.total) || 0), 0),
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // ── Accept ──────────────────────────────────────────────────────────────────
  const handleAccept = async (order) => {
    setBusy(order.firestoreId + '_accept');
    try {
      await acceptOrder(order.firestoreId);
      console.log('[ADMIN] Order accepted:', order.orderId);
      sendOrderAcceptedEmail({
        customerName: order.customerName, customerEmail: order.customerEmail, orderId: order.orderId,
      }).catch(e => console.warn('[ADMIN] Accept email failed:', e.message));
      toast.success(`Order ${order.orderId} accepted ✅`);
    } catch (err) {
      console.error('[ADMIN] Accept failed:', err);
      toast.error('Failed: ' + err.message);
    } finally { setBusy(null); }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusy(rejectTarget.firestoreId + '_reject');
    try {
      await rejectOrder(rejectTarget.firestoreId, rejectReason);
      console.log('[ADMIN] Order rejected:', rejectTarget.orderId);
      sendOrderRejectedEmail({
        customerName: rejectTarget.customerName, customerEmail: rejectTarget.customerEmail,
        orderId: rejectTarget.orderId, reason: rejectReason,
      }).catch(e => console.warn('[ADMIN] Reject email failed:', e.message));
      toast.success(`Order ${rejectTarget.orderId} rejected`);
      setRejectTarget(null); setRejectReason('');
    } catch (err) {
      console.error('[ADMIN] Reject failed:', err);
      toast.error('Failed: ' + err.message);
    } finally { setBusy(null); }
  };

  // ── Complete ────────────────────────────────────────────────────────────────
  const handleComplete = async (order) => {
    setBusy(order.firestoreId + '_complete');
    try {
      await completeOrder(order.firestoreId);
      console.log('[ADMIN] Order completed:', order.orderId);
      toast.success(`Order ${order.orderId} completed ✔`);
    } catch (err) {
      console.error('[ADMIN] Complete failed:', err);
      toast.error('Failed: ' + err.message);
    } finally { setBusy(null); }
  };

  return (
    <>
      <Helmet><title>Admin | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: 'var(--text)', marginBottom: 4 }}>
              🐉 Admin Dashboard
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Shiv Shankar Chinese Food — Order Management</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#22C55E' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            Live updates
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total',     value: stats.total,                    color: 'var(--accent)' },
            { label: 'Pending',   value: stats.pending,                  color: '#EAB308' },
            { label: 'Accepted',  value: stats.accepted,                 color: '#22C55E' },
            { label: 'Completed', value: stats.completed,                color: '#3B82F6' },
            { label: 'Rejected',  value: stats.rejected,                 color: '#EF4444' },
            { label: 'Revenue',   value: `₹${stats.revenue.toFixed(0)}`, color: 'var(--accent)' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Cinzel', serif" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1.5rem', alignItems: 'center' }}>
          <input
            type="text" placeholder="Search by Order ID, name, email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-dark"
            style={{ flex: '1 1 260px', borderRadius: 50, paddingLeft: 16, fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === f ? 'rgba(192,57,43,0.15)' : 'var(--surface)',
                color: filter === f ? 'var(--primary-light)' : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}>
                {f === 'all' ? `All (${orders.length})` : `${f} (${orders.filter(o => o.status === f).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            Loading orders...
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
            <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No orders found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map((order, idx) => {
              const isExpanded  = expanded === order.firestoreId;
              const canAccept   = ['pending', 'confirmed'].includes(order.status);
              const canReject   = ['pending', 'confirmed'].includes(order.status);
              const canComplete = order.status === 'accepted';
              const isUPI       = order.paymentMethod === 'UPI';
              const total       = Number(order.grandTotal) || Number(order.total) || 0;

              return (
                <motion.div key={order.firestoreId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>

                  {/* Main row */}
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    {/* Order ID + time */}
                    <div style={{ minWidth: 140 }}>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: 'var(--accent)', marginBottom: 2 }}>
                        #{order.orderId || order.firestoreId.slice(0, 8)}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
                    </div>
                    {/* Customer */}
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{order.customerName || '—'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.customerEmail || '—'}</p>
                    </div>
                    {/* Amount + type */}
                    <div style={{ minWidth: 80, textAlign: 'right' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>₹{total.toFixed(0)}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{order.orderType || '—'}</p>
                    </div>
                    {/* Payment method */}
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {order.paymentMethod || '—'}
                    </span>
                    {/* Status badge */}
                    <StatusBadge status={order.status} />
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 'auto' }}>
                      {canAccept && (
                        <button onClick={() => handleAccept(order)} disabled={!!busy}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                          {busy === order.firestoreId + '_accept' ? <Spinner /> : <CheckCircle size={13} />} Accept
                        </button>
                      )}
                      {canReject && (
                        <button onClick={() => { setRejectTarget(order); setRejectReason(''); }} disabled={!!busy}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                          <XCircle size={13} /> Reject
                        </button>
                      )}
                      {canComplete && (
                        <button onClick={() => handleComplete(order)} disabled={!!busy}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                          {busy === order.firestoreId + '_complete' ? <Spinner /> : <Package size={13} />} Complete
                        </button>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : order.firestoreId)}
                        style={{ padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', borderRadius: 8, cursor: 'pointer' }}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                          {/* Items */}
                          <div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Items</p>
                            {order.items?.map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                              </div>
                            ))}
                            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                              <span>Total</span><span>₹{total.toFixed(0)}</span>
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Delivery</p>
                            {order.deliveryAddress ? (
                              <>
                                <p style={{ fontSize: 13, color: 'var(--text)' }}>📍 {order.deliveryAddress.line1}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.deliveryAddress.city} – {order.deliveryAddress.pincode}</p>
                                {order.deliveryAddress.landmark && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Near: {order.deliveryAddress.landmark}</p>}
                              </>
                            ) : (
                              <p style={{ fontSize: 13, color: 'var(--text)', textTransform: 'capitalize' }}>
                                {order.orderType === 'dine-in' ? '🍽️ Dine-In' : '🛍️ Takeaway'}
                              </p>
                            )}
                            {order.specialInstructions && (
                              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>📝 {order.specialInstructions}</p>
                            )}
                          </div>

                          {/* Payment + Refund */}
                          <div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Payment</p>
                            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
                              💳 {order.paymentMethod} — <span style={{ color: '#22C55E' }}>{order.paymentStatus || 'completed'}</span>
                            </p>
                            {order.transactionId && (
                              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>TXN: {order.transactionId}</p>
                            )}
                            {['rejected', 'cancelled'].includes(order.status) && (
                              <div style={{ padding: '8px 12px', borderRadius: 8, background: isUPI ? 'rgba(241,196,15,0.08)' : 'rgba(59,130,246,0.08)', border: `1px solid ${isUPI ? 'rgba(241,196,15,0.25)' : 'rgba(59,130,246,0.25)'}` }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: isUPI ? 'var(--accent)' : '#3B82F6', marginBottom: 2 }}>
                                  {isUPI ? '⚠️ Manual Refund Required' : '🔄 Refund Initiated'}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                  {isUPI ? `Contact: ${order.customerPhone || order.customerEmail}` : 'PayPal refund will be processed.'}
                                </p>
                              </div>
                            )}
                            {order.adminNote && (
                              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 8 }}>📋 {order.adminNote}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject popup */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', maxWidth: 420, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)' }}>Reject Order</h3>
                <button onClick={() => setRejectTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Rejecting <strong style={{ color: 'var(--accent)' }}>#{rejectTarget.orderId}</strong> for {rejectTarget.customerName}.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Reason (optional)</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Item unavailable, restaurant closed..."
                  className="input-dark" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: '1.5rem',
                background: rejectTarget.paymentMethod === 'UPI' ? 'rgba(241,196,15,0.08)' : 'rgba(59,130,246,0.08)',
                border: `1px solid ${rejectTarget.paymentMethod === 'UPI' ? 'rgba(241,196,15,0.25)' : 'rgba(59,130,246,0.25)'}` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: rejectTarget.paymentMethod === 'UPI' ? 'var(--accent)' : '#3B82F6' }}>
                  {rejectTarget.paymentMethod === 'UPI'
                    ? '⚠️ Manual refund required — contact customer directly'
                    : '🔄 PayPal refund will be marked as initiated'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setRejectTarget(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleReject} disabled={!!busy}
                  style={{ flex: 1, padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {busy ? <Spinner /> : <><XCircle size={14} /> Confirm Reject</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

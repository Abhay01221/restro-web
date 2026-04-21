import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { User, ShoppingBag, MapPin, Settings, LogOut, Plus, Trash2, Edit2, Check, X, Camera, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useCart } from '../store/cartStore';
import { logoutUser } from '../firebase/auth';
import { updateProfile, reload } from 'firebase/auth';
import { auth } from '../firebase/config';
import { updateUserProfile, addAddress, removeAddress, getUserProfile, getUserOrders, cancelOrder } from '../firebase/firestore';
import { formatOrderDate } from '../utils/generateOrderId';
import { sendOrderCancellationEmail } from '../utils/emailjs';

const STATUS_STYLES = {
  placed:             'status-placed',
  confirmed:          'status-placed',
  preparing:          'status-preparing',
  'out-for-delivery': 'status-out-for-delivery',
  delivered:          'status-delivered',
  cancelled:          'status-cancelled',
};

const STATUS_LABELS = {
  placed:             'Placed',
  confirmed:          'Confirmed',
  preparing:          'Preparing',
  'out-for-delivery': 'Out for Delivery',
  delivered:          'Delivered',
  cancelled:          'Cancelled',
};

const CANCELLABLE = ['placed', 'confirmed', 'pending'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userProfile, setUserProfile, setUser } = useAuthStore();
  const { addItem } = useCart();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null); // orderId being confirmed
  const [cancellingId, setCancellingId] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || user?.displayName || '',
    phone: userProfile?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', city: 'Pune', pincode: '', landmark: '' });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Keep form in sync when userProfile loads
  useEffect(() => {
    setProfileForm({
      name: userProfile?.name || user?.displayName || '',
      phone: userProfile?.phone || '',
    });
  }, [userProfile, user]);

  useEffect(() => {
    if (tab === 'orders' && user) {
      setOrdersLoading(true);
      // Fetch directly from Firestore — works without backend running
      getUserOrders(user.uid)
        .then(data => setOrders(data))
        .catch(err => {
          console.error('Orders fetch error:', err);
          toast.error('Failed to load orders');
        })
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, user]);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out');
    navigate('/');
  };

  // ── Save profile (name + phone) ──────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingProfile(true);
    try {
      // 1. Update Firebase Auth displayName
      await updateProfile(auth.currentUser, { displayName: profileForm.name.trim() });

      // 2. Update Firestore
      await updateUserProfile(user.uid, {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
      });

      // 3. Reload auth user to get fresh data
      await reload(auth.currentUser);

      // 4. Re-fetch Firestore profile and update store
      const fresh = await getUserProfile(user.uid);
      setUserProfile(fresh);
      setUser(auth.currentUser);

      setEditProfile(false);
      toast.success('Profile updated! ✓');
    } catch (err) {
      console.error('[Dashboard] Save profile error:', err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Profile photo upload ─────────────────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Convert to base64 data URL (no Firebase Storage needed)
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        try {
          await updateProfile(auth.currentUser, { photoURL: dataUrl });
          await reload(auth.currentUser);
          setUser(auth.currentUser);
          toast.success('Profile photo updated! ✓');
        } catch (err) {
          console.error('[Dashboard] Photo update error:', err);
          toast.error('Failed to update photo');
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('[Dashboard] Photo upload error:', err);
      toast.error('Failed to upload photo');
      setUploadingPhoto(false);
    }
  };

  // ── Add address ──────────────────────────────────────────────────────────────
  const handleAddAddress = async () => {
    if (!newAddress.label.trim() || !newAddress.line1.trim() || !newAddress.pincode.trim()) {
      toast.error('Please fill Label, Address Line, and Pincode');
      return;
    }
    setSavingAddress(true);
    try {
      const addr = { ...newAddress, id: Date.now().toString() };
      await addAddress(user.uid, addr);

      // Re-fetch to get server-confirmed data
      const fresh = await getUserProfile(user.uid);
      setUserProfile(fresh);

      setNewAddress({ label: '', line1: '', city: 'Pune', pincode: '', landmark: '' });
      setShowAddAddress(false);
      toast.success('Address saved! ✓');
    } catch (err) {
      console.error('[Dashboard] Add address error:', err);
      toast.error(`Failed to save address: ${err.message}`);
    } finally {
      setSavingAddress(false);
    }
  };

  // ── Remove address ───────────────────────────────────────────────────────────
  const handleRemoveAddress = async (addr) => {
    try {
      await removeAddress(user.uid, addr);
      const fresh = await getUserProfile(user.uid);
      setUserProfile(fresh);
      toast.success('Address removed');
    } catch (err) {
      console.error('[Dashboard] Remove address error:', err);
      toast.error(`Failed to remove: ${err.message}`);
    }
  };

  const handleReorder = (order) => {
    order.items?.forEach(item => addItem({
      ...item,
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80',
    }));
    toast.success('Items added to cart!');
    navigate('/cart');
  };

  // ── Cancel order ─────────────────────────────────────────────────────────────
  const handleCancelOrder = async (order) => {
    setCancellingId(order.orderId);
    try {
      // Use firestoreId (the actual Firestore document ID) for the update
      const docId = order.firestoreId || order.id || order.orderId;
      await cancelOrder(docId);

      // Update local state immediately
      setOrders(prev =>
        prev.map(o => o.orderId === order.orderId ? { ...o, status: 'cancelled' } : o)
      );

      // Send cancellation email (non-blocking)
      sendOrderCancellationEmail({
        customerName:  order.customerName,
        customerEmail: order.customerEmail,
        orderId:       order.orderId,
      }).catch(err => console.error('[EmailJS] Cancellation email failed:', err));

      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('[Dashboard] Cancel order error:', err);
      toast.error(`Failed to cancel: ${err.message}`);
    } finally {
      setCancellingId(null);
      setCancelConfirm(null);
    }
  };

  const navItems = [
    { id: 'profile',   label: 'Profile',          icon: <User size={16} /> },
    { id: 'orders',    label: 'My Orders',         icon: <ShoppingBag size={16} /> },
    { id: 'addresses', label: 'Saved Addresses',   icon: <MapPin size={16} /> },
    { id: 'settings',  label: 'Settings',          icon: <Settings size={16} /> },
  ];

  const photoUrl = user?.photoURL;
  const initials = (user?.displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <>
      <Helmet><title>Dashboard | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: 'var(--text)', marginBottom: '2rem' }}
        >
          My Account
        </motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', position: 'sticky', top: 120 }}>
            {/* Avatar with photo upload */}
            <div style={{ textAlign: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
              <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 8px' }}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(192,57,43,0.15)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: 22, color: 'var(--accent)', fontWeight: 700 }}>
                    {initials}
                  </div>
                )}
                {/* Camera button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  aria-label="Upload profile photo"
                  title="Change photo"
                >
                  {uploadingPhoto ? (
                    <span style={{ width: 10, height: 10, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  ) : (
                    <Camera size={12} color="white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{user?.displayName || 'User'}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</p>
              {user?.emailVerified && (
                <span style={{ fontSize: 10, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '2px 8px', display: 'inline-block', marginTop: 4 }}>
                  ✓ Verified
                </span>
              )}
            </div>

            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`dash-nav-item ${tab === item.id ? 'active' : ''}`} style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>
                {item.icon} {item.label}
              </button>
            ))}

            <button onClick={handleLogout} className="dash-nav-item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: '#EF4444', marginTop: 8 }}>
              <LogOut size={16} /> Logout
            </button>
          </div>

          {/* Content */}
          <div>
            {/* PROFILE */}
            {tab === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)' }}>Profile</h2>
                  {!editProfile && (
                    <button onClick={() => setEditProfile(true)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>

                {editProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Full Name</label>
                      <input
                        value={profileForm.name}
                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                        className="input-dark"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Phone Number</label>
                      <input
                        value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 XXXXX XXXXX"
                        className="input-dark"
                        type="tel"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {savingProfile ? (
                          <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Saving…</>
                        ) : (
                          <><Check size={14} /> Save Changes</>
                        )}
                      </button>
                      <button onClick={() => { setEditProfile(false); setProfileForm({ name: userProfile?.name || user?.displayName || '', phone: userProfile?.phone || '' }); }} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Full Name', value: userProfile?.name || user?.displayName || '—' },
                      { label: 'Email', value: user?.email || '—' },
                      { label: 'Email Verified', value: user?.emailVerified ? '✓ Verified' : '✗ Not verified', color: user?.emailVerified ? '#22C55E' : '#EF4444' },
                      { label: 'Phone', value: userProfile?.phone || 'Not set' },
                      { label: 'Member Since', value: userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                    ].map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, padding: '12px', background: 'var(--surface-2)', borderRadius: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 120 }}>{f.label}</span>
                        <span style={{ fontSize: 14, color: f.color || 'var(--text)', fontWeight: 500 }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)', marginBottom: '1.5rem' }}>My Orders</h2>

                {/* Cancel confirmation popup */}
                <AnimatePresence>
                  {cancelConfirm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', maxWidth: 380, width: '100%', textAlign: 'center' }}
                      >
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <AlertTriangle size={24} color="#EF4444" />
                        </div>
                        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Cancel Order?</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                          Are you sure you want to cancel order <strong style={{ color: 'var(--accent)' }}>#{cancelConfirm.orderId}</strong>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={() => setCancelConfirm(null)}
                            className="btn-ghost"
                            style={{ flex: 1 }}
                          >
                            Keep Order
                          </button>
                          <button
                            onClick={() => handleCancelOrder(cancelConfirm)}
                            disabled={cancellingId === cancelConfirm.orderId}
                            style={{ flex: 1, padding: '10px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            {cancellingId === cancelConfirm.orderId ? (
                              <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Cancelling…</>
                            ) : 'Yes, Cancel'}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    Loading orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <p>No orders yet. Start ordering!</p>
                    <button onClick={() => navigate('/menu')} className="btn-primary" style={{ marginTop: 16 }}>Browse Menu</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {orders.map(order => {
                      const isCancelled = order.status === 'cancelled';
                      const canCancel   = CANCELLABLE.includes(order.status);
                      return (
                        <div key={order.orderId || order._id} style={{ background: 'var(--surface)', border: `1px solid ${isCancelled ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden' }}>
                          <div style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: 'var(--accent)', marginBottom: 2 }}>#{order.orderId}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {order.createdAt ? formatOrderDate(order.createdAt) : '—'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span
                                className={`veg-badge ${STATUS_STYLES[order.status] || 'status-placed'}`}
                                style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, ...(isCancelled ? { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' } : {}) }}
                              >
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                              <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>₹{order.grandTotal?.toFixed(0)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {!isCancelled && (
                                <button onClick={() => handleReorder(order)} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>Reorder</button>
                              )}
                              <button onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                                {expandedOrder === order.orderId ? 'Hide' : 'Details'}
                              </button>
                              {canCancel && (
                                <button
                                  onClick={() => setCancelConfirm(order)}
                                  disabled={cancellingId === order.orderId}
                                  style={{ fontSize: 12, padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                          {expandedOrder === order.orderId && (
                            <div style={{ padding: '0 1.25rem 1rem', borderTop: '1px solid var(--border)' }}>
                              <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {order.items?.map((item, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)' }}>
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                                  </div>
                                ))}
                                {order.deliveryAddress && (
                                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                                    📍 {order.deliveryAddress.line1}, {order.deliveryAddress.city}
                                  </p>
                                )}
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                  💳 {order.paymentMethod?.toUpperCase() || 'PayPal'}
                                </p>
                                {order.orderType && (
                                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    🍽️ {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* ADDRESSES */}
            {tab === 'addresses' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)' }}>Saved Addresses</h2>
                  <button onClick={() => setShowAddAddress(v => !v)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {showAddAddress && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: 15, color: 'var(--text)', marginBottom: '1rem' }}>New Address</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { key: 'label', label: 'Label (Home/Work)', placeholder: 'e.g. Home' },
                        { key: 'line1', label: 'Address Line', placeholder: 'House/Flat, Street, Area' },
                        { key: 'pincode', label: 'Pincode', placeholder: '411057' },
                        { key: 'landmark', label: 'Landmark (Optional)', placeholder: 'Near...' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</label>
                          <input value={newAddress[f.key]} onChange={e => setNewAddress(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.placeholder} className="input-dark" style={{ fontSize: 13 }} />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleAddAddress} disabled={savingAddress} className="btn-primary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {savingAddress ? (
                            <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Saving…</>
                          ) : 'Save Address'}
                        </button>
                        <button onClick={() => setShowAddAddress(false)} className="btn-ghost" style={{ fontSize: 13 }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                {(userProfile?.addresses || []).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                    <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p>No saved addresses yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {userProfile.addresses.map(addr => (
                      <div key={addr.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{addr.label}</p>
                          <p style={{ fontSize: 13, color: 'var(--text)' }}>{addr.line1}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{addr.city} – {addr.pincode}</p>
                          {addr.landmark && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Near: {addr.landmark}</p>}
                        </div>
                        <button onClick={() => handleRemoveAddress(addr)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }} aria-label="Remove address">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SETTINGS */}
            {tab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, color: 'var(--text)', marginBottom: '1.5rem' }}>Settings</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>Email Notifications</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Receive order updates via email</p>
                    </div>
                    <div style={{ width: 44, height: 24, borderRadius: 12, background: 'var(--primary)', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 2, top: 2, width: 20, height: 20, borderRadius: '50%', background: 'white' }} />
                    </div>
                  </div>
                  <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
                    <p style={{ fontSize: 14, color: '#EF4444', fontWeight: 600, marginBottom: 4 }}>Danger Zone</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>These actions are irreversible.</p>
                    <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

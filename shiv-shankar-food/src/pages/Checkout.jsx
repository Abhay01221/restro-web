import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { Check, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { saveOrder } from '../firebase/firestore';
import { generateOrderId } from '../utils/generateOrderId';
import { sendOrderConfirmationEmail } from '../utils/emailjs';

const STEPS = ['Delivery Details', 'Review Order', 'Payment'];

const ORDER_TYPES = [
  { id: 'delivery', label: '🚚 Delivery' },
  { id: 'dine-in', label: '🍽️ Dine-In' },
  { id: 'takeaway', label: '🛍️ Takeaway' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, gst, platformFee, deliveryFee, grandTotal, discount, promoCode, clearCart, orderType, setOrderType } = useCart();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  // orderType is now synced with the cart store so fees update everywhere
  const handleOrderTypeChange = (type) => {
    setOrderType(type);
  };
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Pune',
    pincode: '',
    landmark: '',
    instructions: '',
  });
  const [errors, setErrors] = useState({});
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = '10-digit phone number required';
    if (orderType === 'delivery') {
      if (!form.address.trim()) e.address = 'Address is required';
      if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validate()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = async (details) => {
    setPaymentProcessing(true);
    const orderId = generateOrderId();

    // Debug: verify user is authenticated
    console.log('[Checkout] USER:', user);
    console.log('[Checkout] PayPal details:', details);

    const orderData = {
      orderId,
      userId:        user?.uid   || 'guest',
      customerName:  form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      items: items.map(i => ({
        id:       i.id,
        name:     i.name,
        price:    i.price,
        quantity: i.quantity,
        isVeg:    i.isVeg,
      })),
      subtotal,
      gst,
      platformFee:  platformFee || 0,
      deliveryFee,
      discount:     discount || 0,
      grandTotal,
      promoCode:    promoCode || null,
      deliveryAddress: orderType === 'delivery' ? {
        line1:    form.address,
        city:     form.city,
        pincode:  form.pincode,
        landmark: form.landmark,
      } : null,
      orderType,
      specialInstructions: form.instructions || '',
      paymentMethod:  'PayPal',
      paymentStatus:  'completed',
      paypalOrderId:  details.id,
      status:         'confirmed',
    };

    console.log('[Checkout] ORDER DATA to save:', orderData);

    try {
      // Save to Firestore (primary — always runs)
      await saveOrder(orderData);

      // Send confirmation email (non-blocking)
      sendOrderConfirmationEmail(orderData).catch(err =>
        console.error('[EmailJS] Confirmation email failed:', err)
      );

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success?id=${orderId}`);
    } catch (err) {
      console.error('[Checkout] Firestore save error:', err);
      toast.error(`Order save failed: ${err.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const inputField = (name, label, type = 'text', placeholder = '', required = true) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: 'var(--primary)' }}>*</span>}
      </label>
      <input type={type} value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} placeholder={placeholder} className="input-dark" />
      {errors[name] && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors[name]}</p>}
    </div>
  );

  return (
    <>
      <Helmet><title>Checkout | Shiv Shankar Chinese Food</title></Helmet>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="checkout-step">
                <div className={`step-circle ${i < step ? 'step-done' : i === step ? 'step-active' : 'step-inactive'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 13, fontWeight: i === step ? 700 : 400, color: i === step ? 'var(--accent)' : i < step ? '#22C55E' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: i < step ? '#22C55E' : 'var(--border)', margin: '0 12px' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div>
            {/* Step 1 — Delivery Details */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: 'var(--text)', marginBottom: '1.5rem' }}>Delivery Details</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Order Type</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {ORDER_TYPES.map(t => (
                      <button key={t.id} onClick={() => handleOrderTypeChange(t.id)} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `2px solid ${orderType === t.id ? 'var(--primary)' : 'var(--border)'}`, background: orderType === t.id ? 'rgba(192,57,43,0.1)' : 'var(--surface-2)', color: orderType === t.id ? 'var(--primary-light)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {inputField('name', 'Full Name', 'text', 'Your full name')}
                  {inputField('email', 'Email Address', 'email', 'your@email.com')}
                  {inputField('phone', 'Phone Number', 'tel', '10-digit mobile number')}
                  {orderType === 'delivery' && (
                    <>
                      {inputField('address', 'Delivery Address', 'text', 'House/Flat no., Street, Area')}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>City</label>
                          <input value={form.city} readOnly className="input-dark" style={{ opacity: 0.7 }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Pincode <span style={{ color: 'var(--primary)' }}>*</span></label>
                          <input type="text" value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} placeholder="411057" className="input-dark" />
                          {errors.pincode && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.pincode}</p>}
                        </div>
                      </div>
                      {inputField('landmark', 'Landmark (Optional)', 'text', 'Near landmark', false)}
                    </>
                  )}
                  <div>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Special Instructions</label>
                    <textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Any special requests or allergies..." className="input-dark" rows={3} style={{ resize: 'vertical' }} />
                  </div>
                </div>

                <button onClick={handleNext} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '14px' }}>
                  Continue to Review →
                </button>
              </motion.div>
            )}

            {/* Step 2 — Review Order */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: 'var(--text)', marginBottom: '1.5rem' }}>Review Order</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--surface-2)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&q=80'; }} />
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>x{item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {orderType === 'delivery' && (
                  <div style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: 8, marginBottom: '1rem' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📍 Delivery Address</p>
                    <p style={{ fontSize: 14, color: 'var(--text)' }}>{form.address}, {form.city} – {form.pincode}</p>
                    {form.landmark && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Near: {form.landmark}</p>}
                  </div>
                )}

                <div style={{ padding: '12px', background: 'rgba(241,196,15,0.05)', border: '1px solid rgba(241,196,15,0.2)', borderRadius: 8, marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: 13, color: 'var(--accent)' }}>⏱ Estimated Time: 30–45 minutes</p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(0)} className="btn-ghost" style={{ flex: 1 }}>← Back</button>
                  <button onClick={handleNext} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Proceed to Payment →</button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Payment */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: 'var(--text)', marginBottom: '0.5rem' }}>Secure Payment</h2>

                {/* Amount summary */}
                <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 16px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>GST (5%)</span><span>₹{gst.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Platform Fee</span><span>₹{platformFee.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span>Delivery</span>
                    <span style={{ color: deliveryFee === 0 ? '#22C55E' : 'inherit' }}>
                      {orderType !== 'delivery' ? 'N/A' : deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
                    <span>Total to Pay</span>
                    <span>₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                {paymentProcessing ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Processing your order…</p>
                  </div>
                ) : grandTotal <= 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10 }}>
                    <AlertCircle size={16} color="#EF4444" />
                    <p style={{ fontSize: 13, color: '#EF4444' }}>Cart total is ₹0. Please add items before paying.</p>
                  </div>
                ) : (
                  <PayPalSection
                    grandTotal={grandTotal}
                    onSuccess={handlePaymentSuccess}
                    orderContext={{ items, subtotal, gst, platformFee, deliveryFee, grandTotal, discount, promoCode, orderType, form, user, clearCart, navigate }}
                  />
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '1rem', padding: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8 }}>
                  <ShieldCheck size={16} color="#22C55E" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🔒 Secured by PayPal · 256-bit SSL Encrypted</span>
                </div>

                <button onClick={() => setStep(1)} className="btn-ghost" style={{ width: '100%', marginTop: '1rem' }}>← Back to Review</button>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', position: 'sticky', top: 120 }}>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: 'var(--text)', marginBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Subtotal', value: `₹${subtotal.toFixed(0)}` },
                { label: 'GST (5%)', value: `₹${gst.toFixed(0)}` },
                { label: 'Platform Fee', value: `₹${platformFee.toFixed(0)}` },
                { label: 'Delivery', value: orderType !== 'delivery' ? 'N/A' : deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`, green: deliveryFee === 0 && orderType === 'delivery' },
                ...(discount > 0 ? [{ label: 'Discount', value: `-₹${discount.toFixed(0)}`, green: true }] : []),
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: row.green ? '#22C55E' : 'var(--text-muted)' }}>
                  <span>{row.label}</span><span>{row.value}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--accent)' }}>
                <span>Total</span><span>₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '10px', background: 'var(--surface-2)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {items.length} item{items.length !== 1 ? 's' : ''} · {orderType}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PayPal Section ───────────────────────────────────────────────────────────
function PayPalSection({ grandTotal, onSuccess, orderContext }) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  if (!clientId || clientId === 'your_paypal_client_id') {
    return <UpiQrFallback grandTotal={grandTotal} orderContext={orderContext} />;
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
        Pay securely with PayPal
      </p>
      <PayPalScriptProvider options={{ 'client-id': clientId, currency: 'INR', intent: 'capture' }}>
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 }}
          disabled={grandTotal <= 0}
          forceReRender={[grandTotal]}
          createOrder={(_data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: grandTotal.toFixed(2), currency_code: 'INR' }, description: 'Shiv Shankar Chinese Food Order' }],
            })
          }
          onApprove={async (_data, actions) => {
            const details = await actions.order.capture();
            await onSuccess(details);
          }}
          onError={(err) => { console.error('[PayPal] Error:', err); toast.error('Payment failed. Please try again or use UPI.'); }}
          onCancel={() => toast('Payment cancelled.', { icon: 'ℹ️' })}
        />
      </PayPalScriptProvider>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '1rem 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or pay via UPI</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <UpiQrFallback grandTotal={grandTotal} compact orderContext={orderContext} />
      </div>
    </div>
  );
}

// ─── UPI QR Fallback ──────────────────────────────────────────────────────────
function UpiQrFallback({ grandTotal, compact = false, orderContext }) {
  const [confirming, setConfirming] = useState(false);

  const amount    = Math.round(Number(grandTotal)).toFixed(2);
  const upiId     = '7083885537-3@ybl';
  const payeeName = 'Abhay';
  const upiUrl    = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

  console.log('[UPI QR] grandTotal:', grandTotal, '→ amount sent:', amount, '→ URL:', upiUrl);

  // ── "I have completed payment" handler ──────────────────────────────────────
  const handleUpiConfirm = async () => {
    const { items, subtotal, gst, platformFee, deliveryFee, grandTotal: total,
            discount, promoCode, orderType, form, user, clearCart, navigate } = orderContext;

    if (!items || items.length === 0) {
      toast.error('Your cart is empty. Please add items first.');
      return;
    }

    setConfirming(true);
    const orderId = generateOrderId();

    // Debug: verify user and order data
    console.log('[UPI Confirm] USER:', user);

    const orderData = {
      orderId,
      userId:        user?.uid   || 'guest',
      customerName:  form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      items: items.map(i => ({
        id:       i.id,
        name:     i.name,
        price:    i.price,
        quantity: i.quantity,
        isVeg:    i.isVeg,
      })),
      subtotal,
      gst,
      platformFee:   platformFee || 0,
      deliveryFee,
      discount:      discount || 0,
      grandTotal:    total,
      promoCode:     promoCode || null,
      deliveryAddress: orderType === 'delivery' ? {
        line1:    form.address,
        city:     form.city,
        pincode:  form.pincode,
        landmark: form.landmark,
      } : null,
      orderType,
      specialInstructions: form.instructions || '',
      paymentMethod:  'UPI',
      paymentStatus:  'completed',
      status:         'confirmed',
    };

    console.log('[UPI Confirm] ORDER DATA:', orderData);

    try {
      // 1. Save to Firestore — AWAIT before anything else
      await saveOrder(orderData);

      // 2. Send confirmation email (non-blocking — never fails the order)
      sendOrderConfirmationEmail(orderData).catch(err =>
        console.error('[EmailJS] Order confirmation email failed:', err)
      );

      // 3. Clear cart and redirect AFTER save completes
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/order-success?id=${orderId}`);
    } catch (err) {
      console.error('[UPI Confirm] Firestore save error:', err);
      toast.error(`Failed to save order: ${err.message}`);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {!compact && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Scan the QR code with any UPI app (GPay, PhonePe, Paytm)
        </p>
      )}

      {/* QR code */}
      <div style={{ display: 'inline-block', padding: 12, background: 'white', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 12 }}>
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(upiUrl)}`}
          alt="UPI QR Code"
          width={compact ? 120 : 160}
          height={compact ? 120 : 160}
          style={{ display: 'block', borderRadius: 4 }}
        />
      </div>

      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
        ₹{Math.round(Number(grandTotal))}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        UPI ID: <strong style={{ color: 'var(--text)' }}>{upiId}</strong>
      </p>

      {/* Open UPI app deep link */}
      <a
        href={upiUrl}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#5F259F', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 16 }}
      >
        📱 Open UPI App
      </a>

      {/* Confirmation button — only shown in full (non-compact) mode */}
      {!compact && orderContext && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
            After completing payment in your UPI app, tap below to confirm your order.
          </p>
          <button
            onClick={handleUpiConfirm}
            disabled={confirming}
            style={{
              width: '100%',
              padding: '13px',
              background: confirming ? 'var(--surface-2)' : '#22C55E',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: confirming ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
          >
            {confirming ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Confirming order…
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                I have completed payment
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

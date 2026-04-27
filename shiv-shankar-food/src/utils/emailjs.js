import emailjs from '@emailjs/browser';

const SERVICE_ID        = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const CONTACT_TEMPLATE  = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const ORDER_TEMPLATE    = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID;
const CANCEL_TEMPLATE   = import.meta.env.VITE_EMAILJS_CANCEL_TEMPLATE_ID;
const PUBLIC_KEY        = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// ─── Guard: skip silently if EmailJS is not configured ────────────────────────
const isConfigured = () =>
  SERVICE_ID && !SERVICE_ID.startsWith('your_') &&
  PUBLIC_KEY && !PUBLIC_KEY.startsWith('your_');

// ─── Contact form email ───────────────────────────────────────────────────────
export const sendContactEmail = async (formData) => {
  if (!isConfigured()) {
    console.warn('[EmailJS] Not configured — skipping contact email');
    return;
  }
  return emailjs.send(
    SERVICE_ID,
    CONTACT_TEMPLATE,
    {
      from_name:  formData.name,
      from_email: formData.email,
      subject:    formData.subject,
      message:    formData.message,
    },
    PUBLIC_KEY
  );
};

// ─── Order confirmation email ─────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (orderData) => {
  if (!isConfigured() || !ORDER_TEMPLATE || ORDER_TEMPLATE.startsWith('your_')) {
    console.warn('[EmailJS] Order template not configured — skipping confirmation email');
    return;
  }

  const itemsList = orderData.items
    .map(item => `${item.name} x${item.quantity} — ₹${(item.price * item.quantity).toFixed(0)}`)
    .join('\n');

  const deliveryAddress = orderData.deliveryAddress
    ? `${orderData.deliveryAddress.line1}, ${orderData.deliveryAddress.city} – ${orderData.deliveryAddress.pincode}`
    : orderData.orderType === 'dine-in' ? 'Dine-In at Restaurant' : 'Takeaway';

  return emailjs.send(
    SERVICE_ID,
    ORDER_TEMPLATE,
    {
      // Customer
      name:             orderData.customerName,
      to_email:         orderData.customerEmail,
      // Order details
      order_id:         orderData.orderId,
      order_date:       new Date().toLocaleString('en-IN'),
      order_type:       orderData.orderType,
      delivery_address: deliveryAddress,
      items_list:       itemsList,
      // Bill
      subtotal:         Number(orderData.subtotal).toFixed(0),
      gst:              Number(orderData.gst).toFixed(0),
      platform_fee:     Number(orderData.platformFee || 0).toFixed(0),
      delivery_fee:     Number(orderData.deliveryFee).toFixed(0),
      discount:         Number(orderData.discount || 0).toFixed(0),
      total:            Math.round(Number(orderData.grandTotal)).toString(),
      estimated_time:   '30–45 minutes',
    },
    PUBLIC_KEY
  );
};

// ─── Order cancellation email ─────────────────────────────────────────────────
export const sendOrderCancellationEmail = async ({ customerName, customerEmail, orderId }) => {
  if (!isConfigured() || !CANCEL_TEMPLATE || CANCEL_TEMPLATE.startsWith('your_')) {
    console.warn('[EmailJS] Cancel template not configured — skipping cancellation email');
    return;
  }

  return emailjs.send(
    SERVICE_ID,
    CANCEL_TEMPLATE,
    {
      name:     customerName,
      to_email: customerEmail,
      order_id: orderId,
    },
    PUBLIC_KEY
  );
};

// ─── Order accepted email (admin action) ─────────────────────────────────────
export const sendOrderAcceptedEmail = async ({ customerName, customerEmail, orderId }) => {
  const ACCEPT_TEMPLATE = import.meta.env.VITE_EMAILJS_ACCEPT_TEMPLATE_ID;
  if (!isConfigured() || !ACCEPT_TEMPLATE || ACCEPT_TEMPLATE.startsWith('your_')) {
    console.warn('[EmailJS] Accept template not configured — skipping');
    return;
  }
  return emailjs.send(SERVICE_ID, ACCEPT_TEMPLATE, {
    name:     customerName,
    to_email: customerEmail,
    order_id: orderId,
  }, PUBLIC_KEY);
};

// ─── Order rejected email (admin action) ─────────────────────────────────────
export const sendOrderRejectedEmail = async ({ customerName, customerEmail, orderId, reason }) => {
  const REJECT_TEMPLATE = import.meta.env.VITE_EMAILJS_REJECT_TEMPLATE_ID;
  if (!isConfigured() || !REJECT_TEMPLATE || REJECT_TEMPLATE.startsWith('your_')) {
    console.warn('[EmailJS] Reject template not configured — skipping');
    return;
  }
  return emailjs.send(SERVICE_ID, REJECT_TEMPLATE, {
    name:     customerName,
    to_email: customerEmail,
    order_id: orderId,
    reason:   reason || 'No reason provided',
  }, PUBLIC_KEY);
};

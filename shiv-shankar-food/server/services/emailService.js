const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || user === 'your_gmail@gmail.com') {
    console.warn('[EMAIL] Gmail credentials not configured. Emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

/**
 * Send order confirmation email to customer.
 */
const sendOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();

  const itemsHtml = order.items
    .map(item => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#F5F0E8;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#A89F94;text-align:center;">×${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2E2E2E;color:#F1C40F;text-align:right;">₹${(item.price * item.quantity).toFixed(0)}</td>
      </tr>
    `).join('');

  const addressText = order.deliveryAddress
    ? `${order.deliveryAddress.line1}, ${order.deliveryAddress.city} – ${order.deliveryAddress.pincode}`
    : order.orderType === 'dine-in' ? 'Dine-In at Restaurant' : 'Takeaway';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Lato',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#1A1A1A;border:1px solid #2E2E2E;border-radius:12px;overflow:hidden;">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#C0392B,#8B0000);padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">🐉</div>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;color:#F1C40F;letter-spacing:2px;">SHIV SHANKAR</h1>
      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Chinese Food</p>
    </div>

    <!-- Success Banner -->
    <div style="background:rgba(34,197,94,0.1);border-bottom:1px solid rgba(34,197,94,0.2);padding:16px 24px;text-align:center;">
      <p style="margin:0;font-size:18px;color:#22C55E;font-weight:700;">✅ Order Confirmed!</p>
      <p style="margin:4px 0 0;font-size:13px;color:#A89F94;">Your order is being prepared with love 🍜</p>
    </div>

    <!-- Order ID -->
    <div style="padding:24px;border-bottom:1px solid #2E2E2E;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0 0 4px;font-size:11px;color:#A89F94;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#F1C40F;font-family:Georgia,serif;">#${order.orderId}</p>
          </td>
          <td style="text-align:right;">
            <p style="margin:0 0 4px;font-size:11px;color:#A89F94;text-transform:uppercase;letter-spacing:1px;">Date</p>
            <p style="margin:0;font-size:13px;color:#F5F0E8;">${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Customer Info -->
    <div style="padding:16px 24px;border-bottom:1px solid #2E2E2E;background:#242424;">
      <p style="margin:0 0 8px;font-size:11px;color:#A89F94;text-transform:uppercase;letter-spacing:1px;">Customer Details</p>
      <p style="margin:0 0 4px;font-size:14px;color:#F5F0E8;"><strong>${order.customerName}</strong></p>
      <p style="margin:0 0 4px;font-size:13px;color:#A89F94;">${order.customerEmail}</p>
      ${order.customerPhone ? `<p style="margin:0;font-size:13px;color:#A89F94;">${order.customerPhone}</p>` : ''}
    </div>

    <!-- Delivery Address -->
    <div style="padding:16px 24px;border-bottom:1px solid #2E2E2E;">
      <p style="margin:0 0 8px;font-size:11px;color:#A89F94;text-transform:uppercase;letter-spacing:1px;">
        ${order.orderType === 'delivery' ? '📍 Delivery Address' : order.orderType === 'dine-in' ? '🍽️ Order Type' : '🛍️ Order Type'}
      </p>
      <p style="margin:0;font-size:14px;color:#F5F0E8;">${addressText}</p>
    </div>

    <!-- Items -->
    <div style="padding:16px 24px;border-bottom:1px solid #2E2E2E;">
      <p style="margin:0 0 12px;font-size:11px;color:#A89F94;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#242424;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#A89F94;font-weight:600;text-transform:uppercase;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;color:#A89F94;font-weight:600;text-transform:uppercase;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#A89F94;font-weight:600;text-transform:uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>

    <!-- Bill Summary -->
    <div style="padding:16px 24px;border-bottom:1px solid #2E2E2E;background:#242424;">
      <p style="margin:0 0 12px;font-size:11px;color:#A89F94;text-transform:uppercase;letter-spacing:1px;">Bill Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${[
          ['Subtotal', `₹${order.subtotal.toFixed(0)}`],
          ['GST (5%)', `₹${order.gst.toFixed(0)}`],
          ['Delivery Fee', order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`],
          ...(order.discount > 0 ? [['Discount', `-₹${order.discount.toFixed(0)}`]] : []),
        ].map(([label, value]) => `
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#A89F94;">${label}</td>
            <td style="padding:4px 0;font-size:13px;color:#F5F0E8;text-align:right;">${value}</td>
          </tr>
        `).join('')}
        <tr style="border-top:1px solid #2E2E2E;">
          <td style="padding:10px 0 4px;font-size:16px;font-weight:700;color:#F5F0E8;">Total Paid</td>
          <td style="padding:10px 0 4px;font-size:18px;font-weight:700;color:#F1C40F;text-align:right;">₹${order.grandTotal.toFixed(0)}</td>
        </tr>
      </table>
    </div>

    <!-- Estimated Time -->
    <div style="padding:16px 24px;border-bottom:1px solid #2E2E2E;text-align:center;">
      <p style="margin:0;font-size:14px;color:#F1C40F;">⏱ Estimated Time: <strong>${order.estimatedTime || '30–45 minutes'}</strong></p>
    </div>

    <!-- Footer -->
    <div style="padding:24px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:#A89F94;">Thank you for choosing Shiv Shankar Chinese Food!</p>
      <p style="margin:0 0 4px;font-size:12px;color:#A89F94;">📞 +91 98765 43210 &nbsp;|&nbsp; 📧 contact@shivshankarfood.com</p>
      <p style="margin:0;font-size:12px;color:#A89F94;">📍 Hinjawadi Chowk, Wakad Road, Hinjawadi, Pune – 411057</p>
      <p style="margin:16px 0 0;font-size:11px;color:#4A4A4A;">Made with ❤️ in Pune</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `
ORDER CONFIRMED — Shiv Shankar Chinese Food
============================================
Order ID    : #${order.orderId}
Customer    : ${order.customerName}
Email       : ${order.customerEmail}
Address     : ${addressText}

ITEMS:
${order.items.map(i => `  ${i.name} x${i.quantity} — ₹${(i.price * i.quantity).toFixed(0)}`).join('\n')}

BILL:
  Subtotal    : ₹${order.subtotal.toFixed(0)}
  GST (5%)    : ₹${order.gst.toFixed(0)}
  Delivery    : ${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}
  ${order.discount > 0 ? `Discount    : -₹${order.discount.toFixed(0)}` : ''}
  TOTAL PAID  : ₹${order.grandTotal.toFixed(0)}

⏱ Estimated Time: ${order.estimatedTime || '30–45 minutes'}

Thank you for ordering from Shiv Shankar Chinese Food!
📞 +91 98765 43210 | 📍 Hinjawadi Chowk, Wakad Road, Pune
  `;

  if (!transporter) {
    console.log('[EMAIL PREVIEW - No SMTP configured]\n', textBody);
    return { success: true, preview: true };
  }

  const info = await transporter.sendMail({
    from: `"Shiv Shankar Chinese Food 🐉" <${process.env.GMAIL_USER}>`,
    to: order.customerEmail,
    subject: `✅ Order Confirmed – Shiv Shankar Chinese Food (#${order.orderId})`,
    text: textBody,
    html: htmlBody,
  });

  console.log(`[EMAIL] Sent to ${order.customerEmail}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
};

/**
 * Send contact form email to restaurant.
 */
const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A1A1A;color:#F5F0E8;padding:24px;border-radius:8px;">
      <h2 style="color:#F1C40F;">New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr style="border-color:#2E2E2E;">
      <p style="white-space:pre-wrap;">${message}</p>
    </div>
  `;

  if (!transporter) {
    console.log('[CONTACT EMAIL PREVIEW]', { name, email, subject, message });
    return { success: true, preview: true };
  }

  const info = await transporter.sendMail({
    from: `"Website Contact Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `[Contact Form] ${subject} — from ${name}`,
    html: htmlBody,
  });

  return { success: true, messageId: info.messageId };
};

module.exports = { sendOrderConfirmationEmail, sendContactEmail };

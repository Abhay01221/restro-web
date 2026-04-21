const Order = require('../models/Order');
const { sendOrderConfirmationEmail } = require('../services/emailService');

/**
 * POST /api/orders
 * Save a new order after successful PayPal payment.
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      orderId, userId, customerName, customerEmail, customerPhone,
      items, subtotal, gst, deliveryFee, discount, grandTotal,
      promoCode, deliveryAddress, orderType, specialInstructions,
      paymentMethod, paypalOrderId,
    } = req.body;

    // Prevent duplicate orders
    const existing = await Order.findOne({ orderId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Order already exists', order: existing });
    }

    const order = new Order({
      orderId,
      userId: userId || req.user?.uid || 'guest',
      customerName,
      customerEmail,
      customerPhone,
      items,
      subtotal,
      gst,
      deliveryFee,
      discount: discount || 0,
      grandTotal,
      promoCode: promoCode || null,
      deliveryAddress: deliveryAddress || null,
      orderType: orderType || 'delivery',
      specialInstructions: specialInstructions || '',
      paymentMethod: paymentMethod || 'paypal',
      paypalOrderId: paypalOrderId || null,
      status: 'placed',
    });

    await order.save();

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail(order).then(() => {
      Order.findByIdAndUpdate(order._id, { emailSent: true }).exec();
    }).catch(err => {
      console.error('[EMAIL] Failed to send confirmation:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        grandTotal: order.grandTotal,
        estimatedTime: order.estimatedTime,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/:userId
 * Fetch all orders for a user.
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Ensure user can only fetch their own orders
    if (req.user && req.user.uid !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/orders/detail/:orderId
 * Fetch a single order by orderId string.
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).select('-__v').lean();
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow owner to view
    if (req.user && req.user.uid !== order.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/orders/:orderId/status
 * Update order status (admin use).
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order: { orderId: order.orderId, status: order.status } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getUserOrders, getOrderById, updateOrderStatus };

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: true },
}, { _id: false });

const deliveryAddressSchema = new mongoose.Schema({
  line1: { type: String },
  city: { type: String, default: 'Pune' },
  pincode: { type: String },
  landmark: { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  customerName: { type: String, required: true, trim: true },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  customerPhone: { type: String, trim: true },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'Order must have at least one item',
    },
  },
  subtotal: { type: Number, required: true, min: 0 },
  gst: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  promoCode: { type: String, default: null },
  deliveryAddress: { type: deliveryAddressSchema, default: null },
  orderType: {
    type: String,
    enum: ['delivery', 'dine-in', 'takeaway'],
    default: 'delivery',
  },
  specialInstructions: { type: String, default: '' },
  status: {
    type: String,
    enum: ['placed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'upi', 'cod'],
    default: 'paypal',
  },
  paypalOrderId: { type: String, default: null },
  estimatedTime: { type: String, default: '30-45 mins' },
  emailSent: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Virtual for formatted total
orderSchema.virtual('formattedTotal').get(function () {
  return `₹${this.grandTotal.toFixed(2)}`;
});

module.exports = mongoose.model('Order', orderSchema);

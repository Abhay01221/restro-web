const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// POST /api/orders — Create a new order (requires auth)
router.post(
  '/',
  optionalAuth,
  [
    body('orderId').notEmpty().withMessage('orderId is required'),
    body('customerName').trim().notEmpty().withMessage('customerName is required'),
    body('customerEmail').isEmail().withMessage('Valid email is required'),
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.name').notEmpty().withMessage('Each item must have a name'),
    body('items.*.price').isNumeric().withMessage('Each item must have a numeric price'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be >= 1'),
    body('subtotal').isNumeric().withMessage('subtotal must be numeric'),
    body('grandTotal').isNumeric().withMessage('grandTotal must be numeric'),
  ],
  validate,
  createOrder
);

// GET /api/orders/:userId — Get all orders for a user
router.get(
  '/:userId',
  optionalAuth,
  [param('userId').notEmpty().withMessage('userId is required')],
  validate,
  getUserOrders
);

// GET /api/orders/detail/:orderId — Get single order
router.get(
  '/detail/:orderId',
  optionalAuth,
  getOrderById
);

// PATCH /api/orders/:orderId/status — Update order status
router.patch(
  '/:orderId/status',
  [body('status').notEmpty().withMessage('status is required')],
  validate,
  updateOrderStatus
);

module.exports = router;

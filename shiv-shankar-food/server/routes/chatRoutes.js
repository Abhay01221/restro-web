const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { chat, getChatHistory } = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// POST /api/chat — Send a message
router.post(
  '/',
  optionalAuth,
  [
    body('message').trim().notEmpty().withMessage('message is required')
      .isLength({ max: 1000 }).withMessage('message too long'),
    body('sessionId').optional().isString(),
  ],
  validate,
  chat
);

// GET /api/chat/:sessionId — Get chat history
router.get('/:sessionId', optionalAuth, getChatHistory);

module.exports = router;

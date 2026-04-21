const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { sendContactEmail } = require('../services/emailService');

// POST /api/contact — Send contact form email
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
      .isLength({ max: 2000 }).withMessage('Message too long'),
  ],
  validate,
  async (req, res, next) => {
    try {
      await sendContactEmail(req.body);
      res.json({ success: true, message: 'Message sent successfully!' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

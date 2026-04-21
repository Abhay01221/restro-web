const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: 'anonymous' },
  messages: { type: [messageSchema], default: [] },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-expire sessions after 24 hours of inactivity
chatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);

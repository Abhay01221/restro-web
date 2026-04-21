const ChatSession = require('../models/ChatSession');

const SYSTEM_PROMPT = `You are a friendly and helpful support assistant for Shiv Shankar Chinese Food, a premium authentic Chinese restaurant located at Hinjawadi Chowk, Wakad Road, Hinjawadi, Pune – 411057.

Restaurant Information:
- Phone: +91 98765 43210
- Email: contact@shivshankarfood.com
- Hours: Monday to Sunday, 11:00 AM to 11:00 PM
- Delivery radius: 5 km from restaurant
- Free delivery on orders above ₹499
- Delivery time: 30–45 minutes
- Payment methods: PayPal, UPI, Cash on Delivery
- Specialties: Schezwan dishes, Manchurian, Hakka Noodles, Hot & Sour Soup

Menu Highlights:
Soups: Hot & Sour Soup ₹149, Sweet Corn Soup ₹139, Manchow Soup ₹159, Tom Yum Soup ₹169
Starters: Crispy Chilli Paneer ₹229, Spring Rolls ₹179, Chicken Manchurian Dry ₹259, Prawn Tempura ₹299, Crispy Corn ₹199, Dragon Chicken ₹279
Main Course: Paneer Schezwan ₹249, Kung Pao Vegetables ₹229, Butter Garlic Prawns ₹349, Chicken in Black Bean Sauce ₹299
Noodles & Rice: Veg Hakka Noodles ₹189, Chicken Fried Rice ₹219, Schezwan Fried Rice ₹199, Triple Schezwan Noodles ₹249
Desserts: Mango Pudding ₹129, Toffee Apple ₹159
Beverages: Fresh Lime Soda ₹79, Mango Lassi ₹99, Cold Coffee ₹119

Promo Codes: WELCOME10 (10% off), SHIV20 (20% off), FREESHIP (free delivery)

Guidelines:
- Be warm, concise, and helpful
- Use food emojis occasionally 🍜🥢
- Keep responses under 150 words
- If you don't know something, suggest calling +91 98765 43210
- Don't make up information not listed above`;

/**
 * POST /api/chat
 * Send a message to Grok AI and get a response.
 */
const chat = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Get or create session
    let session = await ChatSession.findOne({ sessionId: sid });
    if (!session) {
      session = new ChatSession({ sessionId: sid, userId: req.user?.uid || 'anonymous' });
    }

    // Add user message to history
    session.messages.push({ role: 'user', content: message.trim() });
    session.lastActivity = new Date();

    // Keep last 20 messages for context (10 exchanges)
    const recentMessages = session.messages.slice(-20).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Call Grok API
    const grokApiKey = process.env.GROK_API_KEY;
    const grokApiUrl = process.env.GROK_API_URL || 'https://api.x.ai/v1';

    if (!grokApiKey || grokApiKey === 'your_grok_api_key') {
      // Fallback response when API key not configured
      const fallbackReply = getFallbackResponse(message.trim());
      session.messages.push({ role: 'assistant', content: fallbackReply });
      await session.save();
      return res.json({
        success: true,
        reply: fallbackReply,
        sessionId: sid,
      });
    }

    const response = await fetch(`${grokApiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[GROK API ERROR]', response.status, errText);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim()
      || 'Sorry, I could not process that. Please call us at +91 98765 43210 🙏';

    // Save assistant reply to session
    session.messages.push({ role: 'assistant', content: reply });
    await session.save();

    res.json({ success: true, reply, sessionId: sid });
  } catch (err) {
    console.error('[CHAT ERROR]', err.message);
    // Return a graceful fallback instead of 500
    res.json({
      success: true,
      reply: 'Sorry, I\'m having trouble right now. Please call us at +91 98765 43210 or WhatsApp us! 🙏',
      sessionId: req.body.sessionId || null,
    });
  }
};

/**
 * GET /api/chat/:sessionId
 * Retrieve chat history for a session.
 */
const getChatHistory = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.json({ success: true, messages: [] });
    }
    res.json({ success: true, messages: session.messages, sessionId: session.sessionId });
  } catch (err) {
    next(err);
  }
};

/**
 * Rule-based fallback when Grok API key is not configured.
 */
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('hour') || msg.includes('open') || msg.includes('time') || msg.includes('timing')) {
    return 'We are open every day from 11:00 AM to 11:00 PM 🕐 Come visit us at Hinjawadi Chowk, Wakad Road, Pune!';
  }
  if (msg.includes('location') || msg.includes('address') || msg.includes('where')) {
    return '📍 We are located at Hinjawadi Chowk, Wakad Road, Hinjawadi, Pune – 411057. Easy to find near the tech park!';
  }
  if (msg.includes('delivery') || msg.includes('deliver')) {
    return '🚚 We deliver within 5 km of our restaurant in 30–45 minutes. Free delivery on orders above ₹499!';
  }
  if (msg.includes('menu') || msg.includes('dish') || msg.includes('food') || msg.includes('eat')) {
    return '🍜 Our menu includes Soups, Starters, Main Course, Noodles & Rice, Desserts, and Beverages. Popular items: Crispy Chilli Paneer ₹229, Schezwan Fried Rice ₹199, Triple Schezwan Noodles ₹249!';
  }
  if (msg.includes('phone') || msg.includes('call') || msg.includes('contact') || msg.includes('number')) {
    return '📞 You can reach us at +91 98765 43210 or email contact@shivshankarfood.com. We\'re happy to help!';
  }
  if (msg.includes('promo') || msg.includes('discount') || msg.includes('offer') || msg.includes('code')) {
    return '🎉 Use promo codes: WELCOME10 (10% off), SHIV20 (20% off), or FREESHIP (free delivery) at checkout!';
  }
  if (msg.includes('payment') || msg.includes('pay') || msg.includes('upi') || msg.includes('cash')) {
    return '💳 We accept PayPal, UPI, and Cash on Delivery. All online payments are secured!';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('namaste')) {
    return 'Namaste! 🙏 Welcome to Shiv Shankar Chinese Food! How can I help you today? Ask me about our menu, timings, delivery, or location!';
  }

  return 'Thank you for reaching out! 🍜 For detailed assistance, please call us at +91 98765 43210 or visit us at Hinjawadi Chowk, Wakad Road, Pune. We\'re open 11 AM – 11 PM daily!';
}

module.exports = { chat, getChatHistory };

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { sendChatMessage } from '../utils/api';

const QUICK_REPLIES = [
  { label: '📋 View Menu', text: 'What dishes do you have on the menu?' },
  { label: '⏰ Opening Hours', text: 'What are your opening hours?' },
  { label: '📍 Location', text: 'Where are you located?' },
  { label: '🚚 Delivery Info', text: 'What are your delivery charges and time?' },
  { label: '📞 Contact Us', text: 'How can I contact you?' },
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Namaste! 🙏 Welcome to Shiv Shankar Chinese Food! How can I help you today? Ask me about our menu, delivery, location, or anything else!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput('');
    setShowQuickReplies(false);
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(userText, sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('[ChatBot]', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please call us at +91 98765 43210 or WhatsApp us! 🙏'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div style={{ padding: '14px 16px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: 24 }}>🍜</span>
                  <span style={{ position: 'absolute', bottom: 0, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#22C55E', border: '1.5px solid var(--primary)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: "'Cinzel', serif" }}>Shiv Shankar Support</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>● Online · Powered by AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 4 }} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-2)',
                    color: 'var(--text)', fontSize: 13, lineHeight: 1.5,
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 2px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', display: 'block' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {showQuickReplies && messages.length === 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {QUICK_REPLIES.map(qr => (
                    <button
                      key={qr.label}
                      onClick={() => sendMessage(qr.text)}
                      style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="input-dark"
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: input.trim() && !loading ? 'var(--primary)' : 'var(--surface-2)',
                  border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', transition: 'background 0.2s', flexShrink: 0,
                }}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--primary)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', zIndex: 1000,
          boxShadow: '0 4px 20px rgba(192,57,43,0.5)',
        }}
        aria-label="Open chat support"
      >
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse-ring 1.5s ease-out infinite', opacity: 0.6 }} />
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}

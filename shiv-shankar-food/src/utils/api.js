import { getIdToken } from '../firebase/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Make an authenticated request to the backend.
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = await getIdToken().catch(() => null);

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || `API error ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = (orderData) =>
  apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });

export const fetchUserOrders = (userId) =>
  apiRequest(`/api/orders/${userId}`);

export const fetchOrderById = (orderId) =>
  apiRequest(`/api/orders/detail/${orderId}`);

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const sendChatMessage = (message, sessionId) =>
  apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });

export const fetchChatHistory = (sessionId) =>
  apiRequest(`/api/chat/${sessionId}`);

// ─── Contact ──────────────────────────────────────────────────────────────────

export const sendContactForm = (formData) =>
  apiRequest('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = () =>
  apiRequest('/api/health');

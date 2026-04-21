# 🐉 Shiv Shankar Chinese Food — Full-Stack App

Production-ready restaurant web application with React frontend + Node.js/Express backend + MongoDB.

---

## 🏗️ Architecture

```
shiv-shankar-food/          ← React + Vite frontend
  src/
    firebase/               ← Firebase Auth + Firestore
    utils/api.js            ← Backend API client
    pages/                  ← 12 pages
    components/             ← 10 components
    store/                  ← Zustand (cart + auth)

shiv-shankar-food/server/   ← Node.js + Express backend
  server.js
  models/                   ← Mongoose schemas
  controllers/              ← Business logic
  routes/                   ← API routes
  middleware/               ← Auth, validation, errors
  services/                 ← Nodemailer email service
  config/                   ← MongoDB connection
```

---

## 🚀 Quick Start

### 1. Frontend Setup

```bash
cd shiv-shankar-food
cp .env.example .env        # fill in Firebase, PayPal keys
npm install
npm run dev                 # http://localhost:5173
```

### 2. Backend Setup

```bash
cd shiv-shankar-food/server
cp .env.example .env        # fill in MongoDB, Gmail, Grok keys
npm install
npm run dev                 # http://localhost:5000
```

---

## 🔑 Environment Variables

### Frontend (`shiv-shankar-food/.env`)

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_PAYPAL_CLIENT_ID` | PayPal sandbox/live client ID |
| `VITE_API_URL` | Backend URL (default: `http://localhost:5000`) |

### Backend (`shiv-shankar-food/server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `FRONTEND_URL` | Frontend URL for CORS |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 chars) |
| `GROK_API_KEY` | xAI Grok API key |
| `GROK_API_URL` | Grok API base URL (`https://api.x.ai/v1`) |

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → Enable **Authentication**
   - Enable **Email/Password** provider
   - Enable **Google** provider
3. Enable **Firestore Database** (start in test mode, then apply rules below)
4. Copy config to frontend `.env`

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 💳 PayPal Setup

1. Go to [PayPal Developer](https://developer.paypal.com)
2. Create app → copy **Sandbox Client ID** to `VITE_PAYPAL_CLIENT_ID`
3. For production, switch to Live credentials

---

## 📧 Gmail SMTP Setup (Nodemailer)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate a 16-character app password
4. Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in server `.env`

---

## 🤖 Grok API Setup

1. Go to [xAI Console](https://console.x.ai)
2. Generate an API key
3. Set `GROK_API_KEY=xai-...` in server `.env`
4. The chatbot falls back to rule-based responses if key is not set

---

## 🗄️ MongoDB Setup

**Local:**
```bash
# Install MongoDB Community Edition
# Start: mongod --dbpath /data/db
MONGODB_URI=mongodb://localhost:27017/shiv-shankar-food
```

**MongoDB Atlas (Cloud):**
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string → replace in `.env`
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shiv-shankar-food
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:userId` | Get user's orders |
| GET | `/api/orders/detail/:orderId` | Get single order |
| PATCH | `/api/orders/:orderId/status` | Update order status |
| POST | `/api/chat` | Send chat message (Grok AI) |
| GET | `/api/chat/:sessionId` | Get chat history |
| POST | `/api/contact` | Send contact form email |

---

## ✅ Features

### Authentication (Firebase)
- ✅ Email/password signup with **email verification**
- ✅ Blocks login until email is verified
- ✅ Resend verification email option
- ✅ Google OAuth (always verified)
- ✅ Forgot password via Firebase
- ✅ Protected routes: `/checkout`, `/dashboard`

### Backend (Node.js + MongoDB)
- ✅ Express server with CORS, Helmet, rate limiting
- ✅ MongoDB order persistence via Mongoose
- ✅ Input validation with express-validator
- ✅ Global error handler
- ✅ Nodemailer HTML email confirmation

### Chatbot (Grok AI)
- ✅ Backend proxy — API key never exposed to frontend
- ✅ Conversation history stored in MongoDB (24h TTL)
- ✅ Rule-based fallback when API key not configured
- ✅ Rate limited (20 messages/minute)

### Payment
- ✅ PayPal JS SDK integration
- ✅ INR → USD conversion (÷83)
- ✅ Order saved to MongoDB on payment success
- ✅ Confirmation email via Nodemailer

---

## 🌐 Deployment

### Frontend → Vercel
```bash
npm run build
vercel --prod
# Add all VITE_* env vars in Vercel dashboard
```

### Backend → Railway / Render / Fly.io
```bash
# Set all server .env vars in platform dashboard
# Start command: node server.js
```

---

## 🛠️ Development

```bash
# Terminal 1 — Frontend
cd shiv-shankar-food && npm run dev

# Terminal 2 — Backend
cd shiv-shankar-food/server && npm run dev
```

---

Made with ❤️ in Pune

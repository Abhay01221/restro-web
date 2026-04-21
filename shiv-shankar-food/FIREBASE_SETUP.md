# 🔥 Firebase Authentication Setup Guide

Follow these steps exactly to fix the login/signup errors.

---

## Step 1 — Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `shiv-shankar-food`
4. Disable Google Analytics (optional) → **Create project**

---

## Step 2 — Enable Authentication Methods

1. In the left sidebar → **Build → Authentication**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable **Email/Password**:
   - Click it → Toggle **Enable** → Save
5. Enable **Google**:
   - Click it → Toggle **Enable**
   - Set **Project support email** (your Gmail)
   - Save

---

## Step 3 — Add Authorized Domains

Still in Authentication → **Settings** tab → **Authorized domains**

Make sure these are listed (add if missing):
- `localhost`
- `127.0.0.1`

---

## Step 4 — Get Your Config Keys

1. Go to **Project Settings** (gear icon ⚙️ top left)
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → choose **Web** (`</>`)
4. Register app name: `shiv-shankar-web`
5. Copy the `firebaseConfig` object shown

---

## Step 5 — Fill in Your .env File

Open `shiv-shankar-food/.env` and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...your_real_key...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

> ⚠️ **Never commit your .env file to Git.** It's already in `.gitignore`.

---

## Step 6 — Set Up Firestore (for user profiles & orders)

1. In Firebase Console → **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a region close to India (e.g., `asia-south1`)
5. Click **Done**

### Apply Security Rules (for production):

Go to Firestore → **Rules** tab → paste:

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

## Step 7 — Restart the Dev Server

After updating `.env`, **restart Vite** (Ctrl+C then `npm run dev`).
Vite only reads `.env` at startup.

---

## ✅ Verification Checklist

- [ ] `.env` has real values (not `your_firebase_api_key`)
- [ ] Email/Password provider is **Enabled** in Firebase Console
- [ ] Google provider is **Enabled** in Firebase Console
- [ ] `localhost` is in **Authorized domains**
- [ ] Firestore database is created
- [ ] Dev server was restarted after `.env` changes

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|---|---|---|
| `auth/configuration-not-found` | Email/Password not enabled | Enable it in Firebase Console → Authentication → Sign-in method |
| `auth/api-key-not-valid` | Wrong API key in `.env` | Copy the exact key from Firebase Project Settings |
| `auth/operation-not-allowed` | Provider not enabled | Enable the provider in Firebase Console |
| `auth/popup-blocked` | Browser blocked popup | Allow popups for localhost in browser settings |
| `auth/network-request-failed` | No internet / wrong authDomain | Check connection; verify `VITE_FIREBASE_AUTH_DOMAIN` |
| `auth/invalid-credential` | Wrong email or password | Check credentials; use "Forgot Password" |
| `auth/email-not-verified` | Email not verified | Click the link in the verification email |
| Generic error / blank | `.env` not updated | Fill in real Firebase values and restart dev server |

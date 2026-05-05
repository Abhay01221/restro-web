import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─── Firebase config ──────────────────────────────────────────────────────────
// All values come strictly from .env — no hardcoded fallbacks to avoid
// hidden whitespace/newline issues (e.g. %0D%0A in authDomain).
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
console.log('[Firebase] AUTH DOMAIN:', JSON.stringify(authDomain));

const firebaseConfig = {
  apiKey:            (import.meta.env.VITE_FIREBASE_API_KEY            || '').trim(),
  authDomain,
  projectId:         (import.meta.env.VITE_FIREBASE_PROJECT_ID         || '').trim(),
  storageBucket:     (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId:             (import.meta.env.VITE_FIREBASE_APP_ID             || '').trim(),
};

// ─── Singleton app init ───────────────────────────────────────────────────────
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = getAuth(app);

// Persist session across page refreshes (localStorage)
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.warn('[Firebase] setPersistence failed:', err.message)
);

// ─── Firestore ────────────────────────────────────────────────────────────────
export const db = getFirestore(app);

// ─── Google OAuth provider ────────────────────────────────────────────────────
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;

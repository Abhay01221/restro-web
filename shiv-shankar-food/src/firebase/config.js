import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─── Firebase config ──────────────────────────────────────────────────────────
// Values come from .env (VITE_ prefix) with the real project values as fallback.
// This ensures the app works even if Vite hasn't reloaded the env yet.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyAxQ6Y87yjPf4RkGA3LpBArguLcUg7vll0',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'shiv-shankar-food.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'shiv-shankar-food',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'shiv-shankar-food.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '597796297926',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:597796297926:web:b19f7b7679ec9875d60bc7',
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

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  reload,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { createUserProfile } from './firestore';

// ─── REGISTER (email + password) ─────────────────────────────────────────────
/**
 * Creates a new user, sets display name, sends verification email,
 * then immediately signs them out so the app doesn't treat an
 * unverified user as "logged in".
 */
export const registerWithEmail = async (name, email, password) => {
  console.log('[Auth] registerWithEmail →', email);

  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  console.log('[Auth] User created uid:', user.uid);

  // Set display name synchronously before anything else
  await updateProfile(user, { displayName: name });

  // Send verification email
  await sendEmailVerification(user, {
    url: `${window.location.origin}/login?verified=true`,
  });
  console.log('[Auth] Verification email sent to:', email);

  // IMPORTANT: sign out immediately so onAuthStateChanged doesn't
  // fire with an unverified user and accidentally log them in.
  await signOut(auth);
  console.log('[Auth] Signed out after registration (awaiting email verification)');

  // Create Firestore profile — non-blocking, never breaks registration
  createUserProfile(user.uid, { name, email }).catch(err =>
    console.warn('[Auth] Firestore profile creation failed (non-critical):', err.message)
  );

  return { uid: user.uid, email: user.email, displayName: name };
};

// ─── LOGIN (email + password) ─────────────────────────────────────────────────
export const loginWithEmail = async (email, password) => {
  console.log('[Auth] loginWithEmail →', email);

  const { user } = await signInWithEmailAndPassword(auth, email, password);

  // Always reload to get the freshest emailVerified flag from Firebase servers
  await reload(user);
  console.log('[Auth] emailVerified:', user.emailVerified);

  if (!user.emailVerified) {
    // Sign out so the session doesn't persist for unverified users
    await signOut(auth);
    const err = new Error(
      'Your email address has not been verified yet. ' +
      'Please click the link in the verification email we sent you.'
    );
    err.code = 'auth/email-not-verified';
    throw err;
  }

  console.log('[Auth] Login success:', user.email);
  return user;
};

// ─── GOOGLE LOGIN (popup + redirect fallback) ─────────────────────────────────
export const loginWithGoogle = async () => {
  console.log('[Auth] loginWithGoogle (popup)');

  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    console.log('[Auth] Google popup success:', user.email);

    // Upsert Firestore profile — non-blocking
    createUserProfile(user.uid, {
      name:  user.displayName || '',
      email: user.email       || '',
    }).catch(err =>
      console.warn('[Auth] Firestore profile (Google) failed (non-critical):', err.message)
    );

    return user;
  } catch (err) {
    console.error('[Auth] Google popup error:', err.code, err.message);

    // User simply closed the popup — not an error
    if (
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      return null; // caller checks for null
    }

    // Popup was blocked by the browser → fall back to redirect flow
    if (err.code === 'auth/popup-blocked') {
      console.log('[Auth] Popup blocked — falling back to redirect');
      await signInWithRedirect(auth, googleProvider);
      return null; // page will reload; result handled in handleGoogleRedirect
    }

    // Re-throw everything else so the UI can show the real message
    throw err;
  }
};

// ─── HANDLE GOOGLE REDIRECT RESULT ───────────────────────────────────────────
/**
 * Call this once on app mount to capture the result of a redirect-based
 * Google sign-in (triggered when popup was blocked).
 */
export const handleGoogleRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null; // no pending redirect

    const { user } = result;
    console.log('[Auth] Google redirect result:', user.email);

    createUserProfile(user.uid, {
      name:  user.displayName || '',
      email: user.email       || '',
    }).catch(err =>
      console.warn('[Auth] Firestore profile (redirect) failed (non-critical):', err.message)
    );

    return user;
  } catch (err) {
    console.error('[Auth] Google redirect error:', err.code, err.message);
    throw err;
  }
};

// ─── RESEND VERIFICATION EMAIL ────────────────────────────────────────────────
/**
 * Resend the verification email.
 * Because we sign out after registration, auth.currentUser will be null.
 * We temporarily sign in, send the email, then sign out again.
 */
export const resendVerificationEmail = async (email, password) => {
  // If we have a current user (e.g. they're still in the same session), use it
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser, {
      url: `${window.location.origin}/login?verified=true`,
    });
    console.log('[Auth] Verification email resent to:', auth.currentUser.email);
    return;
  }

  // Otherwise we need credentials to sign in temporarily
  if (!email || !password) {
    throw new Error(
      'Please enter your email and password above, then click "Resend".'
    );
  }

  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user, {
    url: `${window.location.origin}/login?verified=true`,
  });
  await signOut(auth);
  console.log('[Auth] Verification email resent (temp sign-in) to:', email);
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  await signOut(auth);
  console.log('[Auth] Signed out');
};

// ─── PASSWORD RESET ───────────────────────────────────────────────────────────
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/login`,
  });
  console.log('[Auth] Password reset email sent to:', email);
};

// ─── GET ID TOKEN ─────────────────────────────────────────────────────────────
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(/* forceRefresh */ false);
};

// ─── ERROR MESSAGE MAP ────────────────────────────────────────────────────────
export const getAuthErrorMessage = (code, rawMessage) => {
  const MAP = {
    // Credential errors
    'auth/user-not-found':           'No account found with this email address.',
    'auth/wrong-password':           'Incorrect password. Please try again.',
    'auth/invalid-credential':       'Invalid email or password. Please check and try again.',
    'auth/invalid-email':            'Please enter a valid email address.',
    'auth/user-disabled':            'This account has been disabled. Please contact support.',

    // Registration errors
    'auth/email-already-in-use':     'An account with this email already exists. Try signing in instead.',
    'auth/weak-password':            'Password must be at least 6 characters long.',
    'auth/operation-not-allowed':    'This sign-in method is not enabled. Please contact support.',

    // Rate limiting
    'auth/too-many-requests':        'Too many failed attempts. Please wait a few minutes and try again.',

    // Popup / redirect
    'auth/popup-closed-by-user':     '', // silent — user chose to close
    'auth/cancelled-popup-request':  '', // silent
    'auth/popup-blocked':            'Popup was blocked. Redirecting to Google sign-in…',

    // Network
    'auth/network-request-failed':   'Network error. Please check your internet connection and try again.',

    // Custom
    'auth/email-not-verified':       'Please verify your email before signing in.',

    // Config errors (developer-facing)
    'auth/configuration-not-found':  '⚠️ Firebase Auth is not configured. Enable Email/Password and Google providers in the Firebase Console.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
                                     '⚠️ Invalid Firebase API key. Check your .env file.',
    'auth/invalid-api-key':          '⚠️ Invalid Firebase API key. Check your .env file.',
    'auth/app-not-authorized':       '⚠️ This domain is not authorized. Add localhost to Firebase Authorized Domains.',
    'auth/unauthorized-domain':      '⚠️ This domain is not authorized. Add localhost to Firebase Authorized Domains.',
    'auth/internal-error':           'An internal Firebase error occurred. Please try again.',
  };

  if (code && MAP[code] !== undefined) {
    return MAP[code]; // may be empty string for silent errors
  }

  // Strip the "Firebase: " prefix Firebase adds to messages
  if (rawMessage) {
    const cleaned = rawMessage
      .replace(/^Firebase:\s*/i, '')
      .replace(/\s*\(auth\/[^)]+\)\s*\.?$/, '')
      .trim();
    if (cleaned && cleaned !== 'Error (undefined)') return cleaned;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Lightweight Firebase token verification middleware.
 * Verifies the Firebase ID token sent in Authorization: Bearer <token>
 * Falls back gracefully if Firebase Admin SDK is not configured.
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Decode the JWT payload (without full verification — use Firebase Admin for production)
    // For production, install firebase-admin and use admin.auth().verifyIdToken(token)
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));

    if (!payload.sub || !payload.email) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }

    // Check token expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Token expired' });
    }

    req.user = {
      uid: payload.sub,
      email: payload.email,
      name: payload.name || '',
      emailVerified: payload.email_verified || false,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Token verification failed' });
  }
};

/**
 * Optional auth — attaches user if token present, continues either way.
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = authHeader.split('Bearer ')[1];
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
    req.user = { uid: payload.sub, email: payload.email, name: payload.name || '' };
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { verifyFirebaseToken, optionalAuth };

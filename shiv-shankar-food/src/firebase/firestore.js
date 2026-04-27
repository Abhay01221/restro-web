import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid,
      name:        data.name  || '',
      email:       data.email || '',
      phone:       '',
      addresses:   [],
      createdAt:   serverTimestamp(),
      ordersCount: 0,
    });
  }
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), data);
};

// ─── ADDRESSES ────────────────────────────────────────────────────────────────
export const addAddress = async (uid, address) => {
  await updateDoc(doc(db, 'users', uid), { addresses: arrayUnion(address) });
};

export const removeAddress = async (uid, address) => {
  await updateDoc(doc(db, 'users', uid), { addresses: arrayRemove(address) });
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
/**
 * Save an order to Firestore using addDoc (auto-generated document ID).
 * The app-generated orderId (SSF-xxx) is stored as a FIELD, not the doc ID.
 *
 * Required fields in orderData: userId, orderId, items
 */
export const saveOrder = async (orderData) => {
  console.log('[Firestore] ── saveOrder called ──');
  console.log('[Firestore] userId:', orderData.userId);
  console.log('[Firestore] orderId:', orderData.orderId);
  console.log('[Firestore] items count:', orderData.items?.length);
  console.log('[Firestore] grandTotal:', orderData.grandTotal);
  console.log('[Firestore] full orderData:', JSON.stringify(orderData, null, 2));

  if (!orderData.userId || orderData.userId === 'guest') {
    throw new Error('User must be logged in to place an order. userId is missing or "guest".');
  }
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('Order must contain at least one item.');
  }

  const payload = {
    ...orderData,
    // Ensure total field exists (some queries use "total" instead of "grandTotal")
    total:     orderData.grandTotal,
    createdAt: serverTimestamp(),
  };

  console.log('[Firestore] Writing to collection "orders"...');
  const docRef = await addDoc(collection(db, 'orders'), payload);
  console.log('[Firestore] ✅ Order saved! Firestore document ID:', docRef.id);

  // Increment ordersCount on user profile — non-blocking
  getDoc(doc(db, 'users', orderData.userId))
    .then(snap => {
      if (snap.exists()) {
        return updateDoc(doc(db, 'users', orderData.userId), {
          ordersCount: (snap.data().ordersCount || 0) + 1,
        });
      }
    })
    .catch(err => console.warn('[Firestore] ordersCount increment failed (non-critical):', err.message));

  return { firestoreId: docRef.id, ...payload };
};

/**
 * Fetch all orders for a user.
 * NOTE: Does NOT use orderBy to avoid requiring a composite index.
 * Orders are sorted client-side by createdAt.
 */
export const getUserOrders = async (userId) => {
  console.log('[Firestore] ── getUserOrders called ──');
  console.log('[Firestore] Querying orders where userId ==', userId);

  if (!userId) {
    console.error('[Firestore] getUserOrders: userId is empty!');
    return [];
  }

  // Simple query — no orderBy, no composite index needed
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  );

  const snap = await getDocs(q);
  console.log('[Firestore] Raw snapshot size:', snap.size);

  const orders = snap.docs.map(d => {
    const data = d.data();
    return {
      firestoreId: d.id,
      ...data,
      // Normalise createdAt for display — serverTimestamp returns a Firestore Timestamp
      createdAt: data.createdAt || null,
    };
  });

  // Sort newest first client-side
  orders.sort((a, b) => {
    const ta = a.createdAt?.seconds ?? 0;
    const tb = b.createdAt?.seconds ?? 0;
    return tb - ta;
  });

  console.log('[Firestore] ✅ Orders fetched:', orders.length);
  orders.forEach((o, i) =>
    console.log(`  [${i}] orderId=${o.orderId} status=${o.status} total=${o.grandTotal}`)
  );

  return orders;
};

/**
 * Get a single order by the app-generated orderId field (SSF-xxx).
 */
export const getOrderById = async (orderId) => {
  const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { firestoreId: d.id, ...d.data() };
};

/**
 * Cancel an order by its Firestore document ID (firestoreId).
 */
export const cancelOrder = async (firestoreId) => {
  console.log('[Firestore] Cancelling order firestoreId:', firestoreId);
  await updateDoc(doc(db, 'orders', firestoreId), {
    status:      'cancelled',
    cancelledAt: serverTimestamp(),
  });
  console.log('[Firestore] ✅ Order cancelled');
};

// ─── ADMIN FUNCTIONS ──────────────────────────────────────────────────────────

/**
 * Fetch ALL orders (admin only — no userId filter).
 * Sorted client-side newest first.
 */
export const getAllOrders = async () => {
  console.log('[ADMIN] Fetching all orders...');
  const snap = await getDocs(collection(db, 'orders'));
  const orders = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  orders.sort((a, b) => {
    const ta = a.createdAt?.seconds ?? 0;
    const tb = b.createdAt?.seconds ?? 0;
    return tb - ta;
  });
  console.log('[ADMIN] Total orders fetched:', orders.length);
  return orders;
};

/**
 * Accept an order.
 */
export const acceptOrder = async (firestoreId, adminNote = '') => {
  console.log('[ADMIN] Accepting order:', firestoreId);
  await updateDoc(doc(db, 'orders', firestoreId), {
    status:        'accepted',
    adminNote,
    adminActionAt: serverTimestamp(),
    refundStatus:  'none',
  });
  console.log('[ADMIN] Order accepted:', firestoreId);
};

/**
 * Reject an order.
 */
export const rejectOrder = async (firestoreId, adminNote = '') => {
  console.log('[ADMIN] Rejecting order:', firestoreId);
  await updateDoc(doc(db, 'orders', firestoreId), {
    status:        'rejected',
    adminNote,
    adminActionAt: serverTimestamp(),
    refundStatus:  'initiated',
  });
  console.log('[ADMIN] Order rejected:', firestoreId);
};

/**
 * Mark an accepted order as completed.
 */
export const completeOrder = async (firestoreId) => {
  console.log('[ADMIN] Completing order:', firestoreId);
  await updateDoc(doc(db, 'orders', firestoreId), {
    status:        'completed',
    adminActionAt: serverTimestamp(),
  });
  console.log('[ADMIN] Order completed:', firestoreId);
};

/**
 * Get user role from Firestore.
 */
export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data().role || 'user') : 'user';
};

/**
 * Set a user's role (call this once manually to make yourself admin).
 */
export const setUserRole = async (uid, role) => {
  await updateDoc(doc(db, 'users', uid), { role });
};

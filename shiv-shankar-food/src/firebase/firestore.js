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
  orderBy,
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
      name:       data.name  || '',
      email:      data.email || '',
      phone:      '',
      addresses:  [],
      createdAt:  serverTimestamp(),
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
 * Save an order to Firestore.
 * Uses addDoc (auto-ID) so Firestore always creates the document,
 * and stores the app-generated orderId as a field for display.
 *
 * orderData MUST include: userId, orderId, items, grandTotal, status
 */
export const saveOrder = async (orderData) => {
  console.log('[Firestore] Saving order...', orderData);

  // Validate required fields before attempting write
  if (!orderData.userId) {
    throw new Error('Cannot save order: userId is missing. User must be logged in.');
  }
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('Cannot save order: items array is empty.');
  }

  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
  });

  console.log('[Firestore] Order saved with document ID:', docRef.id);

  // Increment user order count (non-blocking — don't fail the order if this fails)
  updateDoc(doc(db, 'users', orderData.userId), {
    ordersCount: (await getDoc(doc(db, 'users', orderData.userId))
      .then(s => s.exists() ? (s.data().ordersCount || 0) : 0)
      .catch(() => 0)) + 1,
  }).catch(err => console.warn('[Firestore] ordersCount increment failed:', err.message));

  return { firestoreId: docRef.id, ...orderData };
};

export const getUserOrders = async (userId) => {
  console.log('[Firestore] Fetching orders for userId:', userId);
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
  console.log('[Firestore] Orders fetched:', orders.length);
  return orders;
};

export const getOrderById = async (orderId) => {
  // orderId here is the app-generated "SSF-xxx" field, not the Firestore doc ID
  const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { firestoreId: d.id, ...d.data() };
};

// Cancel an order — only allowed for pending/confirmed status
export const cancelOrder = async (firestoreId) => {
  await updateDoc(doc(db, 'orders', firestoreId), {
    status:      'cancelled',
    cancelledAt: serverTimestamp(),
  });
};

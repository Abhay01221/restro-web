import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Promo codes ──────────────────────────────────────────────────────────────
const PROMO_CODES = {
  WELCOME10: { type: 'percent', value: 10 },
  SHIV20:    { type: 'percent', value: 20 },
  FREESHIP:  { type: 'freeship', value: 0 },
};

// ─── Fee constants ────────────────────────────────────────────────────────────
export const PLATFORM_FEE = 5; // flat ₹5 on all non-empty orders

// ─── Pure computation helpers ─────────────────────────────────────────────────
// Zustand does NOT support native JS getters — use plain functions.

export const computeSubtotal = (items) =>
  items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

export const computeGst = (subtotal) => subtotal * 0.05;

export const computePlatformFee = (subtotal) => (subtotal > 0 ? PLATFORM_FEE : 0);

// Delivery fee: ONLY for 'delivery' order type.
// Dine-in and takeaway never pay delivery.
export const computeDeliveryFee = (subtotal, promoType, orderType) => {
  if (orderType !== 'delivery') return 0;
  if (promoType === 'freeship') return 0;
  if (subtotal <= 0) return 0;
  return subtotal >= 499 ? 0 : 40;
};

export const computeGrandTotal = (subtotal, gst, platformFee, deliveryFee, discount) =>
  subtotal + gst + platformFee + deliveryFee - (discount || 0);

// ─── Store ────────────────────────────────────────────────────────────────────
const useCartStore = create(
  persist(
    (set, get) => ({
      items:        [],
      promoCode:    null,
      discount:     0,
      promoType:    null,
      orderType:    'delivery',   // persisted so cart drawer shows correct fees
      isDrawerOpen: false,

      setOrderType: (orderType) => set({ orderType }),

      addItem: (item) => {
        const { items } = get();
        const existing = items.find(i => i.id === item.id);
        if (existing) {
          set({ items: items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter(i => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return; }
        set({ items: get().items.map(i => i.id === id ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], promoCode: null, discount: 0, promoType: null }),

      applyPromo: (code) => {
        const promo = PROMO_CODES[code.toUpperCase()];
        if (!promo) return { success: false, message: 'Invalid promo code.' };
        const subtotal = computeSubtotal(get().items);
        const discount = promo.type === 'percent' ? (subtotal * promo.value) / 100 : 0;
        set({ promoCode: code.toUpperCase(), discount, promoType: promo.type });
        return {
          success: true,
          message: promo.type === 'percent' ? `${promo.value}% discount applied!` : 'Free delivery applied!',
        };
      },

      removePromo: () => set({ promoCode: null, discount: 0, promoType: null }),
      openDrawer:  () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'shiv-shankar-cart',
      partialize: (state) => ({
        items:     state.items,
        promoCode: state.promoCode,
        discount:  state.discount,
        promoType: state.promoType,
        orderType: state.orderType,
      }),
    }
  )
);

// ─── Selector hook ────────────────────────────────────────────────────────────
// Always call this in components — never useCartStore directly.
export const useCart = () => {
  const store = useCartStore();

  const subtotal    = computeSubtotal(store.items);
  const gst         = computeGst(subtotal);
  const platformFee = computePlatformFee(subtotal);
  const deliveryFee = computeDeliveryFee(subtotal, store.promoType, store.orderType);
  const grandTotal  = computeGrandTotal(subtotal, gst, platformFee, deliveryFee, store.discount);
  const itemCount   = store.items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items:        store.items,
    promoCode:    store.promoCode,
    discount:     store.discount,
    promoType:    store.promoType,
    orderType:    store.orderType,
    isDrawerOpen: store.isDrawerOpen,
    subtotal,
    gst,
    platformFee,
    deliveryFee,
    grandTotal,
    itemCount,
    addItem:        store.addItem,
    removeItem:     store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart:      store.clearCart,
    applyPromo:     store.applyPromo,
    removePromo:    store.removePromo,
    setOrderType:   store.setOrderType,
    openDrawer:     store.openDrawer,
    closeDrawer:    store.closeDrawer,
  };
};

export default useCartStore;

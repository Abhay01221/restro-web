import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  clearUser: () => set({ user: null, userProfile: null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

export default useAuthStore;

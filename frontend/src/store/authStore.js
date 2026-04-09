import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid throwing on no rows

      if (error) throw error;

      if (data) {
        set({ profile: data });
        return data;
      } else {
        // If no profile exists, but user is authenticated (shouldn't happen in normal flow)
        console.warn('No profile found for user, creating temporary profile');
        const tempProfile = {
          id: userId,
          name: 'User',
          login_id: get().user?.email?.split('@')[0] || 'user',
          role: 'staff',
          tag_name: '@user',
          company_id: null,
        };
        set({ profile: tempProfile });
        return tempProfile;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Could not load profile');
      // Still set a fallback so app doesn't break completely
      set({ profile: null });
      return null;
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    set({ user: data.user, session: data.session });
    await get().fetchProfile(data.user.id);
    toast.success('Welcome back!');
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null, session: null });
    toast.success('Logged out');
  },

  initialize: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });
    if (session?.user) {
      set({ user: session.user });
      await get().fetchProfile(session.user.id);
    }
    set({ loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },

  // Admin: create staff user (will be used inside app)
  createStaff: async ({ name, login_id, password, tag_name }) => {
    const email = `${login_id}@milan-safety.internal`; // Keep for staff creation if needed
    // ... existing code if any, or implement properly
  },
}));
import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import toast from 'react-hot-toast'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  _isCreatingStaff: false,

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
        .maybeSingle()

      if (error) throw error

      if (data) {
        set({ profile: data })
        return data
      } else {
        console.warn('No profile found for user:', userId)
        set({ profile: null })
        return null
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Could not load profile')
      set({ profile: null })
      return null
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user, session: data.session })
    await get().fetchProfile(data.user.id)
    toast.success('Welcome back!')
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, profile: null, session: null })
    toast.success('Logged out')
  },

  initialize: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    set({ session })
    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }
    set({ loading: false })

    supabase.auth.onAuthStateChange(async (_event, session) => {
      // Staff creation ke dauran auth change ignore karo
      if (get()._isCreatingStaff) return

      set({ session, user: session?.user ?? null })
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      } else {
        set({ profile: null })
      }
    })
  },

  createStaff: async ({ name, login_id, password, tag_name }) => {
    const profile = get().profile
    if (!profile?.company_id) throw new Error('Company not found')

    // Admin ka session aur profile save karo
    const adminUser = get().user
    const adminProfile = get().profile
    const { data: { session: adminSession } } = await supabase.auth.getSession()

    // Flag set karo — auth state change block karo
    set({ _isCreatingStaff: true })

    try {
      // Login ID process karo — spaces ko dots se replace karo
      const processedLoginId = login_id.toLowerCase().replace(/\s+/g, '.')
      const email = `${processedLoginId}@staff.internal`

      // ✅ Trigger ko metadata mein sab kuch do — wahi profile banayega
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            tag_name,
            role: 'staff',
            login_id: processedLoginId,   // ✅ trigger ke liye
            company_id: profile.company_id, // ✅ trigger ke liye
          },
        },
      })

      if (authError) throw authError

      const newUserId = authData.user?.id
      if (!newUserId) throw new Error('User creation failed')

      // ✅ Admin session turant restore karo
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      })
      set({ user: adminUser, profile: adminProfile, session: adminSession })

      // ✅ Plain password store karo (admin reference ke liye)
      // Trigger ne profile create kar diya, hum sirf password update karein
      const { error: pwdError } = await supabase
        .from('users')
        .update({ plain_password: password })
        .eq('id', newUserId)

      if (pwdError) {
        console.warn('Could not save staff password hint:', pwdError)
        // Non-fatal — staff still created successfully
      }

      return {
        id: newUserId,
        name,
        login_id: processedLoginId,
        tag_name,
        role: 'staff',
      }

    } finally {
      // Flag hamesha clear karo
      set({ _isCreatingStaff: false })
    }
  },

  deleteStaff: async (staffId) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-staff`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ staffId }),
      }
    )

    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Delete failed')
    return true
  },
}))
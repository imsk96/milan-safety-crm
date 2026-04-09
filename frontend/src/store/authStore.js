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

    const email = `${login_id.toLowerCase().replace(/\s+/g, '.')}@staff.internal`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, tag_name, role: 'staff' },
      },
    })

    if (authError) throw authError

    const newUserId = authData.user?.id
    if (!newUserId) throw new Error('User creation failed')

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', newUserId)
      .maybeSingle()

    if (!existingUser) {
      const { error: insertError } = await supabase.from('users').insert({
        id: newUserId,
        name,
        login_id,
        tag_name,
        role: 'staff',
        company_id: profile.company_id,
      })
      if (insertError) throw insertError
    } else {
      const { error: updateError } = await supabase
        .from('users')
        .update({ name, login_id, tag_name, role: 'staff', company_id: profile.company_id })
        .eq('id', newUserId)
      if (updateError) throw updateError
    }

    return { id: newUserId, name, login_id, tag_name, role: 'staff' }
  },

  // ✅ NEW: Staff delete via Edge Function
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
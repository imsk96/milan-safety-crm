import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export const useAppStore = create((set, get) => ({
  darkMode: localStorage.getItem('theme') === 'dark',
  backgroundImage: null,
  sidebarOpen: true,

  toggleDarkMode: () => {
    const newMode = !get().darkMode
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    set({ darkMode: newMode })
    document.documentElement.classList.toggle('dark', newMode)
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // ✅ Fetch background (safe)
  fetchBackground: async (companyId) => {
    if (!companyId) return
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('background_image_url')
        .eq('company_id', companyId)
        .maybeSingle()

      if (error) throw error

      set({ backgroundImage: data?.background_image_url || null })
    } catch (e) {
      console.warn('fetchBackground error:', e)
    }
  },

  // ✅ FIXED: UPSERT (no hang, no missing row issue)
  updateBackground: async (url) => {
    const { useAuthStore } = await import('./authStore')
    const companyId = useAuthStore.getState().profile?.company_id

    if (!companyId) throw new Error('Company not found')

    const { error } = await supabase
      .from('settings')
      .upsert(
        {
          company_id: companyId,
          background_image_url: url,
        },
        {
          onConflict: 'company_id',
        }
      )

    if (error) throw error

    set({ backgroundImage: url })
  },

  initialize: () => {
    const isDark = get().darkMode
    document.documentElement.classList.toggle('dark', isDark)
  },
}))
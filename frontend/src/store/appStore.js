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

  // ✅ companyId required — company-specific background fetch
  fetchBackground: async (companyId) => {
    if (!companyId) return
    try {
      const { data } = await supabase
        .from('settings')
        .select('background_image_url')
        .eq('company_id', companyId)
        .maybeSingle()

      set({ backgroundImage: data?.background_image_url || null })
    } catch (e) {
      console.warn('fetchBackground error:', e)
    }
  },

  // ✅ company_id authStore se internally lete hain
  updateBackground: async (url) => {
    // Zustand store se getState() — no circular dep
    const { useAuthStore } = await import('./authStore')
    const companyId = useAuthStore.getState().profile?.company_id
    if (!companyId) throw new Error('Company not found')

    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .eq('company_id', companyId)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('settings')
        .update({ background_image_url: url })
        .eq('id', existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('settings')
        .insert({ background_image_url: url, company_id: companyId })
      if (error) throw error
    }

    set({ backgroundImage: url })
  },

  initialize: () => {
    const isDark = get().darkMode
    document.documentElement.classList.toggle('dark', isDark)
    // Note: fetchBackground is called from Layout.jsx after profile loads
  },
}))
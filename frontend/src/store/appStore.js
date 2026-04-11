import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

// ✅ Detect mobile at load
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

export const useAppStore = create((set, get) => ({
  darkMode: localStorage.getItem('theme') === 'dark',
  backgroundImage: null,

  // ✅ Mobile closed | Desktop open
  sidebarOpen: !isMobile,

  toggleDarkMode: () => {
    const newMode = !get().darkMode
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    set({ darkMode: newMode })
    document.documentElement.classList.toggle('dark', newMode)
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // ✅ Auto close on mobile
  closeSidebarIfMobile: () => {
    if (window.innerWidth < 768) {
      set({ sidebarOpen: false })
    }
  },

  // ✅ Fetch background (same)
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

  // ✅ Update background (same)
  updateBackground: async (url) => {
    const { useAuthStore } = await import('./authStore')
    const companyId = useAuthStore.getState().profile?.company_id

    if (!companyId) throw new Error('Company not found')

    try {
      const payload = {
        company_id: companyId,
        background_image_url: url,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('settings')
        .upsert(payload, {
          onConflict: 'company_id',
        })

      if (error) throw error

      set({ backgroundImage: url || null })
    } catch (err) {
      console.error('updateBackground error:', err)
      throw err
    }
  },

  // ✅ INITIALIZE (FIXED)
  initialize: () => {
    const isDark = get().darkMode
    document.documentElement.classList.toggle('dark', isDark)

    // ✅ Prevent multiple listeners (IMPORTANT FIX)
    if (typeof window !== 'undefined') {
      if (!window.__sidebarResizeHandler__) {
        window.__sidebarResizeHandler__ = () => {
          if (window.innerWidth < 768) {
            set({ sidebarOpen: false })
          } else {
            set({ sidebarOpen: true })
          }
        }

        window.addEventListener('resize', window.__sidebarResizeHandler__)
      }
    }
  },
}))
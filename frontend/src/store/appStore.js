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

  fetchBackground: async () => {
    const { data } = await supabase
      .from('settings')
      .select('background_image_url')
      .eq('id', 1)
      .single()
    if (data?.background_image_url) {
      set({ backgroundImage: data.background_image_url })
    }
  },

  updateBackground: async (url) => {
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 1, background_image_url: url })
    if (error) throw error
    set({ backgroundImage: url })
  },

  initialize: () => {
    // Apply dark mode from storage
    const isDark = get().darkMode
    document.documentElement.classList.toggle('dark', isDark)
    get().fetchBackground()
  },
}))
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
    try {
      const { data } = await supabase
        .from('settings')
        .select('background_image_url')
        .maybeSingle()
      if (data?.background_image_url) {
        set({ backgroundImage: data.background_image_url })
      } else {
        set({ backgroundImage: null })
      }
    } catch (e) {
      console.warn('fetchBackground error:', e)
    }
  },

  updateBackground: async (url) => {
    // Pehle check karo row hai ya nahi
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
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
        .insert({ background_image_url: url })
      if (error) throw error
    }
    set({ backgroundImage: url })
  },

  initialize: () => {
    const isDark = get().darkMode
    document.documentElement.classList.toggle('dark', isDark)
    get().fetchBackground()
  },
}))
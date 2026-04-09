import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

// Universal CRUD service
export const api = {
  async create(table, data) {
    const profile = useAuthStore.getState().profile
    if (profile?.company_id && table !== 'companies' && table !== 'settings') {
      data.company_id = profile.company_id
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },

  async get(table, query = {}) {
    let req = supabase.from(table).select(query.select || '*')
    if (query.eq) {
      Object.entries(query.eq).forEach(([col, val]) => {
        req = req.eq(col, val)
      })
    }
    if (query.order) {
      req = req.order(query.order.column, { ascending: query.order.ascending ?? true })
    }
    const { data, error } = await req
    if (error) throw error
    return data
  },

  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },

  async delete(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  },

  // ✅ Fixed: Unique channel name + pehle remove karo agar already exist kare
  subscribe(table, callback, filter = {}) {
    // Unique channel name banao - timestamp se ensure karo koi conflict na ho
    const channelName = `public:${table}:${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, ...(Object.keys(filter).length ? { filter } : {}) },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
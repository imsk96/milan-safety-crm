import { supabase } from '../lib/supabaseClient'

// Universal CRUD service
export const api = {
  async create(table, data) {
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

  // Real-time subscription helper
  subscribe(table, callback, filter = {}) {
    let subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter }, callback)
      .subscribe()
    return () => supabase.removeChannel(subscription)
  },
}
import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'

export const userService = {
  async list() {
    const { data, error } = await supabase
      .from(TABLES.users)
      .select('id, name, first_name, last_name, email, mobile, role, is_active, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(TABLES.users)
      .insert(payload)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLES.users)
      .update(payload)
      .eq('id', id)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },
}


import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'

export const holidayService = {
  async list() {
    const { data, error } = await supabase
      .from(TABLES.holidays)
      .select('id, name, start_date, end_date, description, created_at, updated_at')
      .order('start_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(TABLES.holidays)
      .insert(payload)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLES.holidays)
      .update(payload)
      .eq('id', id)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async remove(id) {
    const { error } = await supabase.from(TABLES.holidays).delete().eq('id', id)
    if (error) throw error
    return true
  },
}

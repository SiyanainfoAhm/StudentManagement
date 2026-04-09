import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'

export const classService = {
  async list() {
    const { data, error } = await supabase
      .from(TABLES.classes)
      .select('id, class_name, section')
      .order('class_name', { ascending: true })
      .order('section', { ascending: true })
    if (error) throw error
    return data || []
  },
}


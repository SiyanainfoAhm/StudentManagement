import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'

export const studentService = {
  async list({ search, classId, gender } = {}) {
    let q = supabase
      .from(TABLES.students)
      .select(
        'id, admission_no, first_name, last_name, dob, gender, mobile, email, address, admission_date, guardian_name, guardian_mobile, class_id, created_at, student_management_classes:class_id(id,class_name,section)'
      )
      .order('created_at', { ascending: false })

    if (classId) q = q.eq('class_id', classId)
    if (gender) q = q.eq('gender', gender)

    // MVP: basic search via OR with ilike
    const s = (search || '').trim()
    if (s) {
      q = q.or(
        [
          `first_name.ilike.%${s}%`,
          `last_name.ilike.%${s}%`,
          `mobile.ilike.%${s}%`,
          `email.ilike.%${s}%`,
          `admission_no.ilike.%${s}%`,
        ].join(',')
      )
    }

    const { data, error } = await q
    if (error) throw error
    return data || []
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(TABLES.students)
      .insert(payload)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLES.students)
      .update(payload)
      .eq('id', id)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async remove(id) {
    const { error } = await supabase.from(TABLES.students).delete().eq('id', id)
    if (error) throw error
    return true
  },
}


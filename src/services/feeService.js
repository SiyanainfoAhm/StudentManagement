import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'

export const feeService = {
  async list({ status, classId, paymentMode } = {}) {
    let q = supabase
      .from(TABLES.fees)
      .select(
        'id, student_id, fee_month, fee_year, amount, payment_date, payment_mode, status, remarks, created_at, student_management_students:student_id(first_name,last_name, class_id, student_management_classes:class_id(class_name,section))'
      )
      .order('created_at', { ascending: false })

    if (status) q = q.eq('status', status)
    if (paymentMode) q = q.eq('payment_mode', paymentMode)
    if (classId) q = q.eq('student_management_students.class_id', classId)

    const { data, error } = await q
    if (error) throw error
    return data || []
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(TABLES.fees)
      .insert(payload)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLES.fees)
      .update(payload)
      .eq('id', id)
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
    if (error) throw error
    return data?.[0] || null
  },
}


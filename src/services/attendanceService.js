import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'

export const attendanceService = {
  async getForClassAndDate({ classId, date }) {
    // 1) students in class
    const studentsRes = await supabase
      .from(TABLES.students)
      .select('id, first_name, last_name, admission_no, class_id')
      .eq('class_id', classId)
      .order('first_name', { ascending: true })

    if (studentsRes.error) throw studentsRes.error

    // 2) existing attendance for those students for date
    const ids = (studentsRes.data || []).map((s) => s.id)
    if (ids.length === 0) return { students: [], attendanceByStudentId: {} }

    const attRes = await supabase
      .from(TABLES.attendance)
      .select('id, student_id, attendance_date, status, remarks, marked_by')
      .eq('attendance_date', date)
      .in('student_id', ids)

    if (attRes.error) throw attRes.error

    const map = {}
    for (const a of attRes.data || []) map[a.student_id] = a
    return { students: studentsRes.data || [], attendanceByStudentId: map }
  },

  async upsertBulk({ rows }) {
    const { error } = await supabase.from(TABLES.attendance).upsert(rows, {
      onConflict: 'student_id,attendance_date',
    })
    if (error) throw error
    return true
  },
}


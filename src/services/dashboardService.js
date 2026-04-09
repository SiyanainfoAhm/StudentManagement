import { subDays, format } from 'date-fns'
import { supabase } from './supabaseClient.js'
import { TABLES } from '../utils/constants.js'
import { formatDate } from '../utils/formatters.js'

function monthLabel(year, month) {
  const d = new Date(year, month - 1, 1)
  return format(d, 'MMM yy')
}

export const dashboardService = {
  async getSummary() {
    const { data, error } = await supabase.from(TABLES.dashboardSummaryView).select('*').limit(1)
    if (error) throw error
    return data?.[0] || null
  },

  async getAttendanceOverviewWeek() {
    const start = subDays(new Date(), 6)
    const startStr = format(start, 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from(TABLES.attendance)
      .select('attendance_date, status')
      .gte('attendance_date', startStr)

    if (error) throw error

    const map = new Map()
    for (let i = 0; i < 7; i++) {
      const d = subDays(new Date(), 6 - i)
      const key = format(d, 'yyyy-MM-dd')
      map.set(key, { label: format(d, 'EEE'), present: 0 })
    }

    for (const row of data || []) {
      const key = row.attendance_date
      const item = map.get(key)
      if (!item) continue
      if (row.status === 'present') item.present += 1
    }

    return Array.from(map.values())
  },

  async getFeesCollectionByMonth() {
    // Simple MVP approach: last 6 months paid sums (client aggregation)
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
    }

    const { data, error } = await supabase
      .from(TABLES.fees)
      .select('fee_month, fee_year, amount, status')
      .eq('status', 'paid')

    if (error) throw error

    return months.map((m) => {
      const sum =
        (data || [])
          .filter((x) => x.fee_year === m.year && x.fee_month === m.month)
          .reduce((acc, x) => acc + Number(x.amount || 0), 0) || 0
      return { label: monthLabel(m.year, m.month), amount: Math.round(sum) }
    })
  },

  async getStudentsByClass() {
    const { data, error } = await supabase
      .from(TABLES.students)
      .select('id, class_id, student_management_classes:class_id(class_name, section)')

    if (error) throw error

    const map = new Map()
    for (const s of data || []) {
      const c = s.student_management_classes
      const label = c ? `${c.class_name}-${c.section}` : 'Unassigned'
      map.set(label, (map.get(label) || 0) + 1)
    }

    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 10)
  },

  async getRecentActivities() {
    // Demo-friendly: combine last few attendance marks & fee payments
    const [att, fees] = await Promise.all([
      supabase
        .from(TABLES.attendance)
        .select(
          'id, attendance_date, status, created_at, student_management_students:student_id(first_name,last_name)'
        )
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from(TABLES.fees)
        .select(
          'id, status, amount, payment_date, created_at, student_management_students:student_id(first_name,last_name)'
        )
        .order('created_at', { ascending: false })
        .limit(6),
    ])

    if (att.error) throw att.error
    if (fees.error) throw fees.error

    const items = []
    for (const a of att.data || []) {
      const s = a.student_management_students
      items.push({
        id: `att_${a.id}`,
        title: `${s?.first_name || ''} ${s?.last_name || ''} marked ${a.status}`,
        sub: `Attendance • ${formatDate(a.attendance_date, 'dd MMM')}`,
        time: formatDate(a.created_at, 'p'),
        sortKey: a.created_at,
      })
    }
    for (const f of fees.data || []) {
      const s = f.student_management_students
      items.push({
        id: `fee_${f.id}`,
        title:
          f.status === 'paid'
            ? `Fee received from ${s?.first_name || ''} ${s?.last_name || ''}`
            : `Fee pending for ${s?.first_name || ''} ${s?.last_name || ''}`,
        sub: `Fees • ₹${Number(f.amount || 0).toFixed(0)}`,
        time: formatDate(f.created_at, 'p'),
        sortKey: f.created_at,
      })
    }

    return items.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)).slice(0, 8)
  },

  async getPendingFeesQuickList() {
    const { data, error } = await supabase
      .from(TABLES.fees)
      .select(
        'id, amount, fee_month, fee_year, student_management_students:student_id(first_name,last_name, class_id, student_management_classes:class_id(class_name,section))'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error

    return (data || []).map((x) => {
      const s = x.student_management_students
      const c = s?.student_management_classes
      return {
        id: x.id,
        student: `${s?.first_name || ''} ${s?.last_name || ''}`.trim(),
        classLabel: c ? `${c.class_name}-${c.section}` : 'Unassigned',
        amount: x.amount,
      }
    })
  },
}


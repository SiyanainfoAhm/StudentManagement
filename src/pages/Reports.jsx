import React, { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Printer } from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardService } from '../services/dashboardService.js'
import { classService } from '../services/classService.js'
import { supabase } from '../services/supabaseClient.js'
import { formatMoneyINR } from '../utils/formatters.js'
import { Button } from '../components/ui/Button.jsx'
import { format, subDays } from 'date-fns'
import { TABLES } from '../utils/constants.js'

function ChartSkeleton({ title, showTotal }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-4 w-56 rounded bg-slate-100" />
        {showTotal ? <div className="h-3 w-28 rounded bg-slate-100" /> : null}
      </div>
      <div className="mt-4 h-[280px] rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-100 p-4">
        <div className="grid h-full grid-cols-12 items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg bg-slate-100"
              style={{ height: `${30 + (i % 6) * 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Reports() {
  const [loading, setLoading] = useState(true)
  const [studentsByClass, setStudentsByClass] = useState([])
  const [feesByMonth, setFeesByMonth] = useState([])
  const [attendancePct, setAttendancePct] = useState([])

  useEffect(() => {
    let ok = true
    async function run() {
      setLoading(true)
      try {
        const [sbc, fbm] = await Promise.all([
          dashboardService.getStudentsByClass(),
          dashboardService.getFeesCollectionByMonth(),
        ])

        // Attendance % summary (last 7 days) by class
        // Optimized: single query + client aggregation
        const cls = await classService.list()
        const startStr = format(subDays(new Date(), 6), 'yyyy-MM-dd')

        const { data: att, error: attErr } = await supabase
          .from(TABLES.attendance)
          .select(
            'status, student_management_students:student_id(class_id, student_management_classes:class_id(class_name,section))'
          )
          .gte('attendance_date', startStr)

        if (attErr) throw attErr

        const totals = new Map() // label -> { present, total }
        for (const c of cls.slice(0, 10)) {
          const label = `${c.class_name}-${c.section}`
          totals.set(label, { present: 0, total: 0 })
        }

        for (const row of att || []) {
          const s = row.student_management_students
          const c = s?.student_management_classes
          if (!c) continue
          const label = `${c.class_name}-${c.section}`
          const agg = totals.get(label)
          if (!agg) continue
          agg.total += 1
          if (row.status === 'present') agg.present += 1
        }

        const pctRows = Array.from(totals.entries()).map(([label, v]) => ({
          label,
          pct: v.total ? Math.round((v.present / v.total) * 100) : 0,
        }))

        if (!ok) return
        setStudentsByClass(sbc)
        setFeesByMonth(fbm)
        setAttendancePct(pctRows)
      } catch (e) {
        toast.error(e?.message || 'Failed to load reports.')
      } finally {
        if (ok) setLoading(false)
      }
    }
    run()
    return () => {
      ok = false
    }
  }, [])

  const feesTotal = useMemo(() => feesByMonth.reduce((acc, x) => acc + Number(x.amount || 0), 0), [feesByMonth])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Summary</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">Reports</div>
            <div className="mt-1 text-sm text-slate-600">
              Simple, printable KPIs for meetings (counts, collections, attendance %).
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              tone="outline"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      <div className="printable-reports print:space-y-3">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 print:grid-cols-1">
            <ChartSkeleton title="Student count by class" />
            <ChartSkeleton title="Monthly fee collection" showTotal />
            <ChartSkeleton title="Attendance % (last 7 days)" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 print:grid-cols-1">
          <div className="print-chart-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
            <div className="text-sm font-semibold text-slate-900">Student count by class</div>
            <div className="print-chart mt-3 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByClass} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="print-chart-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Monthly fee collection</div>
              <div className="text-xs text-slate-500">Total: {formatMoneyINR(feesTotal)}</div>
            </div>
            <div className="print-chart mt-3 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feesByMonth} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="print-chart-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
            <div className="text-sm font-semibold text-slate-900">Attendance % (last 7 days)</div>
            <div className="print-chart mt-3 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendancePct} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="pct" fill="#10b981" radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  )
}


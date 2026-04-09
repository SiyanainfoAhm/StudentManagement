import React, { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Printer, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardService } from '../services/dashboardService.js'
import { feeService } from '../services/feeService.js'
import { attendanceService } from '../services/attendanceService.js'
import { classService } from '../services/classService.js'
import { formatMoneyINR } from '../utils/formatters.js'
import { Button } from '../components/ui/Button.jsx'
import { format, subDays } from 'date-fns'

function downloadJson(name, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
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

        // Attendance % summary (last 7 days) by class (simple + demo-friendly)
        const cls = await classService.list()
        const end = new Date()
        const start = subDays(end, 6)
        const days = []
        for (let i = 0; i < 7; i++) days.push(format(subDays(end, 6 - i), 'yyyy-MM-dd'))

        const pctRows = []
        for (const c of cls.slice(0, 8)) {
          // for each class/day, load once; still ok for MVP size
          let present = 0
          let total = 0
          for (const d of days) {
            const res = await attendanceService.getForClassAndDate({ classId: c.id, date: d })
            total += res.students.length
            for (const s of res.students) {
              if ((res.attendanceByStudentId?.[s.id]?.status || 'present') === 'present') present += 1
            }
          }
          const pct = total === 0 ? 0 : Math.round((present / total) * 100)
          pctRows.push({ label: `${c.class_name}-${c.section}`, pct })
        }

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

  const exportPayload = useMemo(
    () => ({ studentsByClass, feesByMonth, attendancePct, exportedAt: new Date().toISOString() }),
    [studentsByClass, feesByMonth, attendancePct]
  )

  const feesTotal = useMemo(() => feesByMonth.reduce((acc, x) => acc + Number(x.amount || 0), 0), [feesByMonth])

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
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
            <Button
              tone="indigo"
              onClick={() => downloadJson('student-management-report.json', exportPayload)}
            >
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading reports…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
            <div className="text-sm font-semibold text-slate-900">Student count by class</div>
            <div className="mt-3 h-[280px]">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Monthly fee collection</div>
              <div className="text-xs text-slate-500">Total: {formatMoneyINR(feesTotal)}</div>
            </div>
            <div className="mt-3 h-[280px]">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
            <div className="text-sm font-semibold text-slate-900">Attendance % (last 7 days)</div>
            <div className="mt-3 h-[280px]">
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
  )
}


import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, Users, School, ClipboardCheck, IndianRupee, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardService } from '../services/dashboardService.js'
import { formatMoneyINR } from '../utils/formatters.js'
import { safeNumber } from '../utils/helpers.js'

function KpiCard({ title, value, icon: Icon, tone = 'indigo', sub }) {
  const tones = {
    indigo: 'from-indigo-600 to-blue-600',
    slate: 'from-slate-800 to-slate-700',
    emerald: 'from-emerald-600 to-teal-600',
    amber: 'from-amber-600 to-orange-600',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
          {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
        </div>
        <div
          className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${tones[tone]} text-white grid place-items-center shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
      <div className="mt-3 h-[260px]">{children}</div>
    </div>
  )
}

export function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [attendanceWeek, setAttendanceWeek] = useState([])
  const [feesByMonth, setFeesByMonth] = useState([])
  const [studentsByClass, setStudentsByClass] = useState([])
  const [recent, setRecent] = useState([])
  const [pendingFees, setPendingFees] = useState([])

  useEffect(() => {
    let ok = true
    async function run() {
      setLoading(true)
      try {
        const [s, a, f, c, r, p] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getAttendanceOverviewWeek(),
          dashboardService.getFeesCollectionByMonth(),
          dashboardService.getStudentsByClass(),
          dashboardService.getRecentActivities(),
          dashboardService.getPendingFeesQuickList(),
        ])
        if (!ok) return
        setSummary(s)
        setAttendanceWeek(a)
        setFeesByMonth(f)
        setStudentsByClass(c)
        setRecent(r)
        setPendingFees(p)
      } catch (e) {
        toast.error(e?.message || 'Failed to load dashboard.')
      } finally {
        if (ok) setLoading(false)
      }
    }
    run()
    return () => {
      ok = false
    }
  }, [])

  const kpis = useMemo(() => {
    const totalStudents = safeNumber(summary?.total_students)
    const totalClasses = safeNumber(summary?.total_classes)
    const todayPresent = safeNumber(summary?.today_present)
    const pendingFeesCount = safeNumber(summary?.pending_fees_count)
    const feesCollected = safeNumber(summary?.fees_collected_this_month)
    return { totalStudents, totalClasses, todayPresent, pendingFeesCount, feesCollected }
  }, [summary])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Overview</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard snapshot
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Attendance trends, fee collections, and quick actions for today.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Total Students"
          value={loading ? '—' : kpis.totalStudents}
          icon={Users}
          tone="indigo"
        />
        <KpiCard
          title="Total Classes"
          value={loading ? '—' : kpis.totalClasses}
          icon={School}
          tone="slate"
        />
        <KpiCard
          title="Today Present"
          value={loading ? '—' : kpis.todayPresent}
          icon={ClipboardCheck}
          tone="emerald"
        />
        <KpiCard
          title="Pending Fees"
          value={loading ? '—' : kpis.pendingFeesCount}
          icon={AlertTriangle}
          tone="amber"
        />
        <KpiCard
          title="Collected (This Month)"
          value={loading ? '—' : formatMoneyINR(kpis.feesCollected)}
          icon={IndianRupee}
          tone="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Attendance overview (last 7 days)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceWeek} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="present" stroke="#4f46e5" fill="url(#att)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Fees collection (last 6 months)">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feesByMonth} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="amount" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="space-y-4">
          <ChartCard title="Students by class">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentsByClass} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Recent activities</div>
            <div className="mt-3 space-y-3">
              {recent.length === 0 ? (
                <div className="text-sm text-slate-500">No recent activity yet.</div>
              ) : (
                recent.slice(0, 6).map((x) => (
                  <div key={x.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{x.title}</div>
                      <div className="text-xs text-slate-500">{x.sub}</div>
                    </div>
                    <div className="shrink-0 text-[11px] text-slate-400">{x.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Pending fees</div>
              <div className="text-xs text-slate-500">Quick list</div>
            </div>
            <div className="mt-3 space-y-3">
              {pendingFees.length === 0 ? (
                <div className="text-sm text-slate-500">All caught up.</div>
              ) : (
                pendingFees.slice(0, 6).map((x) => (
                  <div key={x.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{x.student}</div>
                      <div className="text-xs text-slate-500">{x.classLabel}</div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatMoneyINR(x.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


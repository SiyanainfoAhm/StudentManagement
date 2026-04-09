import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ClipboardCheck, Save, Users2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import { classService } from '../services/classService.js'
import { attendanceService } from '../services/attendanceService.js'
import { Button } from '../components/ui/Button.jsx'
import { Select } from '../components/ui/Select.jsx'

function pill(status) {
  if (status === 'present') return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
  if (status === 'absent') return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
  return 'bg-slate-50 text-slate-700 ring-1 ring-slate-100'
}

export function Attendance() {
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [students, setStudents] = useState([])
  const [statusById, setStatusById] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const cls = await classService.list()
        setClasses(cls)
        setClassId(cls?.[0]?.id || '')
      } catch (e) {
        toast.error(e?.message || 'Failed to load classes.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const classOptions = useMemo(
    () => [
      { value: '', label: 'Select class' },
      ...classes.map((c) => ({ value: c.id, label: `${c.class_name}-${c.section}` })),
    ],
    [classes]
  )

  async function loadAttendance() {
    if (!classId || !dateStr) return
    setLoading(true)
    try {
      const res = await attendanceService.getForClassAndDate({ classId, date: dateStr })
      setStudents(res.students)
      const next = {}
      for (const s of res.students) {
        next[s.id] = res.attendanceByStudentId?.[s.id]?.status || 'present'
      }
      setStatusById(next)
    } catch (e) {
      toast.error(e?.message || 'Failed to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, dateStr])

  const summary = useMemo(() => {
    let present = 0
    let absent = 0
    for (const id of Object.keys(statusById || {})) {
      if (statusById[id] === 'present') present++
      if (statusById[id] === 'absent') absent++
    }
    return { present, absent, total: present + absent }
  }, [statusById])

  const setAll = (status) => {
    const next = {}
    for (const s of students) next[s.id] = status
    setStatusById(next)
  }

  const toggleOne = (id) => {
    setStatusById((prev) => ({
      ...prev,
      [id]: prev?.[id] === 'present' ? 'absent' : 'present',
    }))
  }

  const save = async () => {
    if (!classId) {
      toast.error('Select a class.')
      return
    }
    if (!dateStr) {
      toast.error('Select a date.')
      return
    }
    if (students.length === 0) {
      toast.error('No students in this class.')
      return
    }

    setSaving(true)
    try {
      const rows = students.map((s) => ({
        student_id: s.id,
        attendance_date: dateStr,
        status: statusById[s.id] || 'present',
        marked_by: user?.id || null,
        remarks: null,
      }))
      await attendanceService.upsertBulk({ rows })
      toast.success('Attendance saved.')
      await loadAttendance()
    } catch (e) {
      toast.error(e?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Daily</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">Attendance</div>
            <div className="mt-1 text-sm text-slate-600">
              Bulk mark and save once. Duplicate entries are prevented by the unique constraint.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button tone="outline" onClick={() => setAll('present')} disabled={loading || saving}>
              Mark all Present
            </Button>
            <Button tone="outline" onClick={() => setAll('absent')} disabled={loading || saving}>
              Mark all Absent
            </Button>
            <Button tone="indigo" onClick={save} disabled={loading || saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save attendance'}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium text-slate-700">Date</div>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-4"
            />
          </div>
          <Select
            label="Class"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            options={classOptions}
          />
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Summary</div>
              <ClipboardCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-semibold ring-1 ring-emerald-100 bg-emerald-50 text-emerald-700">
                Present: {summary.present}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs font-semibold ring-1 ring-rose-100 bg-rose-50 text-rose-700">
                Absent: {summary.absent}
              </span>
              <span className="text-xs text-slate-500">Total: {summary.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">
            Students <span className="text-slate-400">({students.length})</span>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Users2 className="h-4 w-4" /> Toggle status per student
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            No students found for this class.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Admission</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => {
                  const st = statusById[s.id] || 'present'
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 text-slate-700">{s.admission_no || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {s.first_name} {s.last_name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${pill(st)}`}>
                          {st}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => toggleOne(s.id)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


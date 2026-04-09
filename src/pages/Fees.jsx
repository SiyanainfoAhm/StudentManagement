import React, { useEffect, useMemo, useState } from 'react'
import { Plus, IndianRupee, AlertTriangle, CheckCircle2, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { classService } from '../services/classService.js'
import { studentService } from '../services/studentService.js'
import { feeService } from '../services/feeService.js'
import { PAYMENT_MODES } from '../utils/constants.js'
import { formatMoneyINR, formatDate } from '../utils/formatters.js'
import { Button } from '../components/ui/Button.jsx'
import { Select } from '../components/ui/Select.jsx'
import { FeePaymentModal } from '../components/fees/FeePaymentModal.jsx'

function StatusPill({ status }) {
  const cls =
    status === 'paid'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
      : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{status}</span>
}

export function Fees() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [status, setStatus] = useState('')
  const [classId, setClassId] = useState('')
  const [paymentMode, setPaymentMode] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  async function loadAll() {
    setLoading(true)
    try {
      const [cls, studs, fees] = await Promise.all([
        classService.list(),
        studentService.list(),
        feeService.list({ status, classId, paymentMode }),
      ])
      setClasses(cls)
      setStudents(studs.map((s) => ({ id: s.id, first_name: s.first_name, last_name: s.last_name })))
      setRows(fees)
    } catch (e) {
      toast.error(e?.message || 'Failed to load fees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadAll(), 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, classId, paymentMode])

  const classOptions = useMemo(
    () => [{ value: '', label: 'All classes' }, ...classes.map((c) => ({ value: c.id, label: `${c.class_name}-${c.section}` }))],
    [classes]
  )

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All status' },
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
    ],
    []
  )

  const paymentOptions = useMemo(
    () => [
      { value: '', label: 'All modes' },
      ...PAYMENT_MODES.map((m) => ({ value: m.value, label: m.label })),
    ],
    []
  )

  const summary = useMemo(() => {
    const pending = rows.filter((x) => x.status === 'pending')
    const paid = rows.filter((x) => x.status === 'paid')
    const paidSum = paid.reduce((acc, x) => acc + Number(x.amount || 0), 0)
    return { pendingCount: pending.length, paidCount: paid.length, paidSum }
  }, [rows])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setModalOpen(true)
  }

  const onSave = async (payload) => {
    try {
      if (editing?.id) await feeService.update(editing.id, payload)
      else await feeService.create(payload)
      toast.success('Fee saved.')
      setModalOpen(false)
      setEditing(null)
      await loadAll()
    } catch (e) {
      toast.error(e?.message || 'Save failed.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Billing</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">Fees</div>
            <div className="mt-1 text-sm text-slate-600">
              Track paid and pending entries. Highlight overdue/pending nicely for demo.
            </div>
          </div>
          <Button tone="indigo" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add payment
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={statusOptions} />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions} />
          <Select label="Payment mode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} options={paymentOptions} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-indigo-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Paid (count)</div>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{summary.paidCount}</div>
            <div className="mt-1 text-xs text-slate-500">This filtered list</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-amber-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Pending (count)</div>
              <AlertTriangle className="h-4 w-4 text-amber-700" />
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{summary.pendingCount}</div>
            <div className="mt-1 text-xs text-slate-500">Follow-up needed</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Paid amount</div>
              <IndianRupee className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{formatMoneyINR(summary.paidSum)}</div>
            <div className="mt-1 text-xs text-slate-500">Across paid entries</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">Fees list</div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Filter className="h-4 w-4" /> Click a row to edit
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">No fee entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((x) => {
                  const s = x.student_management_students
                  const c = s?.student_management_classes
                  const monthLabel = format(new Date(x.fee_year, x.fee_month - 1, 1), 'MMM yyyy')
                  const overdue = x.status === 'pending'
                  return (
                    <tr
                      key={x.id}
                      onClick={() => openEdit(x)}
                      className={`cursor-pointer hover:bg-slate-50/60 ${overdue ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {s?.first_name} {s?.last_name}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{c ? `${c.class_name}-${c.section}` : '—'}</td>
                      <td className="px-5 py-4 text-slate-700">{monthLabel}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{formatMoneyINR(x.amount)}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={x.status} />
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {x.status === 'paid'
                          ? `${formatDate(x.payment_date)} • ${x.payment_mode || '—'}`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FeePaymentModal
        open={modalOpen}
        students={students}
        initial={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSave={onSave}
      />
    </div>
  )
}


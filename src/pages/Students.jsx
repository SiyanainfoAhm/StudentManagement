import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Pencil, Trash2, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import { ROLES } from '../utils/constants.js'
import { initials } from '../utils/helpers.js'
import { classService } from '../services/classService.js'
import { studentService } from '../services/studentService.js'
import { Button } from '../components/ui/Button.jsx'
import { Select } from '../components/ui/Select.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { StudentFormModal } from '../components/students/StudentFormModal.jsx'

function Avatar({ first, last }) {
  return (
    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white grid place-items-center text-xs font-semibold shadow-sm">
      {initials(first, last)}
    </div>
  )
}

export function Students() {
  const { user } = useAuth()
  const canDelete = user?.role === ROLES.admin

  const [classes, setClasses] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [classId, setClassId] = useState('')
  const [gender, setGender] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [activeStudent, setActiveStudent] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmBusy, setConfirmBusy] = useState(false)

  async function loadAll() {
    setLoading(true)
    try {
      const [cls, students] = await Promise.all([
        classService.list(),
        studentService.list({ search, classId, gender }),
      ])
      setClasses(cls)
      setRows(students)
    } catch (e) {
      toast.error(e?.message || 'Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadAll(), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, classId, gender])

  const classOptions = useMemo(
    () => [
      { value: '', label: 'All classes' },
      ...classes.map((c) => ({ value: c.id, label: `${c.class_name}-${c.section}` })),
    ],
    [classes]
  )

  const genderOptions = useMemo(
    () => [
      { value: '', label: 'All genders' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ],
    []
  )

  const openCreate = () => {
    setActiveStudent(null)
    setFormMode('create')
    setFormOpen(true)
  }
  const openEdit = (s) => {
    setActiveStudent(s)
    setFormMode('edit')
    setFormOpen(true)
  }

  const askDelete = (s) => {
    if (!canDelete) {
      toast.error('Teachers cannot delete records.')
      return
    }
    setActiveStudent(s)
    setConfirmOpen(true)
  }

  const onDelete = async () => {
    if (!activeStudent?.id) return
    setConfirmBusy(true)
    try {
      await studentService.remove(activeStudent.id)
      toast.success('Student deleted.')
      setConfirmOpen(false)
      setActiveStudent(null)
      await loadAll()
    } catch (e) {
      toast.error(e?.message || 'Delete failed.')
    } finally {
      setConfirmBusy(false)
    }
  }

  const onSave = async (payload) => {
    if (formMode === 'edit') {
      await studentService.update(activeStudent.id, payload)
    } else {
      await studentService.create(payload)
    }
    await loadAll()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Directory</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">Students</div>
            <div className="mt-1 text-sm text-slate-600">
              Search, filter, and manage student profiles.
            </div>
          </div>
          <Button tone="indigo" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add student
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-indigo-200 focus:ring-4"
              placeholder="Search name, mobile, email, admission…"
            />
          </div>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions} />
          <Select value={gender} onChange={(e) => setGender(e.target.value)} options={genderOptions} />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">
            Student list <span className="text-slate-400">({rows.length})</span>
          </div>
          <div className="text-xs text-slate-500">{canDelete ? 'Admin access' : 'Teacher access'}</div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading students…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-900">No students found</div>
            <div className="mt-1 text-sm text-slate-600">Try changing filters or add a student.</div>
            <div className="mt-4 flex justify-center">
              <Button tone="indigo" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add student
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Class</th>
                  <th className="px-5 py-3 font-medium">Mobile</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((s) => {
                  const c = s.student_management_classes
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar first={s.first_name} last={s.last_name} />
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">
                              {s.first_name} {s.last_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {s.admission_no ? `Admission: ${s.admission_no}` : '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {c ? `${c.class_name}-${c.section}` : 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{s.mobile || '—'}</td>
                      <td className="px-5 py-4 text-slate-700">{s.email || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(s)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => askDelete(s)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StudentFormModal
        open={formOpen}
        mode={formMode}
        classes={classes}
        initial={activeStudent}
        onClose={() => setFormOpen(false)}
        onSave={onSave}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete student?"
        description="This will permanently remove the student and their related fees/attendance entries."
        confirmText="Delete"
        onClose={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        busy={confirmBusy}
      />
    </div>
  )
}


import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, CalendarRange, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { holidayService } from '../services/holidayService.js'
import { useAuth } from '../hooks/useAuth.js'
import { ROLES } from '../utils/constants.js'
import { formatDate } from '../utils/formatters.js'
import { inclusiveHolidayDayCount } from '../utils/holidayHelpers.js'
import { Button } from '../components/ui/Button.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { HolidayFormModal } from '../components/holidays/HolidayFormModal.jsx'

export function Holidays() {
  const { user } = useAuth()
  const canManage = user?.role === ROLES.admin

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await holidayService.list()
      setRows(data)
    } catch (e) {
      toast.error(e?.message || 'Failed to load holidays.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
    )
  }, [rows, search])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (h) => {
    setEditing(h)
    setFormOpen(true)
  }

  const onSave = async (payload) => {
    if (editing?.id) await holidayService.update(editing.id, payload)
    else await holidayService.create(payload)
    await load()
  }

  const askDelete = (h) => {
    setToDelete(h)
    setConfirmOpen(true)
  }

  const doDelete = async () => {
    if (!toDelete?.id) return
    setConfirmBusy(true)
    try {
      await holidayService.remove(toDelete.id)
      toast.success('Holiday removed.')
      setConfirmOpen(false)
      setToDelete(null)
      await load()
    } catch (e) {
      toast.error(e?.message || 'Delete failed.')
    } finally {
      setConfirmBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Calendar</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">Holidays</div>
            <div className="mt-1 text-sm text-slate-600">
              {canManage
                ? 'Add or edit single-day or multi-day holidays (e.g. Diwali — set start and end dates).'
                : 'School holiday calendar (view only). Contact an admin to add or change entries.'}
            </div>
          </div>
          {canManage ? (
            <Button tone="indigo" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add holiday
            </Button>
          ) : null}
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-indigo-200 focus:ring-4"
            placeholder="Search by name or description…"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">
            Holiday periods <span className="text-slate-400">({filtered.length})</span>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <CalendarRange className="h-4 w-4" />
            {canManage ? 'Inclusive date ranges' : 'View only'}
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading holidays…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">
            {canManage
              ? 'No holidays yet. Add Diwali, national holidays, or school breaks.'
              : 'No holidays have been published yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Date range</th>
                  <th className="px-5 py-3 font-medium">Days</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                  {canManage ? <th className="px-5 py-3 font-medium text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((h) => {
                  const days = inclusiveHolidayDayCount(h.start_date, h.end_date)
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-semibold text-slate-900">{h.name}</td>
                      <td className="px-5 py-4 text-slate-700">
                        {formatDate(h.start_date)} — {formatDate(h.end_date)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                          {days} day{days === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="max-w-xs truncate px-5 py-4 text-slate-600">{h.description || '—'}</td>
                      {canManage ? (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(h)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(h)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                            >
                              <Trash2 className="h-4 w-4 text-rose-600" />
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage ? (
        <HolidayFormModal
          open={formOpen}
          initial={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSave={onSave}
        />
      ) : null}

      <ConfirmDialog
        open={confirmOpen && canManage}
        title="Delete holiday?"
        description={toDelete ? `Remove “${toDelete.name}” (${formatDate(toDelete.start_date)} – ${formatDate(toDelete.end_date)})?` : undefined}
        confirmText="Delete"
        onClose={() => {
          setConfirmOpen(false)
          setToDelete(null)
        }}
        onConfirm={doDelete}
        busy={confirmBusy}
      />
    </div>
  )
}

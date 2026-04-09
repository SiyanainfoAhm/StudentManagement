import React, { useEffect, useState } from 'react'
import { Plus, Shield, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { userService } from '../services/userService.js'
import { Button } from '../components/ui/Button.jsx'
import { UserFormModal } from '../components/users/UserFormModal.jsx'
import { ResetPasswordModal } from '../components/users/ResetPasswordModal.jsx'

function RolePill({ role }) {
  const cls =
    role === 'admin'
      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
      : 'bg-slate-50 text-slate-700 ring-1 ring-slate-100'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{role}</span>
}

function ActivePill({ active }) {
  const cls = active
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {active ? 'active' : 'inactive'}
    </span>
  )
}

export function Users() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [resetOpen, setResetOpen] = useState(false)
  const [resetUser, setResetUser] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await userService.list()
      setRows(data)
    } catch (e) {
      toast.error(e?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (u) => {
    setEditing(u)
    setModalOpen(true)
  }

  const onSave = async (payload) => {
    if (editing?.id) await userService.update(editing.id, payload)
    else await userService.create(payload)
    await load()
  }

  const toggleActive = async (u) => {
    try {
      await userService.update(u.id, { is_active: !u.is_active })
      toast.success('Updated.')
      await load()
    } catch (e) {
      toast.error(e?.message || 'Update failed.')
    }
  }

  const openReset = (u) => {
    setResetUser(u)
    setResetOpen(true)
  }

  const doReset = async (payload) => {
    await userService.update(resetUser.id, payload)
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">Admin</div>
            <div className="text-2xl font-semibold tracking-tight text-slate-900">Users</div>
            <div className="mt-1 text-sm text-slate-600">
              Manage admin/teacher access. Teachers cannot access this module.
            </div>
          </div>
          <Button tone="indigo" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">User list</div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Shield className="h-4 w-4" /> Admin-only
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-600">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.mobile || '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{u.email}</td>
                    <td className="px-5 py-4">
                      <RolePill role={u.role} />
                    </td>
                    <td className="px-5 py-4">
                      <ActivePill active={u.is_active} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openReset(u)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          <KeyRound className="h-4 w-4 text-rose-600" />
                          Reset password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSave={onSave}
      />

      <ResetPasswordModal
        open={resetOpen}
        user={resetUser}
        onClose={() => {
          setResetOpen(false)
          setResetUser(null)
        }}
        onReset={doReset}
      />
    </div>
  )
}


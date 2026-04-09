import React, { useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UsersRound,
  GraduationCap,
  ClipboardCheck,
  IndianRupee,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { ROLES } from '../../utils/constants.js'

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-sm shadow-indigo-200 grid place-items-center text-white font-semibold">
        SM
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-900">Student Management</div>
      </div>
    </div>
  )
}

function SidebarItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
          isActive
            ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
            : 'text-slate-700 hover:bg-slate-100',
        ].join(' ')
      }
    >
      <Icon className="h-4.5 w-4.5 opacity-90" />
      <span className="font-medium">{label}</span>
    </NavLink>
  )
}

function Topbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = useMemo(() => {
    const p = location.pathname
    if (p.includes('/students')) return 'Students'
    if (p.includes('/attendance')) return 'Attendance'
    if (p.includes('/fees')) return 'Fees'
    if (p.includes('/reports')) return 'Reports'
    if (p.includes('/users')) return 'Users'
    return 'Dashboard'
  }, [location.pathname])

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-6">
        <div>
          <div className="text-sm text-slate-500">Student Management System</div>
          <div className="text-lg font-semibold tracking-tight text-slate-900">{title}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-xs font-medium text-slate-900">{user?.name}</div>
            <div className="text-[11px] text-slate-500 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppShell() {
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.admin

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-5 lg:flex print:hidden">
          <Brand />
          <div className="mt-6 space-y-1">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/students" icon={GraduationCap} label="Students" />
            <SidebarItem to="/attendance" icon={ClipboardCheck} label="Attendance" />
            <SidebarItem to="/fees" icon={IndianRupee} label="Fees" />
            <SidebarItem to="/reports" icon={FileText} label="Reports" />
            {isAdmin ? <SidebarItem to="/users" icon={UsersRound} label="Users" /> : null}
          </div>

          
        </aside>

        <div className="min-w-0 flex-1">
          <Topbar />
          <main className="mx-auto max-w-[1400px] px-4 py-6 lg:px-6 print:px-0 print:py-0 print:max-w-none">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}


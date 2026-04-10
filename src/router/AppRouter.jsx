import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { canAccess } from '../hooks/useRoleAccess.js'
import { AppShell } from '../components/layout/AppShell.jsx'

import { Login } from '../pages/Login.jsx'
import { Dashboard } from '../pages/Dashboard.jsx'
import { Students } from '../pages/Students.jsx'
import { Attendance } from '../pages/Attendance.jsx'
import { Fees } from '../pages/Fees.jsx'
import { Reports } from '../pages/Reports.jsx'
import { Users } from '../pages/Users.jsx'
import { Holidays } from '../pages/Holidays.jsx'

function FullPageLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="mt-4 h-10 w-full rounded bg-slate-100" />
        <div className="mt-3 h-10 w-full rounded bg-slate-100" />
        <div className="mt-6 h-10 w-32 rounded bg-slate-100" />
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireRouteAccess({ routeKey, children }) {
  const { user } = useAuth()
  if (!canAccess(routeKey, user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route
            path="dashboard"
            element={
              <RequireRouteAccess routeKey="dashboard">
                <Dashboard />
              </RequireRouteAccess>
            }
          />
          <Route
            path="students"
            element={
              <RequireRouteAccess routeKey="students">
                <Students />
              </RequireRouteAccess>
            }
          />
          <Route
            path="attendance"
            element={
              <RequireRouteAccess routeKey="attendance">
                <Attendance />
              </RequireRouteAccess>
            }
          />
          <Route
            path="fees"
            element={
              <RequireRouteAccess routeKey="fees">
                <Fees />
              </RequireRouteAccess>
            }
          />
          <Route
            path="reports"
            element={
              <RequireRouteAccess routeKey="reports">
                <Reports />
              </RequireRouteAccess>
            }
          />
          <Route
            path="users"
            element={
              <RequireRouteAccess routeKey="users">
                <Users />
              </RequireRouteAccess>
            }
          />
          <Route
            path="holidays"
            element={
              <RequireRouteAccess routeKey="holidays">
                <Holidays />
              </RequireRouteAccess>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


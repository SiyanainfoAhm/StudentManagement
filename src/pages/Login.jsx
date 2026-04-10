import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck, GraduationCap, Sparkles, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import { DEMO_CREDENTIALS } from '../data/demoInfo.js'

export function Login() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    // Small polish: prefill with first demo user
    if (!loading && !user) {
      setValue('email', DEMO_CREDENTIALS[0].email)
      setValue('password', DEMO_CREDENTIALS[0].password)
    }
  }, [loading, user, setValue])

  if (!loading && user) return <Navigate to="/dashboard" replace />

  const onSubmit = async (values) => {
    try {
      await login(values)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      toast.error(e?.message || 'Login failed.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1200px] grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-white/10 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-blue-600/10 to-slate-950" />
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex h-full flex-col p-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 grid place-items-center text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Student Management System</div>
                <div className="text-xs text-white/60">Meeting-ready MVP demo</div>
              </div>
            </div>

            <div className="mt-16 max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/15">
                <Sparkles className="h-3.5 w-3.5" />
                Premium admin dashboard UI
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
                Fast, clean admin workflows for students, attendance & fees.
              </h1>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Custom authentication using <span className="text-white/90">student_management_users</span>.
                No Supabase Auth. No RLS. Designed for demos and presentations.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-xs text-white/60">Modules</div>
                  <div className="mt-1 text-sm font-semibold text-white">Dashboard • Students</div>
                  <div className="mt-1 text-sm font-semibold text-white">Attendance • Fees</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <div className="text-xs text-white/60">Access</div>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-white">
                    <ShieldCheck className="h-4 w-4" /> Admin & Teacher roles
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto text-xs text-white/45">
              Tip: Use the demo credentials on the right for a smooth login.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-slate-50 px-6 py-10">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">Welcome</div>
                  <div className="text-2xl font-semibold tracking-tight text-slate-900">
                    Sign in to continue
                  </div>
                </div>
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white grid place-items-center shadow-sm">
                  <LogIn className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-4"
                    placeholder="name@schooldemo.com"
                    {...register('email', { required: true })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-4"
                    placeholder="Your password"
                    {...register('password', { required: true })}
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Demo credentials</div>
                <div className="text-xs text-slate-500">Click to auto-fill</div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3">
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => {
                      setValue('email', c.email)
                      setValue('password', c.password)
                      toast('Filled demo credentials.')
                    }}
                    className="text-left rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-indigo-700">{c.role}</div>
                      <div className="text-[11px] text-slate-500">Password pattern</div>
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900">{c.email}</div>
                    <div className="mt-1 font-mono text-xs text-slate-600">{c.password}</div>
                  </button>
                ))}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}


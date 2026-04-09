import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

export function Select({ label, options = [], error, className, ...props }) {
  return (
    <div className={className}>
      {label ? <div className="text-xs font-medium text-slate-700">{label}</div> : null}
      <select
        {...props}
        className={twMerge(
          clsx(
            'mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring-4',
            error ? 'border-rose-300' : 'border-slate-200'
          )
        )}
      >
        {options.map((o) => (
          <option key={o.value ?? o.label} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <div className="mt-1 text-[11px] text-rose-600">{error}</div> : null}
    </div>
  )
}


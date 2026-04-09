import React from 'react'
import { twMerge } from 'tailwind-merge'
import clsx from 'clsx'

const tones = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-500',
  outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
}

export function Button({
  as: Comp = 'button',
  tone = 'primary',
  size = 'md',
  className,
  ...props
}) {
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-3.5 py-2.5 text-sm rounded-xl',
  }
  return (
    <Comp
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2 font-semibold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed',
          sizes[size],
          tones[tone],
          className
        )
      )}
      {...props}
    />
  )
}


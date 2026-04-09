import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Modal({ open, title, description, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onMouseDown={onClose}
      />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <div className="text-lg font-semibold tracking-tight text-slate-900">{title}</div>
              {description ? <div className="mt-1 text-sm text-slate-500">{description}</div> : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6 py-5">{children}</div>

          {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
        </div>
      </div>
    </div>,
    document.body
  )
}


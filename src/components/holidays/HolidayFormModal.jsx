import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { inclusiveHolidayDayCount } from '../../utils/holidayHelpers.js'

export function HolidayFormModal({ open, initial, onClose, onSave }) {
  const isEdit = !!initial?.id

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      description: '',
    },
  })

  const start = watch('start_date')
  const end = watch('end_date')

  useEffect(() => {
    if (!open) return
    const s = initial?.start_date?.slice(0, 10) || ''
    const e = initial?.end_date?.slice(0, 10) || ''
    reset({
      name: initial?.name || '',
      start_date: s,
      // Single-day holidays: leave end empty in the form for clarity
      end_date: s && e && s !== e ? e : '',
      description: initial?.description || '',
    })
  }, [open, initial, reset])

  const submit = async (values) => {
    try {
      if (!values.start_date) {
        throw new Error('Start date is required.')
      }
      const endDate = (values.end_date || '').trim() || values.start_date
      if (endDate < values.start_date) {
        throw new Error('End date must be on or after start date.')
      }
      const payload = {
        name: values.name.trim(),
        start_date: values.start_date,
        end_date: endDate,
        description: values.description?.trim() || null,
      }
      if (!payload.name) throw new Error('Holiday name is required.')
      await onSave?.(payload)
      toast.success(isEdit ? 'Holiday updated.' : 'Holiday added.')
      onClose?.()
    } catch (e) {
      toast.error(e?.message || 'Save failed.')
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit holiday' : 'Add holiday'}
      description="Single-day holidays: only set the start date. For multi-day breaks (e.g. Diwali), add an end date."
      onClose={isSubmitting ? undefined : onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button tone="indigo" onClick={handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add holiday'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input label="Holiday name" placeholder="Diwali break" {...register('name', { required: true })} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Start date" type="date" {...register('start_date', { required: true })} />
          <Input
            label="End date (optional)"
            hint="Leave blank for a single day — it will use the start date."
            type="date"
            {...register('end_date')}
          />
        </div>
        {start ? (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
            {(() => {
              const effectiveEnd = end && end >= start ? end : start
              const days = inclusiveHolidayDayCount(start, effectiveEnd)
              return (
                <>
                  This holiday spans{' '}
                  <span className="font-semibold">{days} calendar day(s)</span> (inclusive).
                  {!end || end < start ? (
                    <span className="block mt-1 text-indigo-700/90">No end date — treated as one day.</span>
                  ) : null}
                </>
              )
            })()}
          </div>
        ) : null}
        <Input label="Description (optional)" {...register('description')} />
      </div>
    </Modal>
  )
}

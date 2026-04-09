import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Select } from '../ui/Select.jsx'
import { PAYMENT_MODES } from '../../utils/constants.js'

export function FeePaymentModal({ open, students, initial, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      student_id: '',
      fee_month: new Date().getMonth() + 1,
      fee_year: new Date().getFullYear(),
      amount: '',
      status: 'paid',
      payment_date: new Date().toISOString().slice(0, 10),
      payment_mode: 'upi',
      remarks: 'Monthly tuition fee',
    },
  })

  const status = watch('status')

  useEffect(() => {
    if (!open) return
    reset({
      student_id: initial?.student_id || '',
      fee_month: initial?.fee_month || new Date().getMonth() + 1,
      fee_year: initial?.fee_year || new Date().getFullYear(),
      amount: initial?.amount ?? '',
      status: initial?.status || 'paid',
      payment_date: initial?.payment_date || new Date().toISOString().slice(0, 10),
      payment_mode: initial?.payment_mode || 'upi',
      remarks: initial?.remarks || 'Monthly tuition fee',
    })
  }, [open, initial, reset])

  const submit = async (values) => {
    const payload = {
      ...values,
      amount: Number(values.amount || 0),
      fee_month: Number(values.fee_month),
      fee_year: Number(values.fee_year),
      payment_date: values.status === 'paid' ? values.payment_date || null : null,
      payment_mode: values.status === 'paid' ? values.payment_mode || null : null,
    }
    await onSave?.(payload)
  }

  return (
    <Modal
      open={open}
      title={initial?.id ? 'Edit fee entry' : 'Add payment'}
      description="Keep payments realistic for a polished demo."
      onClose={isSubmitting ? undefined : onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button tone="indigo" onClick={handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Student"
          {...register('student_id', { required: true })}
          options={[
            { value: '', label: 'Select student' },
            ...(students || []).map((s) => ({
              value: s.id,
              label: `${s.first_name} ${s.last_name}`,
            })),
          ]}
        />
        <Select
          label="Status"
          {...register('status')}
          options={[
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
          ]}
        />

        <Input label="Month" type="number" min={1} max={12} {...register('fee_month')} />
        <Input label="Year" type="number" min={2020} {...register('fee_year')} />

        <Input label="Amount (INR)" type="number" min={0} step="1" {...register('amount')} />

        {status === 'paid' ? (
          <>
            <Input label="Payment date" type="date" {...register('payment_date')} />
            <Select
              label="Payment mode"
              {...register('payment_mode')}
              options={PAYMENT_MODES.map((x) => ({ value: x.value, label: x.label }))}
            />
          </>
        ) : (
          <div className="md:col-span-1 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Pending entries won’t store payment date/mode.
          </div>
        )}

        <div className="md:col-span-2">
          <Input label="Remarks" {...register('remarks')} />
        </div>
      </div>
    </Modal>
  )
}


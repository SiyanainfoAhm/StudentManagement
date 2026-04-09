import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Select } from '../ui/Select.jsx'
import { GENDERS } from '../../utils/constants.js'

export function StudentFormModal({ open, mode, classes, initial, onClose, onSave }) {
  const isEdit = mode === 'edit'

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      admission_no: '',
      first_name: '',
      last_name: '',
      gender: '',
      dob: '',
      class_id: '',
      mobile: '',
      email: '',
      address: '',
      guardian_name: '',
      guardian_mobile: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      admission_no: initial?.admission_no || '',
      first_name: initial?.first_name || '',
      last_name: initial?.last_name || '',
      gender: initial?.gender || '',
      dob: initial?.dob || '',
      class_id: initial?.class_id || '',
      mobile: initial?.mobile || '',
      email: initial?.email || '',
      address: initial?.address || '',
      guardian_name: initial?.guardian_name || '',
      guardian_mobile: initial?.guardian_mobile || '',
    })
  }, [open, initial, reset])

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        gender: values.gender || null,
        dob: values.dob || null,
        class_id: values.class_id || null,
      }
      await onSave?.(payload)
      toast.success(isEdit ? 'Student updated.' : 'Student added.')
      onClose?.()
    } catch (e) {
      toast.error(e?.message || 'Save failed.')
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit student' : 'Add student'}
      description="Keep details realistic for presentation-ready reports."
      onClose={isSubmitting ? undefined : onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button tone="indigo" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add student'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Admission No" placeholder="ADM051" {...register('admission_no')} />
        <Select
          label="Class"
          {...register('class_id')}
          options={[
            { value: '', label: 'Select class' },
            ...(classes || []).map((c) => ({
              value: c.id,
              label: `${c.class_name}-${c.section}`,
            })),
          ]}
        />

        <Input label="First name" placeholder="Aarav" {...register('first_name', { required: true })} />
        <Input label="Last name" placeholder="Mehta" {...register('last_name', { required: true })} />

        <Select
          label="Gender"
          {...register('gender')}
          options={[{ value: '', label: 'Select gender' }, ...GENDERS]}
        />
        <Input label="DOB" type="date" {...register('dob')} />

        <Input label="Mobile" placeholder="98XXXXXXXX" {...register('mobile')} />
        <Input label="Email" placeholder="student@demo.com" {...register('email')} />

        <div className="md:col-span-2">
          <Input label="Address" placeholder="Ahmedabad, Gujarat" {...register('address')} />
        </div>

        <Input label="Guardian name" placeholder="Parent/Guardian" {...register('guardian_name')} />
        <Input label="Guardian mobile" placeholder="98XXXXXXXX" {...register('guardian_mobile')} />
      </div>
    </Modal>
  )
}


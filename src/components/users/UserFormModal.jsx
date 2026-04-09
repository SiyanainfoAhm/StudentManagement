import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { Select } from '../ui/Select.jsx'
import { hashPassword } from '../../utils/password.js'

export function UserFormModal({ open, initial, onClose, onSave }) {
  const isEdit = !!initial?.id

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      role: 'teacher',
      is_active: true,
      password: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      first_name: initial?.first_name || '',
      last_name: initial?.last_name || '',
      email: initial?.email || '',
      mobile: initial?.mobile || '',
      role: initial?.role || 'teacher',
      is_active: initial?.is_active ?? true,
      password: '',
    })
  }, [open, initial, reset])

  const submit = async (values) => {
    try {
      const name = `${values.first_name} ${values.last_name}`.trim()
      const payload = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        name,
        email: values.email.trim().toLowerCase(),
        mobile: values.mobile?.trim() || null,
        role: values.role,
        is_active: !!values.is_active,
      }

      if (!isEdit) {
        if (!values.password) throw new Error('Password is required for new users.')
        payload.password_hash = await hashPassword(values.password)
      }

      await onSave?.(payload)
      toast.success(isEdit ? 'User updated.' : 'User created.')
      onClose?.()
    } catch (e) {
      toast.error(e?.message || 'Save failed.')
    }
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit user' : 'Add user'}
      description={isEdit ? 'Update user details and role.' : 'Create a new admin/teacher user.'}
      onClose={isSubmitting ? undefined : onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button tone="indigo" onClick={handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="First name" {...register('first_name', { required: true })} />
        <Input label="Last name" {...register('last_name', { required: true })} />
        <Input label="Email" type="email" {...register('email', { required: true })} />
        <Input label="Mobile" {...register('mobile')} />
        <Select
          label="Role"
          {...register('role')}
          options={[
            { value: 'admin', label: 'Admin' },
            { value: 'teacher', label: 'Teacher' },
          ]}
        />
        <Select
          label="Active"
          {...register('is_active')}
          options={[
            { value: true, label: 'Active' },
            { value: false, label: 'Inactive' },
          ]}
        />
        {!isEdit ? (
          <div className="md:col-span-2">
            <Input
              label="Initial password"
              type="text"
              {...register('password')}
            />
          </div>
        ) : null}
      </div>
    </Modal>
  )
}


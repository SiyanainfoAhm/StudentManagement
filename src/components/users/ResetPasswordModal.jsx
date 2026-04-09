import React from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { hashPassword } from '../../utils/password.js'

export function ResetPasswordModal({ open, user, onClose, onReset }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { password: '' } })

  React.useEffect(() => {
    if (!open) return
    reset({ password: '' })
  }, [open, reset])

  const submit = async (values) => {
    try {
      if (!values.password) throw new Error('Enter a new password.')
      const password_hash = await hashPassword(values.password)
      await onReset?.({ password_hash })
      toast.success('Password reset.')
      onClose?.()
    } catch (e) {
      toast.error(e?.message || 'Reset failed.')
    }
  }

  return (
    <Modal
      open={open}
      title="Reset password"
      description={user ? `Reset password for ${user.name} (${user.role}).` : undefined}
      onClose={isSubmitting ? undefined : onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button tone="danger" onClick={handleSubmit(submit)} disabled={isSubmitting}>
            {isSubmitting ? 'Updating…' : 'Reset password'}
          </Button>
        </div>
      }
    >
      <Input
        label="New password"
        hint="Demo convention: Fname.Lastname@123"
        type="text"
        {...register('password')}
      />
    </Modal>
  )
}


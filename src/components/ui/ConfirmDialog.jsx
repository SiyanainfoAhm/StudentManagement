import React from 'react'
import { Modal } from './Modal.jsx'
import { Button } from './Button.jsx'

export function ConfirmDialog({
  open,
  title = 'Confirm',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'danger',
  onConfirm,
  onClose,
  busy,
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={busy ? undefined : onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button tone="outline" onClick={onClose} disabled={busy}>
            {cancelText}
          </Button>
          <Button tone={tone} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmText}
          </Button>
        </div>
      }
    >
      <div className="text-sm text-slate-600">
        This action can’t be undone in this demo database.
      </div>
    </Modal>
  )
}


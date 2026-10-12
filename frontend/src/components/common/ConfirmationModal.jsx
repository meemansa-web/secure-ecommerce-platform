import React, { useEffect } from 'react'
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react'
import Button from './Button'
import './ConfirmationModal.css'

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'warning' | 'success'
  onConfirm,
  onCancel,
  loading = false,
  icon: CustomIcon,
}) {
  // Trap escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loading, onCancel])

  if (!isOpen) return null

  const renderIcon = () => {
    if (CustomIcon) return <CustomIcon size={24} />
    switch (confirmVariant) {
      case 'danger':
      case 'warning':
        return <AlertTriangle size={24} />
      case 'success':
        return <CheckCircle2 size={24} />
      default:
        return <Info size={24} />
    }
  }

  return (
    <div className="modal-backdrop" onClick={loading ? undefined : onCancel}>
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className={`modal-header-icon icon-${confirmVariant}`}>
          {renderIcon()}
        </div>

        <h3 id="modal-title" className="modal-title">{title}</h3>
        <div className="modal-message">{message}</div>

        <div className="modal-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

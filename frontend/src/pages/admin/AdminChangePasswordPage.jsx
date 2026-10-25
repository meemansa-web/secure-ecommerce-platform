import React, { useState } from 'react'
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react'
import { adminChangePassword } from '../../api/adminApi'
import Button from '../../components/common/Button'
import './AdminDashboard.css'

export default function AdminChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const validate = () => {
    const errs = {}
    if (!formData.currentPassword) {
      errs.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      errs.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      errs.newPassword = 'New password must contain at least 8 characters'
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    } else if (formData.currentPassword && formData.newPassword === formData.currentPassword) {
      errs.newPassword = 'New password cannot be the same as your current password'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (toast) setToast(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setToast(null)

    try {
      await adminChangePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })

      setToast({
        type: 'success',
        message: 'Password changed successfully.',
      })

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update password. Please verify your current password.'
      setToast({ type: 'error', message: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-dashboard-root" style={{ maxWidth: '640px' }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Change Password</h1>
          <p className="admin-page-desc">
            Update your account password to maintain administrative security.
          </p>
        </div>
      </div>

      {toast && (
        <div className={`admin-toast-banner toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button type="button" className="toast-close-btn" onClick={() => setToast(null)}>
            &times;
          </button>
        </div>
      )}

      <div className="admin-panel-card">
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Current Password */}
          <div>
            <label className="admin-form-label" htmlFor="currentPassword">
              Current Password <span style={{ color: '#df5848' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                className={`admin-form-input ${fieldErrors.currentPassword ? 'input-error' : ''}`}
                value={formData.currentPassword}
                onChange={handleChange}
                disabled={submitting}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <span className="admin-form-error">{fieldErrors.currentPassword}</span>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="admin-form-label" htmlFor="newPassword">
              New Password <span style={{ color: '#df5848' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                className={`admin-form-input ${fieldErrors.newPassword ? 'input-error' : ''}`}
                placeholder="At least 8 characters"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={submitting}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <span className="admin-form-error">{fieldErrors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="admin-form-label" htmlFor="confirmPassword">
              Confirm New Password <span style={{ color: '#df5848' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                className={`admin-form-input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="admin-form-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              iconPosition="left"
              disabled={submitting}
            >
              {submitting ? 'Updating Password...' : 'Save Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

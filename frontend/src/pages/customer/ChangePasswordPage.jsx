import React, { useState } from 'react'
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import Button from '../../components/common/Button'
import './CustomerDashboard.css'

export default function ChangePasswordPage() {
  const { updatePassword } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [statusMessage, setStatusMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!formData.currentPassword) {
      errs.currentPassword = 'Current password is required.'
    }
    if (!formData.newPassword) {
      errs.newPassword = 'New password is required.'
    } else if (formData.newPassword.length < 6) {
      errs.newPassword = 'New password must contain at least 6 characters.'
    } else if (formData.newPassword === formData.currentPassword) {
      errs.newPassword = 'New password cannot be the same as your current password.'
    }
    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.'
    } else if (formData.confirmPassword !== formData.newPassword) {
      errs.confirmPassword = 'Passwords do not match.'
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
    if (statusMessage) setStatusMessage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    setTimeout(() => {
      if (updatePassword) {
        updatePassword(formData.currentPassword, formData.newPassword)
      }

      setLoading(false)
      setStatusMessage({
        type: 'success',
        text: 'Your password has been changed successfully. You can now use your new password for your account.',
      })
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }, 600)
  }

  return (
    <div className="customer-dashboard-root">
      <div className="dashboard-section" style={{ maxWidth: '640px' }}>
        <div className="section-header">
          <div>
            <h1 className="section-title">Change Account Password</h1>
            <p className="section-desc">
              Update your account credentials and security preferences.
            </p>
          </div>
          <span className="verified-pill">
            <Shield size={14} />
            <span>Encrypted & Secure</span>
          </span>
        </div>

        {statusMessage && (
          <div
            className="dashboard-alert"
            style={{
              backgroundColor:
                statusMessage.type === 'success'
                  ? 'var(--success-bg, rgba(82, 168, 101, 0.15))'
                  : 'var(--sale-badge-bg, rgba(223, 88, 72, 0.15))',
              border: `1px solid ${
                statusMessage.type === 'success'
                  ? 'var(--success, #2e6037)'
                  : 'var(--sale-badge, #a13d2f)'
              }`,
              color: 'var(--color-text-primary)',
              marginBottom: '1.5rem',
            }}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success, #2e6037)', flexShrink: 0 }} />
            ) : (
              <AlertCircle size={18} style={{ color: 'var(--sale-badge, #a13d2f)', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Current Password Field */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="field-label" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
              Current Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrent ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                className="login-input"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 2.5rem 0 0.85rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: `1px solid ${fieldErrors.currentPassword ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Toggle password visibility"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>
                {fieldErrors.currentPassword}
              </span>
            )}
          </div>

          {/* New Password Field */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="field-label" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="login-input"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 2.5rem 0 0.85rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: `1px solid ${fieldErrors.newPassword ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Toggle password visibility"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>
                {fieldErrors.newPassword}
              </span>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="field-label" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your new password"
                className="login-input"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 2.5rem 0 0.85rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: `1px solid ${fieldErrors.confirmPassword ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                aria-label="Toggle password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={KeyRound}
              iconPosition="left"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

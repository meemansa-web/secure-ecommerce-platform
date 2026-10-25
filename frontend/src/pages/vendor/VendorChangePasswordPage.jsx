import React, { useState } from 'react'
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react'
import { changeVendorPassword } from '../../api/vendorApi'
import Button from '../../components/common/Button'
import './VendorProfilePage.css'

export default function VendorChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (errorMsg) setErrorMsg(null)
  }

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
      errs.confirmPassword = 'Confirm password is required'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'New passwords do not match'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!validate()) return

    setSubmitting(true)

    try {
      const payload = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }

      const res = await changeVendorPassword(payload)
      setSuccessMsg(res?.message || 'Password changed successfully.')
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update password.'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="vendor-profile-root">
      {/* Header */}
      <div className="v-page-header">
        <div className="v-header-info">
          <div className="v-header-badge">
            <KeyRound size={13} />
            <span>Account Security</span>
          </div>
          <h1 className="v-page-title editorial-title-serif">Change Password</h1>
          <p className="v-page-subtitle">
            Update your vendor account credentials to keep your merchant operations secure.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="v-alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="v-alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Password Form Card */}
      <div className="v-profile-form-card" style={{ maxWidth: '580px' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field-group">
            <label htmlFor="currentPassword" className="form-field-label">
              Current Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                id="currentPassword"
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                className={`form-field-input ${fieldErrors.currentPassword ? 'field-error' : ''}`}
                placeholder="Enter existing password"
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrent((p) => !p)}
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <span className="field-error-text">{fieldErrors.currentPassword}</span>
            )}
          </div>

          <div className="form-field-group" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="newPassword" className="form-field-label">
              New Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                id="newPassword"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                className={`form-field-input ${fieldErrors.newPassword ? 'field-error' : ''}`}
                placeholder="At least 8 characters"
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowNew((p) => !p)}
                tabIndex={-1}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <span className="field-error-text">{fieldErrors.newPassword}</span>
            )}
          </div>

          <div className="form-field-group" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="confirmPassword" className="form-field-label">
              Confirm New Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-field-input ${fieldErrors.confirmPassword ? 'field-error' : ''}`}
                placeholder="Re-enter new password"
                disabled={submitting}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirm((p) => !p)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error-text">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <div className="upload-submit-row">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              icon={submitting ? Loader2 : Lock}
              iconPosition="right"
            >
              {submitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

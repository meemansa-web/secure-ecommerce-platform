import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
} from 'lucide-react'
import { getAdminProfile, updateAdminProfile } from '../../api/adminApi'
import { useAuth } from '../../context/useAuth'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import './AdminDashboard.css'

export default function AdminProfilePage() {
  const { updateUserProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let ignore = false
    getAdminProfile()
      .then((data) => {
        if (!ignore && data) {
          setProfile(data)
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            username: data.username || '',
          })
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setToast({
            type: 'error',
            message: err.response?.data?.message || 'Unable to load profile data.',
          })
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const validate = () => {
    const errs = {}
    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required'
    }
    if (!formData.username.trim()) {
      errs.username = 'Username is required'
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      errs.username = 'Username must be between 3 and 50 characters'
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

    setSaving(true)
    setToast(null)

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
      }

      const updated = await updateAdminProfile(payload)
      setProfile(updated)
      updateUserProfile({
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
      })

      setToast({
        type: 'success',
        message: 'Profile updated successfully.',
      })
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to update profile. Please verify your details.'
      setToast({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading profile..." fullScreen={false} />
      </div>
    )
  }

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ' ' + profile.lastName : ''}`.trim()
    : profile?.username || 'Administrator'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD'

  return (
    <div className="admin-dashboard-root" style={{ maxWidth: '720px' }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Profile</h1>
          <p className="admin-page-desc">
            Manage your personal administrator identity and contact details.
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

      {/* Profile Form Card */}
      <div className="admin-panel-card">
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-olive)',
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {displayName}
            </h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {profile?.email}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.75rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="admin-form-label" htmlFor="admin-firstName">
                First Name <span style={{ color: '#df5848' }}>*</span>
              </label>
              <input
                id="admin-firstName"
                name="firstName"
                type="text"
                className={`admin-form-input ${fieldErrors.firstName ? 'input-error' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
                disabled={saving}
              />
              {fieldErrors.firstName && (
                <span className="admin-form-error">{fieldErrors.firstName}</span>
              )}
            </div>

            <div>
              <label className="admin-form-label" htmlFor="admin-lastName">
                Last Name <span style={{ color: '#df5848' }}>*</span>
              </label>
              <input
                id="admin-lastName"
                name="lastName"
                type="text"
                className={`admin-form-input ${fieldErrors.lastName ? 'input-error' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
                disabled={saving}
              />
              {fieldErrors.lastName && (
                <span className="admin-form-error">{fieldErrors.lastName}</span>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="admin-form-label" htmlFor="admin-username">
              Username <span style={{ color: '#df5848' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="admin-username"
                name="username"
                type="text"
                style={{ paddingLeft: '2.25rem' }}
                className={`admin-form-input ${fieldErrors.username ? 'input-error' : ''}`}
                value={formData.username}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            {fieldErrors.username && (
              <span className="admin-form-error">{fieldErrors.username}</span>
            )}
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="admin-form-label" htmlFor="admin-email">
              Email Address <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Read-Only)</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-muted)' }} />
              <input
                id="admin-email"
                type="email"
                style={{ paddingLeft: '2.25rem', opacity: 0.7, cursor: 'not-allowed' }}
                className="admin-form-input"
                value={profile?.email || ''}
                disabled
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={saving ? RefreshCw : Save}
              iconPosition="left"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

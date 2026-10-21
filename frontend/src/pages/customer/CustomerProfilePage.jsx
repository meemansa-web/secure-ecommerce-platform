import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Mail,
  ShieldCheck,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Save,
  Info,
  KeyRound,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getCurrentUserProfile } from '../../api/userApi'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import './CustomerDashboard.css'

export default function CustomerProfilePage() {
  const { user: authUser, updateUserProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editNotice, setEditNotice] = useState(null)

  // Edit form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  })

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        setLoading(true)
        const data = await getCurrentUserProfile()
        if (isMounted) {
          // Check if user has local updates stored
          const savedUser = localStorage.getItem('user')
          const localParsed = savedUser ? JSON.parse(savedUser) : null

          const mergedProfile = {
            ...data,
            firstName: localParsed?.firstName || data.firstName || '',
            lastName: localParsed?.lastName || data.lastName || '',
          }

          setProfile(mergedProfile)
          setFormData({
            firstName: mergedProfile.firstName || '',
            lastName: mergedProfile.lastName || '',
            username: mergedProfile.username || '',
            email: mergedProfile.email || '',
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'We couldn’t load your profile. Please try again.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const active = profile || authUser

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev)
    setEditNotice(null)
    if (active) {
      setFormData({
        firstName: active.firstName || '',
        lastName: active.lastName || '',
        username: active.username || '',
        email: active.email || '',
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveChanges = (e) => {
    e.preventDefault()

    if (!formData.firstName.trim()) {
      setEditNotice({
        type: 'error',
        text: 'First Name is required and cannot be blank.',
      })
      return
    }

    const updatedFields = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    }

    // Persist to AuthContext and localStorage
    if (updateUserProfile) {
      updateUserProfile(updatedFields)
    }

    // Update active profile state
    setProfile((prev) => ({
      ...(prev || authUser),
      ...updatedFields,
    }))

    setIsEditing(false)
    setEditNotice({
      type: 'success',
      text: 'Your profile has been updated successfully.',
    })

    setTimeout(() => {
      setEditNotice(null)
    }, 4000)
  }

  return (
    <div className="customer-dashboard-root">
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h1 className="section-title">My Profile</h1>
            <p className="section-desc">
              Manage your personal information and account preferences.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="verified-pill">
              <CheckCircle2 size={14} />
              <span>Customer</span>
            </span>
            <Button
              variant={isEditing ? 'outline' : 'secondary'}
              size="sm"
              icon={isEditing ? X : Edit3}
              iconPosition="left"
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="dashboard-alert dashboard-alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {editNotice && (
          <div
            className="dashboard-alert"
            style={{
              backgroundColor:
                editNotice.type === 'success'
                  ? 'var(--success-bg, rgba(82, 168, 101, 0.15))'
                  : editNotice.type === 'error'
                  ? 'var(--sale-badge-bg, rgba(223, 88, 72, 0.15))'
                  : 'rgba(59, 130, 246, 0.08)',
              border: `1px solid ${
                editNotice.type === 'success'
                  ? 'var(--success, #2e6037)'
                  : editNotice.type === 'error'
                  ? 'var(--sale-badge, #a13d2f)'
                  : 'rgba(59, 130, 246, 0.25)'
              }`,
              color: 'var(--color-text-primary)',
              marginBottom: '1.5rem',
            }}
          >
            {editNotice.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: 'var(--success, #2e6037)', flexShrink: 0 }} />
            ) : editNotice.type === 'error' ? (
              <AlertCircle size={18} style={{ color: 'var(--sale-badge, #a13d2f)', flexShrink: 0 }} />
            ) : (
              <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{editNotice.text}</span>
          </div>
        )}

        {loading ? (
          <Loading text="Loading profile..." fullScreen={false} />
        ) : isEditing ? (
          /* Profile Edit Form */
          <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="profile-details-grid">
              <div className="profile-field-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label className="field-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="login-input"
                  style={{ height: '38px', padding: '0 0.75rem', marginTop: '0.25rem' }}
                />
              </div>

              <div className="profile-field-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label className="field-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="login-input"
                  style={{ height: '38px', padding: '0 0.75rem', marginTop: '0.25rem' }}
                />
              </div>

              <div className="profile-field-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label className="field-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  disabled
                  className="login-input"
                  style={{ height: '38px', padding: '0 0.75rem', marginTop: '0.25rem', opacity: 0.6 }}
                />
              </div>

              <div className="profile-field-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="login-input"
                  style={{ height: '38px', padding: '0 0.75rem', marginTop: '0.25rem', opacity: 0.6 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="outline" size="md" type="button" onClick={handleEditToggle}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" icon={Save} iconPosition="left">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          /* Profile Display Grid */
          <>
            <div className="profile-details-grid">
              <div className="profile-field-card">
                <div className="field-icon-wrap"><User size={18} /></div>
                <div className="field-content">
                  <span className="field-label">First Name</span>
                  <span className="field-value">{active?.firstName || '—'}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap"><User size={18} /></div>
                <div className="field-content">
                  <span className="field-label">Last Name</span>
                  <span className="field-value">{active?.lastName || '—'}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap"><AtSign size={18} /></div>
                <div className="field-content">
                  <span className="field-label">Username</span>
                  <span className="field-value">{active?.username || '—'}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap"><Mail size={18} /></div>
                <div className="field-content">
                  <span className="field-label">Email</span>
                  <span className="field-value">{active?.email || '—'}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap"><ShieldCheck size={18} /></div>
                <div className="field-content">
                  <span className="field-label">Account Type</span>
                  <span className="field-value role-highlight">Customer</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Account Management */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Account Settings
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <Link to="/customer/change-password" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="profile-field-card" style={{ justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="field-icon-wrap"><KeyRound size={18} /></div>
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block' }}>Change Password</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Update your security password</span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </Link>

                <Link to="/customer/addresses" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="profile-field-card" style={{ justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="field-icon-wrap"><MapPin size={18} /></div>
                      <div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block' }}>Saved Addresses</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Manage delivery locations</span>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

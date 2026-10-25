import React, { useState, useEffect } from 'react'
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react'
import { getVendorProfile, updateVendorProfile } from '../../api/vendorApi'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import './VendorProfilePage.css'

export default function VendorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const data = await getVendorProfile()
        if (isMounted && data) {
          setProfile(data)
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            username: data.username || '',
            email: data.email || '',
            businessName: data.businessName || '',
            businessEmail: data.businessEmail || '',
            businessPhone: data.businessPhone || '',
            businessAddress: data.businessAddress || '',
          })
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load store profile details.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

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

    if (!formData.firstName.trim()) errs.firstName = 'First name is required'
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required'

    if (!formData.username.trim()) {
      errs.username = 'Username is required'
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      errs.username = 'Username must be between 3 and 50 characters'
    }

    if (!formData.businessName.trim()) errs.businessName = 'Business name is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.businessEmail.trim()) {
      errs.businessEmail = 'Business email is required'
    } else if (!emailRegex.test(formData.businessEmail.trim())) {
      errs.businessEmail = 'Please enter a valid business email'
    }

    if (!formData.businessPhone.trim()) errs.businessPhone = 'Business phone is required'
    if (!formData.businessAddress.trim()) errs.businessAddress = 'Business address is required'

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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        businessName: formData.businessName.trim(),
        businessEmail: formData.businessEmail.trim().toLowerCase(),
        businessPhone: formData.businessPhone.trim(),
        businessAddress: formData.businessAddress.trim(),
      }

      const updated = await updateVendorProfile(payload)
      setProfile(updated)
      setSuccessMsg('Store profile and business details updated successfully.')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update store profile.'
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="vendor-loading-wrap">
        <Loading text="Loading store profile..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="vendor-profile-root">
      {/* Header */}
      <div className="v-page-header">
        <div className="v-header-info">
          <div className="v-header-badge">
            <Building2 size={13} />
            <span>Merchant Identity</span>
          </div>
          <h1 className="v-page-title editorial-title-serif">Store Profile</h1>
          <p className="v-page-subtitle">
            Manage your verified seller identity, contact points, and operating business location.
          </p>
        </div>

        <div className="profile-status-badge">
          <ShieldCheck size={16} />
          <span>Status: {profile?.status || 'APPROVED'}</span>
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

      {/* Form Container */}
      <div className="v-profile-form-card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Business Section */}
          <div className="profile-section-block">
            <h3 className="profile-section-title">
              <Building2 size={18} />
              <span>Business & Brand Details</span>
            </h3>

            <div className="form-field-group">
              <label htmlFor="businessName" className="form-field-label">
                Business Name <span className="required-star">*</span>
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className={`form-field-input ${fieldErrors.businessName ? 'field-error' : ''}`}
                disabled={submitting}
              />
              {fieldErrors.businessName && (
                <span className="field-error-text">{fieldErrors.businessName}</span>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-field-group">
                <label htmlFor="businessEmail" className="form-field-label">
                  Public Business Email <span className="required-star">*</span>
                </label>
                <input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className={`form-field-input ${fieldErrors.businessEmail ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.businessEmail && (
                  <span className="field-error-text">{fieldErrors.businessEmail}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="businessPhone" className="form-field-label">
                  Business Phone <span className="required-star">*</span>
                </label>
                <input
                  id="businessPhone"
                  name="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className={`form-field-input ${fieldErrors.businessPhone ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.businessPhone && (
                  <span className="field-error-text">{fieldErrors.businessPhone}</span>
                )}
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="businessAddress" className="form-field-label">
                Registered Business Address <span className="required-star">*</span>
              </label>
              <textarea
                id="businessAddress"
                name="businessAddress"
                rows={2}
                value={formData.businessAddress}
                onChange={handleChange}
                className={`form-field-input form-field-textarea ${fieldErrors.businessAddress ? 'field-error' : ''}`}
                disabled={submitting}
              />
              {fieldErrors.businessAddress && (
                <span className="field-error-text">{fieldErrors.businessAddress}</span>
              )}
            </div>
          </div>

          {/* Personal Identity Section */}
          <div className="profile-section-block">
            <h3 className="profile-section-title">
              <User size={18} />
              <span>Merchant Contact Information</span>
            </h3>

            <div className="form-row-2">
              <div className="form-field-group">
                <label htmlFor="firstName" className="form-field-label">
                  First Name <span className="required-star">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-field-input ${fieldErrors.firstName ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.firstName && (
                  <span className="field-error-text">{fieldErrors.firstName}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="lastName" className="form-field-label">
                  Last Name <span className="required-star">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-field-input ${fieldErrors.lastName ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.lastName && (
                  <span className="field-error-text">{fieldErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-field-group">
                <label htmlFor="username" className="form-field-label">
                  Account Username <span className="required-star">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-field-input ${fieldErrors.username ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.username && (
                  <span className="field-error-text">{fieldErrors.username}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="accountEmail" className="form-field-label">
                  Primary Login Email
                </label>
                <input
                  id="accountEmail"
                  type="email"
                  value={formData.email}
                  className="form-field-input input-disabled"
                  disabled
                  readOnly
                />
                <span className="field-helper-text">
                  Login email is permanent and cannot be altered directly.
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="upload-submit-row">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              icon={submitting ? Loader2 : Save}
              iconPosition="right"
            >
              {submitting ? 'Updating Profile...' : 'Save Profile Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

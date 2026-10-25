import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  User,
  Store,
  Building2,
  Mail,
  Clock,
} from 'lucide-react'
import Button from '../components/common/Button'
import { registerCustomer, registerVendor } from '../api/authApi'
import { sendRegistrationEmail } from '../utils/emailService'
import EmailPreviewModal from '../components/common/EmailPreviewModal'
import './RegisterPage.css'

export default function RegisterPage() {
  const navigate = useNavigate()

  // Account Type: 'CUSTOMER' | 'VENDOR'
  const [accountType, setAccountType] = useState('CUSTOMER')

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Vendor Specific Fields
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
  })

  // Visibility Toggles
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Status & Error States
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successResponse, setSuccessResponse] = useState(null)
  const [sentEmail, setSentEmail] = useState(null)
  const [previewEmailModalOpen, setPreviewEmailModalOpen] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
    // Clear global API error
    if (apiError) {
      setApiError(null)
    }
  }

  // Switch Account Type
  const handleTypeSelect = (type) => {
    setAccountType(type)
    setErrors({})
    setApiError(null)
  }

  // Frontend Validation matching Backend Requirements
  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      newErrors.username = 'Username must be between 3 and 50 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email'
    }

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '')
      if (cleanPhone.length < 10) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit mobile number'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Additional validations if VENDOR
    if (accountType === 'VENDOR') {
      if (!formData.businessName.trim()) {
        newErrors.businessName = 'Business name is required'
      }

      if (!formData.businessEmail.trim()) {
        newErrors.businessEmail = 'Business email is required'
      } else if (!emailRegex.test(formData.businessEmail.trim())) {
        newErrors.businessEmail = 'Please enter a valid business email'
      }

      if (!formData.businessPhone.trim()) {
        newErrors.businessPhone = 'Business phone is required'
      }

      if (!formData.businessAddress.trim()) {
        newErrors.businessAddress = 'Business address is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (accountType === 'CUSTOMER') {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }

        const response = await registerCustomer(payload)

        // Dispatch Welcome Email to user's registered email address
        let mailObj = null
        try {
          mailObj = await sendRegistrationEmail({
            email: payload.email,
            name: `${payload.firstName} ${payload.lastName}`.trim(),
            role: 'CUSTOMER',
            username: payload.username,
          })
          setSentEmail(mailObj)
        } catch (mErr) {
          console.warn('Welcome email dispatch error', mErr)
        }

        setSuccessResponse({
          ...response,
          type: 'CUSTOMER',
        })
        setLoading(false)

        setTimeout(() => {
          navigate('/login', {
            state: {
              registeredEmail: payload.email,
              registeredSuccess: true,
            },
          })
        }, 4500)
      } else {
        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          businessName: formData.businessName.trim(),
          businessEmail: formData.businessEmail.trim().toLowerCase(),
          businessPhone: formData.businessPhone.trim(),
          businessAddress: formData.businessAddress.trim(),
        }

        const response = await registerVendor(payload)

        // Dispatch Vendor Application Email
        let mailObj = null
        try {
          mailObj = await sendRegistrationEmail({
            email: payload.email,
            name: `${payload.firstName} ${payload.lastName}`.trim(),
            role: 'VENDOR',
            username: payload.username,
          })
          setSentEmail(mailObj)
        } catch (mErr) {
          console.warn('Vendor welcome email dispatch error', mErr)
        }

        setSuccessResponse({
          ...response,
          type: 'VENDOR',
        })
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)

      if (err.response) {
        const { status, data } = err.response
        const serverMessage = data?.message || data?.error

        if (status === 400) {
          setApiError(serverMessage || 'Invalid request. Please check your information.')
        } else if (status === 409) {
          setApiError(serverMessage || 'Email, username, or business email is already in use.')
        } else if (status >= 500) {
          setApiError('A server error occurred. Please try again later.')
        } else {
          setApiError(serverMessage || 'Registration failed. Please try again.')
        }
      } else if (err.request) {
        setApiError('Unable to connect to the server. Please check your connection.')
      } else {
        setApiError(err.message || 'An unexpected error occurred.')
      }
    }
  }

  return (
    <div className="register-page-root">
      <div className="register-container">
        <div className="register-card">
          {/* Brand Logo Header */}
          <div className="register-logo-header">
            <Link to="/" className="register-logo-link">
              <img src="/logo.png" alt="Nivora Logo" className="register-brand-logo-img" />
            </Link>
          </div>

          {/* Header */}
          <div className="register-header">
            <div className="register-badge-pill">
              <ShieldCheck size={13} />
              <span>{accountType === 'CUSTOMER' ? 'Customer Portal' : 'Vendor Partner Portal'}</span>
            </div>
            <h1 className="register-title editorial-title-serif">Create an Account</h1>
            <p className="register-subtitle">
              {accountType === 'CUSTOMER'
                ? 'Join our curated marketplace to discover verified products and trusted vendors.'
                : 'Register your business to start selling products on our curated platform.'}
            </p>
          </div>

          {/* Account Type Selector */}
          {!successResponse && (
            <div className="account-type-tabs" role="tablist" aria-label="Select Account Type">
              <button
                type="button"
                role="tab"
                aria-selected={accountType === 'CUSTOMER'}
                className={`type-tab-btn ${accountType === 'CUSTOMER' ? 'active' : ''}`}
                onClick={() => handleTypeSelect('CUSTOMER')}
                disabled={loading}
              >
                <User size={16} />
                <div className="type-tab-text">
                  <span className="type-tab-name">Customer</span>
                  <span className="type-tab-hint">Personal Shopper</span>
                </div>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={accountType === 'VENDOR'}
                className={`type-tab-btn ${accountType === 'VENDOR' ? 'active' : ''}`}
                onClick={() => handleTypeSelect('VENDOR')}
                disabled={loading}
              >
                <Store size={16} />
                <div className="type-tab-text">
                  <span className="type-tab-name">Vendor</span>
                  <span className="type-tab-hint">Business Seller</span>
                </div>
              </button>
            </div>
          )}

          {/* Success Banner */}
          {successResponse ? (
            <div className="register-success-box">
              <div className="success-icon-wrap">
                {successResponse.type === 'VENDOR' ? (
                  <Clock size={32} className="success-icon success-icon-pending" />
                ) : (
                  <CheckCircle2 size={32} className="success-icon" />
                )}
              </div>
              <h2 className="success-title">
                {successResponse.type === 'VENDOR'
                  ? 'Vendor Application Submitted'
                  : 'Account Created Successfully'}
              </h2>
              <p className="success-desc">
                {successResponse.type === 'VENDOR'
                  ? successResponse.message ||
                    'Your vendor account has been registered and is pending administrator review and approval. You will receive access once approved.'
                  : successResponse.message || 'Account created successfully. You can now sign in.'}
              </p>
              <div className="success-meta">
                <p>
                  Username: <strong>{successResponse.username || formData.username}</strong>
                </p>
                <p>
                  Email: <strong>{successResponse.email || formData.email}</strong>
                </p>
                {successResponse.type === 'VENDOR' && (
                  <p>
                    Business:{' '}
                    <strong>{successResponse.businessName || formData.businessName}</strong>
                  </p>
                )}
                {successResponse.type === 'VENDOR' ? (
                  <div className="status-badge-pending">Status: Pending Admin Approval</div>
                ) : (
                  <p className="redirect-hint">Redirecting to login in a few seconds...</p>
                )}
              </div>

              {sentEmail && (
                <div
                  className="email-dispatched-notice"
                  style={{
                    margin: '1rem 0 1.25rem 0',
                    padding: '0.85rem 1rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                    <Mail size={16} color="#22c55e" />
                    <span>Welcome email dispatched to <strong>{sentEmail.to}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewEmailModalOpen(true)}
                    style={{
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      color: '#d4af37',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View Email
                  </button>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                fullWidth
                icon={ArrowRight}
                onClick={() =>
                  navigate('/login', {
                    state: {
                      registeredEmail: formData.email,
                      registeredSuccess: successResponse.type === 'CUSTOMER',
                    },
                  })
                }
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            /* Registration Form */
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              {/* Global API Error Alert */}
              {apiError && (
                <div className="register-error-banner">
                  <AlertCircle size={18} className="error-banner-icon" />
                  <div style={{ flex: 1 }}>
                    <div>{apiError}</div>
                    {(apiError.toLowerCase().includes('already') || apiError.toLowerCase().includes('registered')) && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <Link
                          to="/login"
                          state={{ registeredEmail: formData.email }}
                          style={{
                            color: '#6366f1',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            fontSize: '0.85rem',
                          }}
                        >
                          Sign in to your account here →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Name Row: First Name & Last Name */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label htmlFor="firstName" className="form-field-label">
                    First Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={`form-field-input ${errors.firstName ? 'field-error' : ''}`}
                    placeholder="Jane"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <span className="field-error-text">{errors.firstName}</span>
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
                    className={`form-field-input ${errors.lastName ? 'field-error' : ''}`}
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="family-name"
                  />
                  {errors.lastName && (
                    <span className="field-error-text">{errors.lastName}</span>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div className="form-field-group">
                <label htmlFor="username" className="form-field-label">
                  Username <span className="required-star">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className={`form-field-input ${errors.username ? 'field-error' : ''}`}
                  placeholder="janedoe"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="username"
                />
                {errors.username && (
                  <span className="field-error-text">{errors.username}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="form-field-group">
                <label htmlFor="email" className="form-field-label">
                  Email Address <span className="required-star">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-field-input ${errors.email ? 'field-error' : ''}`}
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="field-error-text">{errors.email}</span>
                )}
              </div>

              {/* Mobile Phone Number */}
              <div className="form-field-group">
                <label htmlFor="phoneNumber" className="form-field-label">
                  Mobile Number <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>(Optional for SMS/OTP login)</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  className={`form-field-input ${errors.phoneNumber ? 'field-error' : ''}`}
                  placeholder="e.g. 9876543210 (10-digit number)"
                  value={formData.phoneNumber || ''}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="tel"
                />
                {errors.phoneNumber && (
                  <span className="field-error-text">{errors.phoneNumber}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-field-group">
                <label htmlFor="password" className="form-field-label">
                  Password <span className="required-star">*</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-field-input ${errors.password ? 'field-error' : ''}`}
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="field-error-text">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password Field (Frontend Only) */}
              <div className="form-field-group">
                <label htmlFor="confirmPassword" className="form-field-label">
                  Confirm Password <span className="required-star">*</span>
                </label>
                <div className="password-input-wrap">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-field-input ${errors.confirmPassword ? 'field-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error-text">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Vendor Business Details Section */}
              {accountType === 'VENDOR' && (
                <div className="vendor-fields-section">
                  <div className="section-divider-title">
                    <Building2 size={16} />
                    <span>Business Information</span>
                  </div>

                  {/* Business Notice */}
                  <div className="vendor-info-notice">
                    <AlertCircle size={15} />
                    <span>Vendor accounts require administrator review and approval before activation.</span>
                  </div>

                  {/* Business Name */}
                  <div className="form-field-group">
                    <label htmlFor="businessName" className="form-field-label">
                      Business / Store Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      className={`form-field-input ${errors.businessName ? 'field-error' : ''}`}
                      placeholder="Nivora Merchant LLC"
                      value={formData.businessName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.businessName && (
                      <span className="field-error-text">{errors.businessName}</span>
                    )}
                  </div>

                  {/* Business Email & Phone */}
                  <div className="form-row-2">
                    <div className="form-field-group">
                      <label htmlFor="businessEmail" className="form-field-label">
                        Business Email <span className="required-star">*</span>
                      </label>
                      <input
                        id="businessEmail"
                        name="businessEmail"
                        type="email"
                        className={`form-field-input ${errors.businessEmail ? 'field-error' : ''}`}
                        placeholder="contact@business.com"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.businessEmail && (
                        <span className="field-error-text">{errors.businessEmail}</span>
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
                        className={`form-field-input ${errors.businessPhone ? 'field-error' : ''}`}
                        placeholder="+1 555-0199"
                        value={formData.businessPhone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.businessPhone && (
                        <span className="field-error-text">{errors.businessPhone}</span>
                      )}
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="form-field-group">
                    <label htmlFor="businessAddress" className="form-field-label">
                      Business Address <span className="required-star">*</span>
                    </label>
                    <textarea
                      id="businessAddress"
                      name="businessAddress"
                      rows={2}
                      className={`form-field-input form-field-textarea ${errors.businessAddress ? 'field-error' : ''}`}
                      placeholder="123 Commerce St, Suite 400, New York, NY 10001"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.businessAddress && (
                      <span className="field-error-text">{errors.businessAddress}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="form-submit-row">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  icon={loading ? Loader2 : ArrowRight}
                  iconPosition="right"
                >
                  {loading
                    ? accountType === 'VENDOR'
                      ? 'Submitting Application...'
                      : 'Creating Account...'
                    : accountType === 'VENDOR'
                    ? 'Apply as Vendor Partner'
                    : 'Create Account'}
                </Button>
              </div>

              {/* Terms & Security Disclaimer */}
              <p className="register-terms-text">
                By registering, you agree to our Terms of Service & Privacy Policy.
                Protected by industry-standard encryption & secure marketplace protocols.
              </p>

              {/* Divider & Google Sign-Up */}
              <div className="login-divider" style={{ margin: '1.5rem 0' }}>
                <span>Or sign up with</span>
              </div>

              <button
                type="button"
                className="google-signin-btn"
                onClick={() => setShowGoogleModal(true)}
                disabled={loading}
              >
                <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="register-card-footer">
            <p className="register-switch-text">
              Already have an account?{' '}
              <Link to="/login" className="register-switch-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Google Modal Dialog */}
      {showGoogleModal && (
        <div className="google-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="google-modal-title">Google Sign-Up Status</h3>
                <p className="google-modal-subtitle">Single Sign-On Registration</p>
              </div>
            </div>

            <div style={{ padding: '0.25rem 0', color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.55' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#f1f5f9' }}>
                Google Sign-Up is temporarily unavailable.
              </p>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Secure Google OAuth2 registration is currently undergoing server-side integration.
                Please create your account using the registration form with your email and password.
              </p>
            </div>

            <div className="google-modal-actions">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowGoogleModal(false)}
              >
                Continue with Registration Form
              </Button>
              <Button variant="outline" fullWidth onClick={() => setShowGoogleModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {sentEmail && (
        <EmailPreviewModal
          email={sentEmail}
          isOpen={previewEmailModalOpen}
          onClose={() => setPreviewEmailModalOpen(false)}
        />
      )}
    </div>
  )
}

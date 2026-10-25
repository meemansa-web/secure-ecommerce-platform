import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import Button from '../components/common/Button'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, role } = useAuth()

  // Form State
  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Shared States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(
    location.state?.registeredSuccess
      ? 'Account created successfully! A welcome email was sent to your registered email.'
      : null
  )

  // Google Login Dialog State
  const [showGoogleModal, setShowGoogleModal] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'ADMIN') {
        const destination = location.state?.from?.pathname?.startsWith('/admin')
          ? location.state.from.pathname
          : '/admin/dashboard'
        navigate(destination, { replace: true })
      } else if (role === 'CUSTOMER') {
        const fromPath = location.state?.from?.pathname
        const destination = fromPath && !fromPath.startsWith('/admin') ? fromPath : '/'
        navigate(destination, { replace: true })
      } else if (role === 'VENDOR') {
        const destination = location.state?.from?.pathname?.startsWith('/vendor')
          ? location.state.from.pathname
          : '/vendor/dashboard'
        navigate(destination, { replace: true })
      }
    }
  }, [isAuthenticated, role, navigate, location])

  const validatePasswordForm = () => {
    const errs = {}
    if (!formData.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com)'
    }

    if (!formData.password) {
      errs.password = 'Password is required'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (error) setError(null)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!validatePasswordForm()) return

    setLoading(true)
    try {
      const response = await login(formData.email.trim().toLowerCase(), formData.password)
      redirectUserByRole(response.role)
    } catch (err) {
      setLoading(false)
      if (err.response) {
        const { status, data } = err.response
        const serverMessage = data?.message || data?.error
        if (status === 401) {
          setError(
            serverMessage ||
              'Invalid email or password. Please make sure you are entering your registered email address (not username).'
          )
        } else if (status === 403) {
          setError(
            serverMessage ||
              'Your account is pending verification or approval.'
          )
        } else {
          setError(serverMessage || 'Sign in failed. Please check credentials.')
        }
      } else {
        setError(err.message || 'An unexpected error occurred.')
      }
    }
  }

  const redirectUserByRole = (userRole) => {
    if (userRole === 'ADMIN') {
      const dest = location.state?.from?.pathname?.startsWith('/admin')
        ? location.state.from.pathname
        : '/admin/dashboard'
      navigate(dest, { replace: true })
    } else if (userRole === 'VENDOR') {
      const dest = location.state?.from?.pathname?.startsWith('/vendor')
        ? location.state.from.pathname
        : '/vendor/dashboard'
      navigate(dest, { replace: true })
    } else {
      const fromPath = location.state?.from?.pathname
      const dest = fromPath && !fromPath.startsWith('/admin') ? fromPath : '/'
      navigate(dest, { replace: true })
    }
  }

  return (
    <div className="login-page-root">
      <div className="login-card">
        {/* Brand Logo Header */}
        <div className="login-logo-header">
          <Link to="/" className="login-logo-link">
            <img src="/logo.png" alt="Nivora Logo" className="login-brand-logo-img" />
          </Link>
        </div>

        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">
          Access your Nivora shopping bag, orders, and curated wishlist.
        </p>

        {/* Info Message */}
        {infoMessage && (
          <div className="login-alert login-alert-success" role="status">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="login-alert login-alert-error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Password Login Form */}
        <form onSubmit={handlePasswordSubmit} className="login-form" noValidate>
          {/* Email */}
          <div className="login-form-group">
            <label className="login-label" htmlFor="login-email">
              Email Address <span className="required-star">*</span>
            </label>
            <div className="login-input-wrapper">
              <Mail size={17} className="login-field-icon" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handlePasswordChange}
                className={`login-input ${fieldErrors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {fieldErrors.email ? (
              <span className="login-field-error">{fieldErrors.email}</span>
            ) : (
              <span className="login-field-helper">
                Please enter your registered email address (e.g. <code>you@example.com</code>).
              </span>
            )}
          </div>

          {/* Password */}
          <div className="login-form-group">
            <div className="login-password-header">
              <label className="login-label" htmlFor="login-password">
                Password <span className="required-star">*</span>
              </label>
            </div>
            <div className="login-input-wrapper">
              <Lock size={17} className="login-field-icon" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handlePasswordChange}
                className={`login-input ${fieldErrors.password ? 'input-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="login-field-error">{fieldErrors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>Or continue with</span>
        </div>

        {/* Google Sign-In Button */}
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

        {/* Footer Links */}
        <div className="login-footer">
          <p className="login-footer-text">
            Don't have an account yet?{' '}
            <Link to="/register" className="login-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Google Sign-In Status Modal */}
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
                <h3 className="google-modal-title">Google Sign-In Status</h3>
                <p className="google-modal-subtitle">Single Sign-On Authentication</p>
              </div>
            </div>

            <div style={{ padding: '0.25rem 0', color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.55' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#f1f5f9' }}>
                Google Sign-In is temporarily unavailable.
              </p>
              <p style={{ margin: 0, color: '#94a3b8' }}>
                Secure Google OAuth2 authentication is currently undergoing server-side integration.
                Please sign in using your registered email and password.
              </p>
            </div>

            <div className="google-modal-actions">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowGoogleModal(false)}
              >
                Sign In with Email & Password
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowGoogleModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

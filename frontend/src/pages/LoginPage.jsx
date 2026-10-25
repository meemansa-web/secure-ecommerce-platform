import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { sendLoginOtp } from '../api/authApi'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithOtp, isAuthenticated, role } = useAuth()

  // Primary Login Mode: 'PASSWORD' (Default) | 'OTP' (Alternative)
  const [loginMode, setLoginMode] = useState('PASSWORD')

  // Password Form State
  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // OTP Form State
  const [otpStep, setOtpStep] = useState(1) // 1: Enter Identifier, 2: Enter 6 digits
  const [otpIdentifier, setOtpIdentifier] = useState(location.state?.registeredEmail || '')
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [otpDetails, setOtpDetails] = useState(null)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [resendingOtp, setResendingOtp] = useState(false)
  const otpInputRefs = useRef([])

  // Status States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(
    location.state?.registeredSuccess
      ? 'Account created successfully! Please sign in below.'
      : null
  )

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      redirectUserByRole(role)
    }
  }, [isAuthenticated, role])

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer = null
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [otpCountdown])

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
      const dest = fromPath && !fromPath.startsWith('/admin') && !fromPath.startsWith('/vendor')
        ? fromPath
        : '/'
      navigate(dest, { replace: true })
    }
  }

  // --------------------------------------------------------------------------
  // PASSWORD LOGIN HANDLERS
  // --------------------------------------------------------------------------

  const validatePasswordForm = () => {
    const errs = {}
    const trimmedEmail = formData.email.trim()

    if (!trimmedEmail) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address'
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
      if (!err.response) {
        setError('Unable to reach the server. Please ensure the backend is running.')
      } else {
        const { status, data } = err.response
        const serverMsg = data?.message || data?.error
        if (status === 401) {
          setError(serverMsg || 'Invalid email or password. Please verify your credentials.')
        } else if (status === 403) {
          setError(serverMsg || 'Your account is disabled, locked, or pending approval.')
        } else if (status === 404) {
          setError(serverMsg || 'No account registered with this email.')
        } else {
          setError(serverMsg || 'Sign in failed. Please check your credentials.')
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // OTP LOGIN HANDLERS
  // --------------------------------------------------------------------------

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    setError(null)
    setInfoMessage(null)

    const raw = otpIdentifier.trim()
    if (!raw) {
      setError('Please enter your email or mobile number.')
      return
    }

    const isEmail = raw.includes('@')
    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      setError('Please enter a valid email address')
      return
    }

    if (!isEmail) {
      const cleanDigits = raw.replace(/\D/g, '')
      if (cleanDigits.length < 10) {
        setError('Please enter a valid 10-digit mobile number')
        return
      }
    }

    setLoading(true)
    try {
      const res = await sendLoginOtp({ identifier: raw, purpose: 'LOGIN' })
      setOtpDetails(res)
      setOtpStep(2)
      setOtpCountdown(60)
      setOtpCode(['', '', '', '', '', ''])
      setInfoMessage(res.message || `Verification code sent to ${res.maskedIdentifier}`)

      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus()
        }
      }, 100)
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach the server. Please ensure the backend is running.')
      } else {
        const serverMsg = err.response?.data?.message || err.response?.data?.error
        setError(serverMsg || 'Failed to send verification code. Please check details.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || resendingOtp) return
    setError(null)
    setResendingOtp(true)

    try {
      const res = await sendLoginOtp({ identifier: otpIdentifier.trim(), purpose: 'LOGIN' })
      setOtpDetails(res)
      setOtpCountdown(60)
      setInfoMessage(`New verification code sent to ${res.maskedIdentifier}`)
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach the server. Please try again.')
      } else {
        const serverMsg = err.response?.data?.message || err.response?.data?.error
        setError(serverMsg || 'Could not resend code. Please try again.')
      }
    } finally {
      setResendingOtp(false)
    }
  }

  const handleOtpBoxChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '')
    if (!cleanVal && value !== '') return

    const newCode = [...otpCode]

    // Handle paste of 6 digits
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split('')
      for (let i = 0; i < 6; i++) {
        newCode[i] = chars[i] || ''
      }
      setOtpCode(newCode)
      const nextFocus = Math.min(chars.length, 5)
      otpInputRefs.current[nextFocus]?.focus()
      return
    }

    newCode[index] = cleanVal
    setOtpCode(newCode)

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const codeStr = otpCode.join('')

    if (codeStr.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setLoading(true)
    try {
      const authResponse = await loginWithOtp(otpIdentifier.trim(), codeStr)
      redirectUserByRole(authResponse.role)
    } catch (err) {
      setLoading(false)
      if (!err.response) {
        setError('Unable to reach the server. Please try again.')
      } else {
        const serverMsg = err.response?.data?.message || err.response?.data?.error
        setError(serverMsg || 'Invalid verification code. Please check and try again.')
      }
    }
  }

  return (
    <div className="signin-root">
      <div className="signin-card">
        {/* Brand Logo Header */}
        <div className="signin-brand-header">
          <Link to="/" className="signin-logo-link" aria-label="Return to Storefront">
            <img src="/logo.png" alt="Nivora" className="signin-brand-logo" />
          </Link>
          <h1 className="signin-title">Welcome back</h1>
          <p className="signin-subtitle">Sign in to your account</p>
        </div>

        {/* Minimal Secondary Mode Switcher */}
        <div className="signin-mode-switcher" role="tablist" aria-label="Sign In Method">
          <button
            type="button"
            role="tab"
            aria-selected={loginMode === 'PASSWORD'}
            className={`signin-mode-pill ${loginMode === 'PASSWORD' ? 'active' : ''}`}
            onClick={() => {
              setLoginMode('PASSWORD')
              setError(null)
            }}
          >
            Password
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={loginMode === 'OTP'}
            className={`signin-mode-pill ${loginMode === 'OTP' ? 'active' : ''}`}
            onClick={() => {
              setLoginMode('OTP')
              setError(null)
            }}
          >
            OTP Code
          </button>
        </div>

        {/* Feedback Alerts */}
        {infoMessage && (
          <div className="signin-alert signin-alert-success" role="status">
            <CheckCircle2 size={16} className="alert-icon" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="signin-alert signin-alert-error" role="alert">
            <AlertCircle size={16} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* PASSWORD SIGN-IN MODE (Primary)                                   */}
        {/* ----------------------------------------------------------------- */}
        {loginMode === 'PASSWORD' && (
          <form onSubmit={handlePasswordSubmit} className="signin-form" noValidate>
            {/* Email Field */}
            <div className="signin-field-group">
              <label className="signin-label" htmlFor="signin-email">
                Email
              </label>
              <div className="signin-input-wrap">
                <Mail size={16} className="signin-input-icon" />
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handlePasswordChange}
                  className={`signin-input ${fieldErrors.email ? 'has-error' : ''}`}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {fieldErrors.email && (
                <span className="signin-field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="signin-field-group">
              <label className="signin-label" htmlFor="signin-password">
                Password
              </label>
              <div className="signin-input-wrap">
                <Lock size={16} className="signin-input-icon" />
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={`signin-input ${fieldErrors.password ? 'has-error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="signin-eye-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="signin-field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="signin-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="signin-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* OTP SIGN-IN MODE (Alternative)                                    */}
        {/* ----------------------------------------------------------------- */}
        {loginMode === 'OTP' && (
          <div className="signin-otp-flow">
            {otpStep === 1 ? (
              <form onSubmit={handleSendOtp} className="signin-form" noValidate>
                <div className="signin-field-group">
                  <label className="signin-label" htmlFor="otp-identifier">
                    Email or Mobile Number
                  </label>
                  <div className="signin-input-wrap">
                    {otpIdentifier.includes('@') ? (
                      <Mail size={16} className="signin-input-icon" />
                    ) : (
                      <Smartphone size={16} className="signin-input-icon" />
                    )}
                    <input
                      id="otp-identifier"
                      name="otpIdentifier"
                      type="text"
                      autoComplete="username"
                      placeholder="name@example.com or 10-digit number"
                      value={otpIdentifier}
                      onChange={(e) => {
                        setOtpIdentifier(e.target.value)
                        if (error) setError(null)
                      }}
                      className="signin-input"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="signin-submit-btn"
                  disabled={loading || !otpIdentifier.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="signin-spinner" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="signin-form" noValidate>
                <div className="signin-otp-header">
                  <div className="signin-otp-recipient">
                    <span className="recipient-label">Code sent to:</span>
                    <strong className="recipient-val">
                      {otpDetails?.maskedIdentifier || otpIdentifier}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="signin-change-btn"
                    onClick={() => {
                      setOtpStep(1)
                      setError(null)
                    }}
                  >
                    <ArrowLeft size={12} />
                    <span>Change</span>
                  </button>
                </div>

                <div className="signin-field-group">
                  <label className="signin-label">6-Digit Code</label>
                  <div className="signin-digits-row">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`signin-digit-box ${digit ? 'filled' : ''}`}
                        disabled={loading}
                      />
                    ))}
                  </div>
                </div>

                <div className="signin-resend-row">
                  {otpCountdown > 0 ? (
                    <span className="signin-cooldown-text">
                      Resend in {otpCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="signin-resend-btn"
                      onClick={handleResendOtp}
                      disabled={resendingOtp}
                    >
                      <RefreshCw size={13} className={resendingOtp ? 'signin-spinner' : ''} />
                      <span>{resendingOtp ? 'Resending...' : 'Resend Code'}</span>
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="signin-submit-btn"
                  disabled={loading || otpCode.join('').length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="signin-spinner" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Sign In</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Compact Footer Link */}
        <div className="signin-footer">
          <p className="signin-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="signin-footer-link">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

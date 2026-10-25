import React from 'react'
import { Link } from 'react-router-dom'
import { Lock, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react'
import Button from '../components/common/Button'
import './AuthPlaceholderPage.css'

export default function AuthPlaceholderPage({ mode = 'login' }) {
  const isLogin = mode === 'login'

  return (
    <div className="auth-page-root">
      <div className="auth-card">
        <div className="auth-icon-wrapper">
          {isLogin ? <Lock size={28} /> : <UserCheck size={28} />}
        </div>

        <div className="auth-phase-tag">
          <ShieldCheck size={14} />
          <span>Phase 1 UI Preview</span>
        </div>

        <h1 className="auth-title">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h1>

        <p className="auth-subtitle">
          {isLogin
            ? 'Access your customer or vendor portal with enterprise credentials.'
            : 'Join our marketplace as a customer or register as a verified vendor.'}
        </p>

        {/* Form Layout Shell */}
        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                disabled
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address / Username</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@example.com"
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              disabled
            />
          </div>

          <div className="auth-notice-box">
            <p>
              Sign in to manage your customer account, track purchases, and explore curated collections.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled
            icon={ArrowRight}
            iconPosition="right"
          >
            {isLogin ? 'Sign In (Phase 2)' : 'Create Account (Phase 2)'}
          </Button>
        </form>

        <div className="auth-footer-text">
          {isLogin ? (
            <p>
              Don't have an account yet?{' '}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

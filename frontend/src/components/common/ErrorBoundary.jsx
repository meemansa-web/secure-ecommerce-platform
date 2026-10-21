import React from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary, #fbfaf7)',
            color: 'var(--text-primary, #171716)',
            padding: '2rem',
            fontFamily: 'var(--font-sans, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-subtle, rgba(23, 23, 22, 0.1))',
              borderRadius: '12px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card, 0 8px 24px rgba(23, 23, 22, 0.06))',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-olive-light, #edf2eb)',
                color: 'var(--accent-olive, #3f4c3c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary, #4a4843)',
                marginBottom: '2rem',
                lineHeight: 1.6,
              }}
            >
              An unexpected error occurred while loading this view. You can reload the page or return to the storefront home.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--text-primary, #171716)',
                  color: 'var(--bg-primary, #ffffff)',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={16} />
                Refresh Page
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary, #171716)',
                  border: '1px solid var(--border-medium, rgba(23, 23, 22, 0.2))',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Home size={16} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import Button from '../components/common/Button'
import './UnauthorizedPage.css'

export default function UnauthorizedPage() {
  const { logout } = useAuth()

  return (
    <div className="unauthorized-page-root">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-wrapper">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>

        <span className="unauthorized-badge">Restricted Access</span>

        <h1 className="unauthorized-title">Access Restricted</h1>

        <p className="unauthorized-desc">
          Your account does not have permission to view this management section.
          If you are an administrator, please sign in with an administrator account.
        </p>

        <div className="unauthorized-actions">
          <Link to="/">
            <Button variant="secondary" icon={ArrowLeft} iconPosition="left">
              Return to Storefront
            </Button>
          </Link>
          <Button variant="outline" icon={LogOut} iconPosition="right" onClick={logout}>
            Sign Out & Switch Account
          </Button>
        </div>
      </div>
    </div>
  )
}

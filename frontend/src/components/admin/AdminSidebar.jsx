import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  Layers,
  User,
  KeyRound,
  Store,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getPendingVendors } from '../../api/adminApi'

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending vendors count for badge indicator
  useEffect(() => {
    let isMounted = true
    const fetchPendingCount = async () => {
      try {
        const pending = await getPendingVendors()
        if (isMounted && Array.isArray(pending)) {
          setPendingCount(pending.length)
        }
      } catch {
        // Silently handle if not loaded
      }
    }
    fetchPendingCount()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    onCloseMobile()
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`.trim()
    : user?.name || user?.username || 'Administrator'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD'

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar-root ${mobileOpen ? 'admin-sidebar-open' : ''}`}>
        {/* Mobile Header with close button */}
        <div className="admin-sidebar-mobile-header">
          <span className="sidebar-mobile-title">Management Menu</span>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-avatar">{initials}</div>
          <div className="admin-sidebar-user-meta">
            <span className="admin-sidebar-user-name">{displayName}</span>
            <span className="admin-sidebar-user-email">{user?.email}</span>
            <span className="admin-verified-badge">
              <ShieldCheck size={11} />
              <span>Full Access</span>
            </span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="admin-nav-body">
          {/* OVERVIEW */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">OVERVIEW</span>
            <NavLink
              to="/admin/dashboard"
              end
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* MANAGEMENT */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">MANAGEMENT</span>

            <NavLink
              to="/admin/customers"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Users size={18} />
              <span>Customers</span>
            </NavLink>

            <NavLink
              to="/admin/vendors"
              end
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Building2 size={18} />
              <span>Vendors</span>
            </NavLink>

            <NavLink
              to="/admin/vendors/pending"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Clock size={18} />
              <span className="nav-link-text">Pending Vendors</span>
              {pendingCount > 0 && (
                <span className="pending-badge-counter">{pendingCount}</span>
              )}
            </NavLink>

            <NavLink
              to="/admin/categories"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Layers size={18} />
              <span>Categories</span>
            </NavLink>
          </div>

          {/* ACCOUNT */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">ACCOUNT</span>

            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <User size={18} />
              <span>Profile</span>
            </NavLink>

            <NavLink
              to="/admin/change-password"
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <KeyRound size={18} />
              <span>Change Password</span>
            </NavLink>
          </div>

          {/* NAVIGATION */}
          <div className="admin-nav-group">
            <span className="admin-nav-group-label">NAVIGATION</span>

            <Link
              to="/"
              className="admin-nav-link"
              onClick={onCloseMobile}
            >
              <Store size={18} />
              <span>View Store</span>
            </Link>
          </div>
        </nav>

        {/* Footer Logout */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

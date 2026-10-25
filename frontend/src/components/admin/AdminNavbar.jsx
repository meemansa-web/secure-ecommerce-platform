import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  Shield,
  ChevronDown,
  User,
  KeyRound,
  Store,
  Bell,
  Search,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/useAuth'

export default function AdminNavbar({ onToggleSidebar, mobileNavOpen }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  // Display preferred first name / full name, never email as primary
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
    <header className="admin-navbar-root">
      <div className="admin-navbar-left">
        <button
          type="button"
          className="admin-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={mobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <Link to="/admin/dashboard" className="admin-navbar-brand">
          <img src="/logo-icon.png" alt="Nivora" className="admin-brand-logo-img" />
          <span className="admin-brand-title">NIVORA</span>
          <span className="admin-badge-pill">
            <Shield size={11} strokeWidth={2.2} />
            <span>ADMIN CONSOLE</span>
          </span>
        </Link>
      </div>

      {/* Middle Search UI */}
      <div className="admin-navbar-center">
        <div className="admin-navbar-search-box">
          <Search size={15} className="admin-nav-search-icon" />
          <input
            type="text"
            className="admin-nav-search-input"
            placeholder="Search console..."
            aria-label="Search console"
          />
        </div>
      </div>

      <div className="admin-navbar-right">
        {/* Notification Icon UI */}
        <button
          type="button"
          className="admin-icon-btn admin-notif-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="admin-notif-pulse" />
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          className="admin-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Admin Account Dropdown */}
        <div className="admin-dropdown-container" ref={dropdownRef}>
          <button
            type="button"
            className={`admin-account-btn ${dropdownOpen ? 'admin-account-btn-active' : ''}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="admin-avatar-small">{initials}</div>
            <span className="admin-account-name">{displayName}</span>
            <ChevronDown size={14} className={`admin-chevron ${dropdownOpen ? 'chevron-up' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="admin-account-menu" role="menu">
              <div className="admin-menu-header">
                <span className="admin-menu-name">{displayName}</span>
                <span className="admin-menu-email">{user?.email}</span>
                <span className="admin-menu-role">Platform Administrator</span>
              </div>

              <div className="admin-menu-divider" />

              <Link
                to="/admin/profile"
                className="admin-menu-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={15} />
                <span>My Profile</span>
              </Link>

              <Link
                to="/admin/change-password"
                className="admin-menu-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <KeyRound size={15} />
                <span>Change Password</span>
              </Link>

              <Link
                to="/"
                className="admin-menu-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <Store size={15} />
                <span>View Store</span>
              </Link>

              <div className="admin-menu-divider" />

              <button
                type="button"
                className="admin-menu-item admin-menu-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  User,
  KeyRound,
  LogOut,
  ExternalLink,
  Store,
  ShieldCheck,
  Package,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getVendorProfile } from '../../api/vendorApi'

export default function VendorNavbar({ onToggleSidebar, mobileNavOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark'
  })

  const dropdownRef = useRef(null)

  // Fetch Vendor Profile for Business Name
  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        const data = await getVendorProfile()
        if (isMounted) {
          setProfile(data)
        }
      } catch {
        // Silently continue with session user
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  // Sync theme changes
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('modimal_theme', next)
    setTheme(next)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const businessName = profile?.businessName || 'My Business'
  const vendorName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.name || user?.username || 'Vendor'

  const initials = (profile?.businessName || vendorName)
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VP'

  return (
    <header className="vendor-navbar-root">
      {/* LEFT: Toggle & Brand */}
      <div className="vendor-navbar-left">
        <button
          type="button"
          className="vendor-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={mobileNavOpen ? 'Close Navigation' : 'Open Navigation'}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/vendor/dashboard" className="vendor-navbar-brand">
          <img src="/logo-icon.png" alt="Nivora" className="vendor-brand-logo-img" />
          <span className="vendor-brand-title">NIVORA</span>
          <span className="vendor-badge-pill">
            <Store size={12} />
            <span>PARTNER HUB</span>
          </span>
        </Link>
      </div>

      {/* CENTER: Business Identity Badge */}
      <div className="vendor-navbar-center">
        <div className="vendor-merchant-indicator">
          <ShieldCheck size={14} color="var(--accent-olive)" />
          <span>
            Merchant: <strong>{businessName}</strong>
          </span>
        </div>
      </div>

      {/* RIGHT: Storefront Link, Theme Toggle, Profile Menu */}
      <div className="vendor-navbar-right">
        {/* Quick link to live storefront */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="vendor-nav-storefront-btn"
          title="Open customer storefront in a new tab"
        >
          <span>Storefront</span>
          <ExternalLink size={13} />
        </Link>

        {/* Theme Toggle */}
        <button
          type="button"
          className="vendor-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Account Dropdown */}
        <div className="vendor-dropdown-container" ref={dropdownRef}>
          <button
            type="button"
            className={`vendor-account-btn ${menuOpen ? 'vendor-account-btn-active' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
          >
            <div className="vendor-avatar-small">{initials}</div>
            <span className="vendor-account-name">{businessName}</span>
            <ChevronDown size={14} className={`vendor-chevron ${menuOpen ? 'chevron-up' : ''}`} />
          </button>

          {menuOpen && (
            <div className="vendor-account-menu">
              <div className="vendor-menu-header">
                <span className="vendor-menu-name">{vendorName}</span>
                <span className="vendor-menu-email">{user?.email || profile?.email}</span>
                <span className="vendor-menu-role">Approved Merchant</span>
              </div>

              <div className="vendor-menu-divider" />

              <Link
                to="/vendor/products/new"
                className="vendor-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <Package size={15} />
                <span>Upload New Product</span>
              </Link>

              <Link
                to="/vendor/profile"
                className="vendor-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} />
                <span>Store Profile</span>
              </Link>

              <Link
                to="/vendor/change-password"
                className="vendor-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <KeyRound size={15} />
                <span>Security Settings</span>
              </Link>

              <div className="vendor-menu-divider" />

              <button
                type="button"
                className="vendor-menu-item vendor-menu-logout"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  Building2,
  KeyRound,
  LogOut,
  ExternalLink,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getVendorProfile, getLowStockProducts } from '../../api/vendorApi'

export default function VendorSidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [lowStockCount, setLowStockCount] = useState(0)

  // Load profile and low stock count
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [profileData, lowStockData] = await Promise.allSettled([
          getVendorProfile(),
          getLowStockProducts(),
        ])

        if (isMounted) {
          if (profileData.status === 'fulfilled') {
            setProfile(profileData.value)
          }
          if (lowStockData.status === 'fulfilled' && Array.isArray(lowStockData.value)) {
            setLowStockCount(lowStockData.value.length)
          }
        }
      } catch {
        // Silently handle
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    onCloseMobile()
    logout()
    navigate('/login', { replace: true })
  }

  const businessName = profile?.businessName || user?.name || 'My Store'
  const email = profile?.email || user?.email || ''

  const initials = businessName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'VP'

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && <div className="vendor-sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`vendor-sidebar-root ${mobileOpen ? 'vendor-sidebar-open' : ''}`}>
        {/* Mobile Header */}
        <div className="vendor-sidebar-mobile-header">
          <span className="sidebar-mobile-title">Partner Navigation</span>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className="vendor-sidebar-user">
          <div className="vendor-sidebar-avatar">{initials}</div>
          <div className="vendor-sidebar-user-meta">
            <span className="vendor-sidebar-user-name" title={businessName}>
              {businessName}
            </span>
            <span className="vendor-sidebar-user-email" title={email}>
              {email}
            </span>
            <span className="vendor-verified-badge">
              <ShieldCheck size={11} />
              <span>Verified Merchant</span>
            </span>
          </div>
        </div>

        {/* Navigation Body */}
        <div className="vendor-nav-body">
          {/* Main Group */}
          <div className="vendor-nav-group">
            <span className="vendor-nav-group-label">Catalog Management</span>

            <NavLink
              to="/vendor/dashboard"
              end
              className={({ isActive }) =>
                `vendor-nav-link ${isActive ? 'vendor-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <LayoutDashboard size={18} />
              <span className="nav-link-text">Overview</span>
            </NavLink>

            <NavLink
              to="/vendor/products"
              end
              className={({ isActive }) =>
                `vendor-nav-link ${isActive ? 'vendor-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Package size={18} />
              <span className="nav-link-text">My Products</span>
            </NavLink>

            <NavLink
              to="/vendor/products/new"
              className={({ isActive }) =>
                `vendor-nav-link ${isActive ? 'vendor-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <PlusCircle size={18} />
              <span className="nav-link-text">Upload Product</span>
            </NavLink>

            <NavLink
              to="/vendor/inventory"
              className={({ isActive }) =>
                `vendor-nav-link ${isActive ? 'vendor-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Boxes size={18} />
              <span className="nav-link-text">Stock & Inventory</span>
              {lowStockCount > 0 && (
                <span
                  className="low-stock-badge-counter"
                  title={`${lowStockCount} items have low stock`}
                >
                  {lowStockCount}
                </span>
              )}
            </NavLink>
          </div>

          {/* Account Group */}
          <div className="vendor-nav-group">
            <span className="vendor-nav-group-label">Store Settings</span>

            <NavLink
              to="/vendor/profile"
              className={({ isActive }) =>
                `vendor-nav-link ${isActive ? 'vendor-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <Building2 size={18} />
              <span className="nav-link-text">Store Profile</span>
            </NavLink>

            <NavLink
              to="/vendor/change-password"
              className={({ isActive }) =>
                `vendor-nav-link ${isActive ? 'vendor-nav-link-active' : ''}`
              }
              onClick={onCloseMobile}
            >
              <KeyRound size={18} />
              <span className="nav-link-text">Security</span>
            </NavLink>
          </div>
        </div>

        {/* Footer */}
        <div className="vendor-sidebar-footer">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="vendor-sidebar-footer-link"
          >
            <ExternalLink size={16} />
            <span>Customer Storefront</span>
          </Link>

          <button
            type="button"
            className="vendor-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

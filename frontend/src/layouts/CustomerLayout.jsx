import React, { useState } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  MapPin,
  KeyRound,
  ShoppingBag,
  Heart,
  Package,
  Compass,
  Grid,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import './CustomerLayout.css'

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  // Real customer name from profile
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || user?.username || 'Customer'

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'C'

  return (
    <div className="customer-layout-root">
      <Navbar />

      <div className="customer-layout-container">
        {/* Mobile Sidebar Toggle Header */}
        <div className="customer-mobile-bar">
          <button
            type="button"
            className="customer-sidebar-toggle-btn"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle Portal Menu"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            <span>Account Menu</span>
          </button>
          <span className="customer-mobile-user-name">{displayName}</span>
        </div>

        <div className="customer-layout-body">
          {/* Sidebar */}
          <aside className={`customer-sidebar ${mobileNavOpen ? 'customer-sidebar-open' : ''}`}>
            {/* User Profile Header in Sidebar */}
            <div className="customer-sidebar-header">
              <div className="customer-avatar">{initials}</div>
              <div className="customer-meta">
                <span className="customer-name">{displayName}</span>
                <span className="customer-email">{user?.email}</span>
                <span className="customer-role-badge">
                  <ShieldCheck size={12} />
                  <span>Customer</span>
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="customer-nav">
              {/* Main Dashboard */}
              <div className="customer-nav-section">
                <NavLink
                  to="/customer/dashboard"
                  end
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </NavLink>
              </div>

              {/* MY ACCOUNT */}
              <div className="customer-nav-section">
                <span className="customer-nav-section-title">My Account</span>

                <NavLink
                  to="/customer/profile"
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <User size={18} />
                  <span>Profile</span>
                </NavLink>

                <NavLink
                  to="/customer/addresses"
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <MapPin size={18} />
                  <span>Addresses</span>
                </NavLink>

                <NavLink
                  to="/customer/change-password"
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <KeyRound size={18} />
                  <span>Change Password</span>
                </NavLink>
              </div>

              {/* MY SHOPPING */}
              <div className="customer-nav-section">
                <span className="customer-nav-section-title">My Shopping</span>

                <NavLink
                  to="/customer/cart"
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <ShoppingBag size={18} />
                  <span>Cart</span>
                </NavLink>

                <NavLink
                  to="/customer/wishlist"
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Heart size={18} />
                  <span>Wishlist</span>
                </NavLink>

                <NavLink
                  to="/customer/orders"
                  className={({ isActive }) =>
                    `customer-nav-item ${isActive ? 'customer-nav-item-active' : ''}`
                  }
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Package size={18} />
                  <span>Orders</span>
                </NavLink>
              </div>

              {/* DISCOVER */}
              <div className="customer-nav-section">
                <span className="customer-nav-section-title">Discover</span>

                <Link
                  to="/products"
                  className="customer-nav-item"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Compass size={18} />
                  <span>Shop Products</span>
                </Link>

                <Link
                  to="/categories"
                  className="customer-nav-item"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Grid size={18} />
                  <span>Categories</span>
                </Link>
              </div>
            </nav>

            {/* Logout Action */}
            <div className="customer-sidebar-footer">
              <button
                type="button"
                className="customer-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="customer-content-area">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

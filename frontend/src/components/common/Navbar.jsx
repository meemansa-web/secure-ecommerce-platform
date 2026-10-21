import React, { useState, useRef, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  MapPin,
  Package,
  KeyRound,
  LogOut,
  Shield,
  Store,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import ProductSubNavbar from '../navigation/ProductSubNavbar'
import './Navbar.css'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, user, role, logout } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setDropdownOpen(false)
    closeMobileMenu()
    logout()
    navigate('/', { replace: true })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  const customerFirstName = user?.firstName || user?.name || 'Customer'

  return (
    <header className="navbar-root">
      {/* Luxury Announcement Bar */}
      <div className="announcement-bar">
        <p className="announcement-text">
          COMPLIMENTARY DELIVERY ON ELIGIBLE ORDERS &nbsp;•&nbsp; SHOP THE LATEST COLLECTION
        </p>
      </div>

      {/* Main Glassmorphic Navbar */}
      <div className="navbar-main">
        <div className="navbar-inner">
          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          {/* LEFT: Brand Logo */}
          <div className="navbar-brand-col">
            <Link to="/" className="navbar-brand-link">
              <img src="/logo-icon.png" alt="Nivora Logo" className="navbar-brand-img" />
              <div className="navbar-brand-text">
                <span className="navbar-brand-name">NIVORA</span>
                <span className="navbar-brand-sub">SHOP • DISCOVER • ENJOY</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation Links */}
          <nav className="navbar-center-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}
            >
              Shop
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}
            >
              Categories
            </NavLink>
            <NavLink
              to="/products?filter=new"
              className={({ isActive }) => `navbar-link ${isActive ? 'navbar-link-active' : ''}`}
            >
              New Arrivals
            </NavLink>
          </nav>

          {/* RIGHT: Action Icons & Dark Mode Toggle */}
          <div className="navbar-right-actions">
            {/* Search Trigger */}
            <button
              type="button"
              className="navbar-icon-btn"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search catalog"
              title="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Dark/Light Mode Switcher */}
            <button
              type="button"
              className="navbar-icon-btn theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon size={19} strokeWidth={1.5} className="theme-icon moon-icon" />
              ) : (
                <Sun size={19} strokeWidth={1.5} className="theme-icon sun-icon" />
              )}
            </button>

            {/* If Authenticated Vendor: Show Vendor Hub shortcut */}
            {isAuthenticated && role === 'VENDOR' ? (
              <div className="navbar-auth-buttons">
                <Link to="/vendor/dashboard" className="navbar-auth-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Store size={14} />
                  <span>Vendor Hub</span>
                </Link>
                <button
                  type="button"
                  className="navbar-icon-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : isAuthenticated && role === 'ADMIN' ? (
              <div className="navbar-auth-buttons">
                <Link to="/admin/dashboard" className="navbar-auth-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={14} />
                  <span>Admin Console</span>
                </Link>
                <button
                  type="button"
                  className="navbar-icon-btn"
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : isAuthenticated && role === 'CUSTOMER' ? (
              <>
                {/* Wishlist Link */}
                <Link
                  to="/customer/wishlist"
                  className="navbar-icon-btn"
                  aria-label="Wishlist"
                  title="My Wishlist"
                >
                  <Heart size={19} strokeWidth={1.5} />
                  {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
                </Link>

                {/* Cart Link */}
                <Link
                  to="/customer/cart"
                  className="navbar-icon-btn"
                  aria-label="Cart"
                  title="My Cart"
                >
                  <ShoppingBag size={19} strokeWidth={1.5} />
                  {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
                </Link>

                {/* Customer Name Dropdown */}
                <div className="customer-dropdown-container" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`customer-dropdown-trigger ${dropdownOpen ? 'trigger-active' : ''}`}
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="customer-trigger-name">{customerFirstName}</span>
                    <ChevronDown
                      size={14}
                      className={`dropdown-chevron ${dropdownOpen ? 'chevron-rotated' : ''}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="customer-dropdown-menu" role="menu">
                      <div className="dropdown-greeting-box">
                        <span className="greeting-hi">Hi, {customerFirstName}</span>
                        <span className="greeting-email">{user?.email}</span>
                      </div>

                      <div className="dropdown-links-list">
                        <Link
                          to="/customer/dashboard"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span>My Dashboard</span>
                        </Link>

                        <Link
                          to="/customer/profile"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/customer/addresses"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <MapPin size={16} />
                          <span>My Addresses</span>
                        </Link>

                        <Link
                          to="/customer/orders"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Package size={16} />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/customer/wishlist"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Heart size={16} />
                          <span>My Wishlist</span>
                        </Link>

                        <Link
                          to="/customer/cart"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <ShoppingBag size={16} />
                          <span>My Cart</span>
                        </Link>

                        <Link
                          to="/customer/change-password"
                          className="dropdown-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <KeyRound size={16} />
                          <span>Change Password</span>
                        </Link>
                      </div>

                      <div className="dropdown-footer">
                        <button
                          type="button"
                          className="dropdown-logout-btn"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* If Unauthenticated: Show Wishlist, Cart, Login & Register links */
              <div className="navbar-auth-buttons">
                <Link
                  to="/customer/wishlist"
                  className="navbar-icon-btn"
                  aria-label="Wishlist"
                  title="My Wishlist"
                  style={{ marginRight: '0.2rem' }}
                >
                  <Heart size={19} strokeWidth={1.5} />
                  {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
                </Link>
                <Link
                  to="/customer/cart"
                  className="navbar-icon-btn"
                  aria-label="Cart"
                  title="My Cart"
                  style={{ marginRight: '0.25rem' }}
                >
                  <ShoppingBag size={19} strokeWidth={1.5} />
                  {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
                </Link>
                <Link to="/login" className="navbar-auth-link">
                  Sign In
                </Link>
                <Link to="/register" className="navbar-auth-btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="navbar-search-drawer">
            <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
              <Search size={18} strokeWidth={1.5} className="search-input-icon" />
              <input
                type="text"
                className="search-inline-input"
                placeholder="Search products, brands, collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="search-close-btn"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Secondary Product Navigation Bar (Gender, Category, Brand) */}
      <ProductSubNavbar />

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-brand-wrap">
                <img src="/logo-icon.png" alt="Nivora Logo" className="mobile-brand-img" />
                <span className="mobile-brand-title">NIVORA</span>
              </div>
              <button
                type="button"
                className="mobile-close-btn"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={1.5} />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="mobile-menu-nav">
              <NavLink to="/" end onClick={closeMobileMenu} className="mobile-menu-link">
                Home
              </NavLink>
              <NavLink to="/products" onClick={closeMobileMenu} className="mobile-menu-link">
                Shop All
              </NavLink>
              <NavLink to="/categories" onClick={closeMobileMenu} className="mobile-menu-link">
                Categories
              </NavLink>
              <NavLink to="/products?filter=new" onClick={closeMobileMenu} className="mobile-menu-link">
                New Arrivals
              </NavLink>
            </nav>

            {/* Quick Filter Sections for Mobile (Gender, Categories, Brands) */}
            <div className="mobile-nav-dimensions">
              <div className="mobile-dimension-group">
                <span className="mobile-dim-label">SHOP BY GENDER</span>
                <div className="mobile-dim-chips">
                  <Link to="/products?gender=women" onClick={closeMobileMenu} className="mobile-chip">Women</Link>
                  <Link to="/products?gender=men" onClick={closeMobileMenu} className="mobile-chip">Men</Link>
                  <Link to="/products?gender=kids" onClick={closeMobileMenu} className="mobile-chip">Kids</Link>
                </div>
              </div>

              <div className="mobile-dimension-group">
                <span className="mobile-dim-label">TOP BRANDS</span>
                <div className="mobile-dim-chips">
                  <Link to="/products?brand=rare-rabbit" onClick={closeMobileMenu} className="mobile-chip">Rare Rabbit</Link>
                  <Link to="/products?brand=puma" onClick={closeMobileMenu} className="mobile-chip">Puma</Link>
                  <Link to="/products?brand=fabindia" onClick={closeMobileMenu} className="mobile-chip">FabIndia</Link>
                  <Link to="/products?brand=zara" onClick={closeMobileMenu} className="mobile-chip">Zara</Link>
                </div>
              </div>
            </div>

            <div className="mobile-theme-row">
              <span className="mobile-theme-label">Appearance</span>
              <button
                type="button"
                className="mobile-theme-toggle"
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={16} strokeWidth={1.5} />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} strokeWidth={1.5} />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Auth / Customer Section */}
            <div className="mobile-menu-footer">
              {isAuthenticated && role === 'ADMIN' ? (
                <div className="mobile-customer-portal">
                  <div className="mobile-customer-header">
                    <span className="mobile-customer-title">Admin Console</span>
                    <span className="mobile-customer-email">{user?.email}</span>
                  </div>
                  <div className="mobile-customer-links">
                    <Link to="/admin/dashboard" onClick={closeMobileMenu} className="mobile-customer-item">
                      <LayoutDashboard size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link to="/admin/vendors" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Package size={16} />
                      <span>Vendor Management</span>
                    </Link>
                    <Link to="/admin/categories" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Package size={16} />
                      <span>Categories</span>
                    </Link>
                    <Link to="/admin/customers" onClick={closeMobileMenu} className="mobile-customer-item">
                      <User size={16} />
                      <span>Customer Management</span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : isAuthenticated && role === 'VENDOR' ? (
                <div className="mobile-customer-portal">
                  <div className="mobile-customer-header">
                    <span className="mobile-customer-title">{user?.name || 'Merchant'}</span>
                    <span className="mobile-customer-email">{user?.email}</span>
                  </div>

                  <div className="mobile-customer-links">
                    <Link to="/vendor/dashboard" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Store size={16} />
                      <span>Vendor Dashboard</span>
                    </Link>
                    <Link to="/vendor/products" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Package size={16} />
                      <span>My Products</span>
                    </Link>
                    <Link to="/vendor/products/new" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Package size={16} />
                      <span>Upload Product</span>
                    </Link>
                    <Link to="/vendor/inventory" onClick={closeMobileMenu} className="mobile-customer-item">
                      <LayoutDashboard size={16} />
                      <span>Stock & Inventory</span>
                    </Link>
                    <Link to="/vendor/profile" onClick={closeMobileMenu} className="mobile-customer-item">
                      <User size={16} />
                      <span>Store Profile</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : isAuthenticated && role === 'CUSTOMER' ? (
                <div className="mobile-customer-portal">
                  <div className="mobile-customer-header">
                    <span className="mobile-customer-title">Hi, {customerFirstName}</span>
                    <span className="mobile-customer-email">{user?.email}</span>
                  </div>

                  <div className="mobile-customer-links">
                    <Link to="/customer/dashboard" onClick={closeMobileMenu} className="mobile-customer-item">
                      <LayoutDashboard size={16} />
                      <span>My Dashboard</span>
                    </Link>
                    <Link to="/customer/profile" onClick={closeMobileMenu} className="mobile-customer-item">
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link to="/customer/addresses" onClick={closeMobileMenu} className="mobile-customer-item">
                      <MapPin size={16} />
                      <span>My Addresses</span>
                    </Link>
                    <Link to="/customer/orders" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Package size={16} />
                      <span>My Orders</span>
                    </Link>
                    <Link to="/customer/wishlist" onClick={closeMobileMenu} className="mobile-customer-item">
                      <Heart size={16} />
                      <span>My Wishlist</span>
                    </Link>
                    <Link to="/customer/cart" onClick={closeMobileMenu} className="mobile-customer-item">
                      <ShoppingBag size={16} />
                      <span>My Cart</span>
                    </Link>
                    <Link to="/customer/change-password" onClick={closeMobileMenu} className="mobile-customer-item">
                      <KeyRound size={16} />
                      <span>Change Password</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mobile-logout-btn"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-action-links">
                  <Link to="/login" onClick={closeMobileMenu} className="mobile-action-btn">
                    <User size={16} strokeWidth={1.5} />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/register" onClick={closeMobileMenu} className="mobile-action-btn register-highlight">
                    <span>Create Account</span>
                  </Link>
                </div>
              )}

              <p className="mobile-security-note">
                Curated Multi-Vendor Marketplace
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

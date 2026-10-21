import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Package,
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mail,
  AtSign,
  Edit3,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getCurrentUserProfile } from '../../api/userApi'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import './CustomerDashboard.css'

export default function CustomerDashboard() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getCurrentUserProfile()
        if (isMounted) {
          const savedUser = localStorage.getItem('user')
          const localParsed = savedUser ? JSON.parse(savedUser) : null
          setProfile({
            ...data,
            firstName: localParsed?.firstName || data.firstName,
            lastName: localParsed?.lastName || data.lastName,
          })
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Unable to fetch customer profile. Please check your connection.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const activeUser = profile || authUser
  const firstName = activeUser?.firstName || activeUser?.name || 'Customer'
  const lastName = activeUser?.lastName || ''
  const fullName = activeUser?.firstName
    ? `${activeUser.firstName} ${lastName}`.trim()
    : activeUser?.name || 'Customer'
  const username = activeUser?.username || '—'
  const email = activeUser?.email || '—'

  return (
    <div className="customer-dashboard-root">
      {/* Header Banner */}
      <div className="customer-welcome-hero">
        <div className="welcome-text-col">
          <h1 className="welcome-heading">Hello, {firstName} 👋</h1>
          <p className="welcome-subheading">
            Manage your account, addresses and shopping activity from one place.
          </p>
        </div>

        <div className="welcome-actions-col">
          <Link to="/products">
            <Button variant="primary" size="md" icon={Compass} iconPosition="left">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="dashboard-alert dashboard-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading-box">
          <Loading text="Loading account details..." fullScreen={false} />
        </div>
      ) : (
        <>
          {/* Quick-Access Cards Grid */}
          <section className="dashboard-overview-section">
            <h2 className="section-title">Quick Access</h2>
            <div className="quick-cards-grid">
              {/* Profile Card */}
              <Link to="/customer/profile" className="overview-card">
                <div className="overview-icon-wrap">
                  <User size={22} />
                </div>
                <div className="overview-card-body">
                  <h3 className="overview-card-title">Profile</h3>
                  <p className="overview-card-desc">Manage your personal details</p>
                </div>
                <ArrowRight size={18} className="overview-arrow" />
              </Link>

              {/* Addresses Card */}
              <Link to="/customer/addresses" className="overview-card">
                <div className="overview-icon-wrap">
                  <MapPin size={22} />
                </div>
                <div className="overview-card-body">
                  <h3 className="overview-card-title">Addresses</h3>
                  <p className="overview-card-desc">Manage your saved delivery addresses</p>
                </div>
                <ArrowRight size={18} className="overview-arrow" />
              </Link>

              {/* Cart Card */}
              <Link to="/customer/cart" className="overview-card">
                <div className="overview-icon-wrap">
                  <ShoppingBag size={22} />
                </div>
                <div className="overview-card-body">
                  <h3 className="overview-card-title">Cart</h3>
                  <p className="overview-card-desc">Review items you've selected</p>
                </div>
                <ArrowRight size={18} className="overview-arrow" />
              </Link>

              {/* Wishlist Card */}
              <Link to="/customer/wishlist" className="overview-card">
                <div className="overview-icon-wrap">
                  <Heart size={22} />
                </div>
                <div className="overview-card-body">
                  <h3 className="overview-card-title">Wishlist</h3>
                  <p className="overview-card-desc">Keep track of products you love</p>
                </div>
                <ArrowRight size={18} className="overview-arrow" />
              </Link>

              {/* Orders Card */}
              <Link to="/customer/orders" className="overview-card">
                <div className="overview-icon-wrap">
                  <Package size={22} />
                </div>
                <div className="overview-card-body">
                  <h3 className="overview-card-title">Orders</h3>
                  <p className="overview-card-desc">View your purchases and order history</p>
                </div>
                <ArrowRight size={18} className="overview-arrow" />
              </Link>

              {/* Browse Products Card */}
              <Link to="/products" className="overview-card highlight-card">
                <div className="overview-icon-wrap">
                  <Compass size={22} />
                </div>
                <div className="overview-card-body">
                  <h3 className="overview-card-title">Browse Products</h3>
                  <p className="overview-card-desc">Continue exploring the collection</p>
                </div>
                <ArrowRight size={18} className="overview-arrow" />
              </Link>
            </div>
          </section>

          {/* Account Information Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Account Information</h2>
                <p className="section-desc">
                  Manage your personal information and account preferences.
                </p>
              </div>
              <Link to="/customer/profile">
                <Button variant="secondary" size="sm" icon={Edit3} iconPosition="left">
                  Edit Profile
                </Button>
              </Link>
            </div>

            <div className="profile-details-grid">
              <div className="profile-field-card">
                <div className="field-icon-wrap">
                  <User size={18} />
                </div>
                <div className="field-content">
                  <span className="field-label">Name</span>
                  <span className="field-value">{fullName}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap">
                  <AtSign size={18} />
                </div>
                <div className="field-content">
                  <span className="field-label">Username</span>
                  <span className="field-value">{username}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap">
                  <Mail size={18} />
                </div>
                <div className="field-content">
                  <span className="field-label">Email</span>
                  <span className="field-value">{email}</span>
                </div>
              </div>

              <div className="profile-field-card">
                <div className="field-icon-wrap">
                  <ShieldCheck size={18} />
                </div>
                <div className="field-content">
                  <span className="field-label">Account Type</span>
                  <span className="field-value role-highlight">Customer</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Recent Activity</h2>
                <p className="section-desc">Orders and purchases placed on your account.</p>
              </div>
            </div>

            <div className="empty-notice-box" style={{ padding: '2.75rem 2rem' }}>
              <Package size={32} className="notice-icon" />
              <h3 className="notice-title">No Orders Yet</h3>
              <p className="notice-desc">
                When you place an order, you'll be able to track it here.
              </p>
              <Link to="/products">
                <Button variant="secondary" size="sm">
                  Start Exploring Products
                </Button>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

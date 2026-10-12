import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  User,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
} from 'lucide-react'
import {
  getVendorById,
  approveVendor,
  rejectVendor,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import './AdminVendorsPage.css'

export default function AdminVendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    action: null,
    loading: false,
  })

  useEffect(() => {
    let ignore = false
    getVendorById(id)
      .then((data) => {
        if (!ignore) {
          setVendor(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || 'Vendor not found.')
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [id])

  const handleOpenModal = (action) => {
    setModalConfig({
      isOpen: true,
      action,
      loading: false,
    })
  }

  const handleCloseModal = () => {
    setModalConfig({
      isOpen: false,
      action: null,
      loading: false,
    })
  }

  const handleConfirmAction = async () => {
    const { action } = modalConfig
    if (!action || !vendor) return

    setModalConfig((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'approve') {
        const updated = await approveVendor(vendor.vendorId)
        setVendor(updated)
        setToast({
          type: 'success',
          message: 'Vendor approved successfully.',
        })
      } else {
        const updated = await rejectVendor(vendor.vendorId)
        setVendor(updated)
        setToast({
          type: 'info',
          message: 'Vendor application rejected.',
        })
      }
      handleCloseModal()
    } catch {
      setModalConfig((prev) => ({ ...prev, loading: false }))
      setToast({
        type: 'error',
        message: action === 'approve'
          ? 'Vendor could not be approved.'
          : 'Vendor application could not be rejected.',
      })
    }
  }

  // Format status to Title Case
  const formatStatus = (rawStatus) => {
    if (!rawStatus) return 'Pending'
    const lower = rawStatus.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading vendor details..." fullScreen={false} />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="admin-vendors-root">
        <div className="admin-empty-table" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={36} className="empty-table-icon" style={{ color: '#df5848' }} />
          <p className="empty-table-title">Vendor Not Found</p>
          <span className="empty-table-subtitle">{error || 'The requested vendor profile does not exist.'}</span>
          <button
            type="button"
            className="btn-action-view"
            style={{ marginTop: '1.25rem' }}
            onClick={() => navigate('/admin/vendors')}
          >
            Back to Vendors
          </button>
        </div>
      </div>
    )
  }

  const statusFriendly = formatStatus(vendor.status)
  const statusClass = (vendor.status || 'pending').toLowerCase()

  return (
    <div className="admin-vendors-root">
      {/* Back Link & Header */}
      <div className="admin-page-header">
        <div>
          <Link
            to="/admin/vendors"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              marginBottom: '0.5rem',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Vendors</span>
          </Link>
          <h1 className="admin-page-title">{vendor.businessName}</h1>
          <p className="admin-page-desc">
            Vendor Profile &bull; @{vendor.username}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`status-badge badge-${statusClass}`} style={{ fontSize: '0.8125rem', padding: '0.35rem 0.85rem' }}>
            {statusFriendly}
          </span>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast-banner toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button type="button" className="toast-close-btn" onClick={() => setToast(null)}>
            &times;
          </button>
        </div>
      )}

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Business Information Card */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3 className="panel-card-title">Business Information</h3>
          </div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Business Name
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} color="var(--accent-gold)" />
                {vendor.businessName}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Business Email
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} color="var(--text-muted)" />
                {vendor.businessEmail || 'Not provided'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Business Phone
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={15} color="var(--text-muted)" />
                {vendor.businessPhone || 'Not provided'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Business Address
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{vendor.businessAddress || 'Not provided'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Associated Account Credentials */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3 className="panel-card-title">Vendor Account</h3>
          </div>
          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Owner Username
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} color="var(--text-muted)" />
                @{vendor.username}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Contact Email
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {vendor.email}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Application Status
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {vendor.status === 'PENDING'
                  ? 'Awaiting review and authorization.'
                  : vendor.status === 'APPROVED'
                  ? 'Active vendor in good standing.'
                  : 'Application was declined.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Actions Bar */}
      <div className="admin-panel-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Vendor Status
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {vendor.status === 'PENDING'
              ? 'This vendor registration is awaiting administrative authorization.'
              : vendor.status === 'APPROVED'
              ? 'This vendor is authorized to list products on the marketplace.'
              : 'This vendor application was rejected.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {vendor.status === 'PENDING' ? (
            <>
              <button
                type="button"
                className="btn-action-approve"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                onClick={() => handleOpenModal('approve')}
              >
                <CheckCircle2 size={17} />
                <span>Approve Vendor</span>
              </button>

              <button
                type="button"
                className="btn-action-reject"
                style={{ padding: '0.65rem 1.15rem', fontSize: '0.875rem' }}
                onClick={() => handleOpenModal('reject')}
              >
                <XCircle size={17} />
                <span>Reject Vendor</span>
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Status: {statusFriendly}
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={
          modalConfig.action === 'approve'
            ? 'Approve Vendor?'
            : 'Reject Vendor?'
        }
        message={
          modalConfig.action === 'approve' ? (
            <span>
              Are you sure you want to approve <strong>{vendor.businessName}</strong>?
            </span>
          ) : (
            <span>
              Are you sure you want to reject <strong>{vendor.businessName}</strong>?
            </span>
          )
        }
        confirmText={modalConfig.action === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
        confirmVariant={modalConfig.action === 'approve' ? 'success' : 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={handleCloseModal}
        loading={modalConfig.loading}
      />
    </div>
  )
}

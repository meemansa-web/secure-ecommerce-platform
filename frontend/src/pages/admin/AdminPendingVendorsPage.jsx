import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Store,
} from 'lucide-react'
import {
  getPendingVendors,
  approveVendor,
  rejectVendor,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import './AdminVendorsPage.css'

export default function AdminPendingVendorsPage() {
  const [pendingVendors, setPendingVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    vendor: null,
    action: null,
    loading: false,
  })

  const loadData = useCallback(async () => {
    try {
      const data = await getPendingVendors()
      setPendingVendors(Array.isArray(data) ? data : [])
    } catch {
      setToast({ type: 'error', message: 'Unable to load pending vendor applications.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleManualRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleOpenModal = (vendor, action) => {
    setModalConfig({
      isOpen: true,
      vendor,
      action,
      loading: false,
    })
  }

  const handleCloseModal = () => {
    setModalConfig({
      isOpen: false,
      vendor: null,
      action: null,
      loading: false,
    })
  }

  const handleConfirmAction = async () => {
    const { vendor, action } = modalConfig
    if (!vendor || !action) return

    setModalConfig((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'approve') {
        await approveVendor(vendor.vendorId)
        setPendingVendors((prev) => prev.filter((v) => v.vendorId !== vendor.vendorId))
        setToast({
          type: 'success',
          message: 'Vendor approved successfully.',
        })
      } else {
        await rejectVendor(vendor.vendorId)
        setPendingVendors((prev) => prev.filter((v) => v.vendorId !== vendor.vendorId))
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

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading pending vendor applications..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="admin-vendors-root">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Link to="/admin/vendors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <ArrowLeft size={14} />
              <span>Back to Vendors</span>
            </Link>
          </div>
          <h1 className="admin-page-title">Pending Vendors</h1>
          <p className="admin-page-desc">
            Review and make verification decisions on merchant applications.
          </p>
        </div>

        <button
          type="button"
          className={`admin-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleManualRefresh}
          disabled={refreshing}
          title="Refresh queue"
        >
          <RefreshCw size={15} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast-banner toast-${toast.type}`} role="status">
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => setToast(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Applications List */}
      {pendingVendors.length === 0 ? (
        <div className="admin-empty-table" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Store size={40} className="empty-state-icon" style={{ color: 'var(--text-muted)' }} />
          <p className="empty-table-title">No pending vendor applications.</p>
          <span className="empty-table-subtitle">
            New vendor applications will appear here for review.
          </span>
          <Link to="/admin/vendors" className="pending-queue-pill-btn" style={{ marginTop: '1.25rem' }}>
            <span>View All Vendors</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingVendors.map((vendor) => (
            <div
              key={vendor.vendorId}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Building2 size={20} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {vendor.businessName}
                  </h3>
                  <span className="status-badge badge-pending">Pending</span>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  <span>@{vendor.username}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="var(--text-muted)" />
                    {vendor.businessEmail || vendor.email}
                  </span>
                  {vendor.businessPhone && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={14} color="var(--text-muted)" />
                      {vendor.businessPhone}
                    </span>
                  )}
                  {vendor.businessAddress && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} color="var(--text-muted)" />
                      {vendor.businessAddress}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to={`/admin/vendors/${vendor.vendorId}`}
                  className="btn-action-view"
                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.8125rem' }}
                >
                  <Eye size={15} />
                  <span>View Details</span>
                </Link>

                <button
                  type="button"
                  className="btn-action-approve"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.8125rem' }}
                  onClick={() => handleOpenModal(vendor, 'approve')}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve Vendor</span>
                </button>

                <button
                  type="button"
                  className="btn-action-reject"
                  style={{ padding: '0.55rem 0.95rem', fontSize: '0.8125rem' }}
                  onClick={() => handleOpenModal(vendor, 'reject')}
                >
                  <XCircle size={16} />
                  <span>Reject Vendor</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
              Are you sure you want to approve <strong>{modalConfig.vendor?.businessName}</strong>?
            </span>
          ) : (
            <span>
              Are you sure you want to reject <strong>{modalConfig.vendor?.businessName}</strong>?
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

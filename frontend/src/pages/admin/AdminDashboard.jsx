import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Store,
  ChevronRight,
  Mail,
  Phone,
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Send,
  ShieldAlert,
  X,
} from 'lucide-react'
import {
  getAllCustomers,
  getAllVendors,
  getPendingVendors,
  getAllAdminCategories,
  approveVendor,
  rejectVendor,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [metrics, setMetrics] = useState({
    customers: [],
    vendors: [],
    pendingVendors: [],
    categories: [],
  })

  // Return & Exchange Requests from Customers
  const RETURNS_STORAGE_KEY = 'ecommerce_returns_requests'
  const [returnRequests, setReturnRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(RETURNS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [lightboxDefectImg, setLightboxDefectImg] = useState(null)

  const handleApproveReturn = (reqId) => {
    const updated = returnRequests.map((r) =>
      r.id === reqId
        ? {
            ...r,
            status: 'ROUTED_TO_VENDOR',
            routedAt: new Date().toISOString(),
            adminDecision: 'APPROVED',
          }
        : r
    )
    setReturnRequests(updated)
    try {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}
    setToast({
      type: 'success',
      message: `Return request ${reqId} approved and defect documentation routed to vendor for fulfillment.`,
    })
    setTimeout(() => setToast(null), 4000)
  }

  const handleRejectReturn = (reqId) => {
    const reason = prompt('Please enter reason for rejection (optional):', 'Defect not visible or exceeds return window')
    const updated = returnRequests.map((r) =>
      r.id === reqId
        ? {
            ...r,
            status: 'REJECTED',
            adminNotes: reason || 'Defect verification failed',
            adminDecision: 'REJECTED',
          }
        : r
    )
    setReturnRequests(updated)
    try {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}
    setToast({
      type: 'error',
      message: `Return request ${reqId} marked as rejected.`,
    })
    setTimeout(() => setToast(null), 4000)
  }

  const handleResolveReturn = (reqId) => {
    const updated = returnRequests.map((r) =>
      r.id === reqId ? { ...r, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : r
    )
    setReturnRequests(updated)
    try {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {}
    setToast({
      type: 'success',
      message: `Return request ${reqId} marked as settled and resolved.`,
    })
    setTimeout(() => setToast(null), 4000)
  }

  // Confirmation Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    vendor: null,
    action: null, // 'approve' | 'reject'
    loading: false,
  })

  const loadData = useCallback(async () => {
    try {
      const [
        customersRes,
        vendorsRes,
        pendingVendorsRes,
        categoriesRes,
      ] = await Promise.allSettled([
        getAllCustomers(),
        getAllVendors(),
        getPendingVendors(),
        getAllAdminCategories(),
      ])

      setMetrics({
        customers: customersRes.status === 'fulfilled' && Array.isArray(customersRes.value) ? customersRes.value : [],
        vendors: vendorsRes.status === 'fulfilled' && Array.isArray(vendorsRes.value) ? vendorsRes.value : [],
        pendingVendors: pendingVendorsRes.status === 'fulfilled' && Array.isArray(pendingVendorsRes.value) ? pendingVendorsRes.value : [],
        categories: categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value) ? categoriesRes.value : [],
      })
    } catch {
      setError('Unable to load dashboard information. Please try refreshing.')
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

  // Open Confirmation Modal
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

  // Handle Approve / Reject Confirmation
  const handleConfirmAction = async () => {
    const { vendor, action } = modalConfig
    if (!vendor || !action) return

    setModalConfig((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'approve') {
        await approveVendor(vendor.vendorId)
        setToast({
          type: 'success',
          message: 'Vendor approved successfully.',
        })
      } else {
        await rejectVendor(vendor.vendorId)
        setToast({
          type: 'info',
          message: 'Vendor application rejected.',
        })
      }
      handleCloseModal()
      loadData()
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
        <Loading text="Loading dashboard..." fullScreen={false} />
      </div>
    )
  }

  // Derived real numbers
  const totalCustomers = metrics.customers.length
  const totalVendors = metrics.vendors.length
  const pendingCount = metrics.pendingVendors.length
  const totalCategories = metrics.categories.length
  const pendingReturnsCount = returnRequests.filter((r) => r.status === 'PENDING_ADMIN_REVIEW').length

  const previewCategories = metrics.categories.slice(0, 4)

  return (
    <div className="admin-dashboard-root">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-desc">
            Manage your marketplace from one place.
          </p>
        </div>

        <button
          type="button"
          className={`admin-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleManualRefresh}
          disabled={refreshing}
          title="Refresh dashboard data"
        >
          <RefreshCw size={15} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Toast Banner */}
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

      {error && (
        <div className="admin-alert-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Clean Summary Cards (Derived Only from Real Data) */}
      <div className="admin-kpi-grid">
        {/* Customers Card */}
        <div className="admin-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Customers</span>
            <div className="kpi-icon-pill icon-customers">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalCustomers}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Registered customer accounts</span>
            <Link to="/admin/customers" className="kpi-link">
              View Customers &rarr;
            </Link>
          </div>
        </div>

        {/* Vendors Card */}
        <div className="admin-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Vendors</span>
            <div className="kpi-icon-pill icon-vendors">
              <Building2 size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalVendors}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Registered vendor accounts</span>
            <Link to="/admin/vendors" className="kpi-link">
              View Vendors &rarr;
            </Link>
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className={`admin-kpi-card ${pendingCount > 0 ? 'kpi-card-highlight' : ''}`}>
          <div className="kpi-card-header">
            <span className="kpi-title">Pending Approvals</span>
            <div className="kpi-icon-pill icon-pending">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value">{pendingCount}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Applications awaiting review</span>
            <Link to="/admin/vendors/pending" className="kpi-link">
              Review Applications &rarr;
            </Link>
          </div>
        </div>

        {/* Returns & Defect Claims Card */}
        <div className={`admin-kpi-card ${pendingReturnsCount > 0 ? 'kpi-card-highlight' : ''}`}>
          <div className="kpi-card-header">
            <span className="kpi-title">Returns / Claims</span>
            <div className="kpi-icon-pill" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <RotateCcw size={18} />
            </div>
          </div>
          <div className="kpi-value">{pendingReturnsCount}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Defect requests to inspect</span>
            <a href="#admin-returns-section" className="kpi-link">
              Inspect Claims &rarr;
            </a>
          </div>
        </div>

        {/* Categories Card */}
        <div className="admin-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Categories</span>
            <div className="kpi-icon-pill icon-categories">
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-value">{totalCategories}</div>
          <div className="kpi-footer">
            <span className="kpi-subtext">Active merchandise categories</span>
            <Link to="/admin/categories" className="kpi-link">
              View Categories &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Section: Pending Vendor Applications & Category Overview */}
      <div className="admin-dashboard-two-col">
        {/* Pending Vendor Applications Preview */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">Pending Vendor Applications</h3>
              <p className="panel-card-subtitle">
                Review and make verification decisions on merchant applications
              </p>
            </div>
            {pendingCount > 0 && (
              <Link to="/admin/vendors/pending" className="panel-header-link">
                <span>View All ({pendingCount})</span>
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          <div className="panel-card-body">
            {metrics.pendingVendors.length === 0 ? (
              <div className="panel-empty-state">
                <Store size={36} className="empty-state-icon" />
                <p className="empty-state-title">No pending vendor applications.</p>
                <span className="empty-state-text">
                  New vendor applications will appear here for review.
                </span>
              </div>
            ) : (
              <div className="pending-vendors-list">
                {metrics.pendingVendors.slice(0, 5).map((vendor) => (
                  <div key={vendor.vendorId} className="pending-vendor-item">
                    <div className="vendor-item-info">
                      <span className="vendor-item-name">{vendor.businessName}</span>
                      <div className="vendor-item-contact">
                        <span>@{vendor.username}</span>
                        {vendor.businessEmail && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            &bull; <Mail size={12} /> {vendor.businessEmail}
                          </span>
                        )}
                        {vendor.businessPhone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                            &bull; <Phone size={12} /> {vendor.businessPhone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="vendor-item-actions">
                      <Link
                        to={`/admin/vendors/${vendor.vendorId}`}
                        className="btn-action-view"
                        title="Review Application Details"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </Link>

                      <button
                        type="button"
                        className="btn-action-approve"
                        onClick={() => handleOpenModal(vendor, 'approve')}
                        title="Approve Vendor"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        className="btn-action-reject"
                        onClick={() => handleOpenModal(vendor, 'reject')}
                        title="Reject Vendor"
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Marketplace Categories Overview */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">Category Taxonomy</h3>
              <p className="panel-card-subtitle">
                Merchandise groupings and customer visibility
              </p>
            </div>
            <Link to="/admin/categories" className="panel-header-link">
              <span>Manage Categories</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="panel-card-body">
            {previewCategories.length === 0 ? (
              <div className="panel-empty-state">
                <Layers size={36} className="empty-state-icon" />
                <p className="empty-state-title">No categories available.</p>
                <span className="empty-state-text">
                  Categories will appear here once added to organize marketplace items.
                </span>
              </div>
            ) : (
              <div className="category-overview-grid">
                {previewCategories.map((cat) => (
                  <div key={cat.id} className="category-overview-card">
                    <div className="category-overview-head">
                      <span className="cat-overview-name">{cat.name}</span>
                      <span className={cat.active ? 'status-pill-active' : 'status-pill-inactive'}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="cat-overview-desc">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Returns & Exchanges Section (Inspection & Vendor Routing) */}
      <div id="admin-returns-section" className="admin-panel-card" style={{ marginTop: '0.5rem' }}>
        <div className="panel-card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <RotateCcw size={18} color="var(--accent-olive, #bfa15f)" />
              <h3 className="panel-card-title">Customer Return & Exchange Claims</h3>
            </div>
            <p className="panel-card-subtitle">
              Inspect damaged or defective product photo submissions, verify claims, and route approved replacements to vendors.
            </p>
          </div>
          <span className="panel-header-badge" style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'var(--color-accent-subtle, rgba(212, 175, 55, 0.1))', color: 'var(--color-accent, #d4af37)', fontWeight: 600 }}>
            {returnRequests.length} Total Claims ({pendingReturnsCount} Pending Inspection)
          </span>
        </div>

        <div className="panel-card-body">
          {returnRequests.length === 0 ? (
            <div className="panel-empty-state">
              <CheckCircle2 size={36} className="empty-state-icon" style={{ color: '#22c55e' }} />
              <p className="empty-state-title">No return or exchange claims pending.</p>
              <span className="empty-state-text">
                When customers report damaged or defective items with photo proof, requests appear here for Admin review and vendor routing.
              </span>
            </div>
          ) : (
            <div className="admin-returns-table-wrapper">
              <table className="admin-returns-table">
                <thead>
                  <tr>
                    <th>Claim ID / Date</th>
                    <th>Customer & Order</th>
                    <th>Product Item</th>
                    <th>Claim Type & Reason</th>
                    <th style={{ textAlign: 'center' }}>Defect Photo</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returnRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace' }}>#{req.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{req.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{req.customerEmail}</div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>
                          Order #{req.orderNumber}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{req.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>SKU #{req.productId}</div>
                      </td>

                      <td>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: req.requestType === 'Exchange' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(168, 85, 247, 0.12)',
                          color: req.requestType === 'Exchange' ? '#3b82f6' : '#a855f7',
                          marginBottom: '0.25rem',
                        }}>
                          {req.requestType.toUpperCase()}
                        </span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{req.reason}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '240px', marginTop: '0.2rem' }}>
                          "{req.description}"
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {req.defectPhoto ? (
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                            <img
                              src={req.defectPhoto}
                              alt="Defective item proof"
                              className="admin-defect-thumb"
                              onClick={() => setLightboxDefectImg(req.defectPhoto)}
                              title="Click to view full photo evidence"
                            />
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => setLightboxDefectImg(req.defectPhoto)}>
                              View Photo
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No photo</span>
                        )}
                      </td>

                      <td>
                        <span className={`return-status-pill status-${req.status.toLowerCase()}`}>
                          {req.status === 'PENDING_ADMIN_REVIEW' && '⏳ Pending Review'}
                          {req.status === 'ROUTED_TO_VENDOR' && '✓ Routed to Vendor'}
                          {req.status === 'RESOLVED' && '✓ Settled'}
                          {req.status === 'REJECTED' && '✕ Declined'}
                        </span>
                        {req.adminNotes && (
                          <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.25rem' }}>
                            Note: {req.adminNotes}
                          </div>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {req.status === 'PENDING_ADMIN_REVIEW' && (
                            <>
                              <button
                                type="button"
                                className="btn-approve-route"
                                onClick={() => handleApproveReturn(req.id)}
                                title="Verify defect photo and route to vendor"
                              >
                                <Send size={12} />
                                <span>Approve & Route to Vendor</span>
                              </button>

                              <button
                                type="button"
                                className="btn-reject-return"
                                onClick={() => handleRejectReturn(req.id)}
                                title="Reject claim"
                              >
                                <XCircle size={12} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {req.status === 'ROUTED_TO_VENDOR' && (
                            <button
                              type="button"
                              className="btn-resolve-return"
                              onClick={() => handleResolveReturn(req.id)}
                              title="Mark claim as fully resolved"
                            >
                              <CheckCircle2 size={12} />
                              <span>Mark Resolved</span>
                            </button>
                          )}

                          {(req.status === 'RESOLVED' || req.status === 'REJECTED') && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Archived
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for Defect Evidence Photo */}
      {lightboxDefectImg && (
        <div className="admin-photo-lightbox" onClick={() => setLightboxDefectImg(null)}>
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setLightboxDefectImg(null)}
            >
              <X size={22} />
            </button>
            <div className="lightbox-header">
              <ShieldAlert size={18} color="#ef4444" />
              <span>Customer Uploaded Defect Evidence</span>
            </div>
            <img src={lightboxDefectImg} alt="Enlarged defect proof" className="lightbox-full-img" />
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Approve / Reject */}
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

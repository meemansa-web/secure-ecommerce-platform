import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Eye,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  getAllVendors,
  approveVendor,
  rejectVendor,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import './AdminVendorsPage.css'

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | APPROVED | PENDING | REJECTED

  // Toast / feedback message
  const [toast, setToast] = useState(null)

  // Confirmation Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    vendor: null,
    action: null, // 'approve' | 'reject'
    loading: false,
  })

  const loadVendors = useCallback(async () => {
    try {
      const data = await getAllVendors()
      setVendors(Array.isArray(data) ? data : [])
    } catch {
      setToast({ type: 'error', message: 'Unable to load vendors list. Please try again.' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadVendors()
  }, [loadVendors])

  const handleManualRefresh = () => {
    setRefreshing(true)
    loadVendors()
  }

  // Open confirmation modal for approval or rejection
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

  // Confirm Approve or Reject
  const handleConfirmAction = async () => {
    const { vendor, action } = modalConfig
    if (!vendor || !action) return

    setModalConfig((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'approve') {
        const updated = await approveVendor(vendor.vendorId)
        setVendors((prev) =>
          prev.map((v) => (v.vendorId === vendor.vendorId ? updated : v))
        )
        setToast({
          type: 'success',
          message: 'Vendor approved successfully.',
        })
      } else {
        const updated = await rejectVendor(vendor.vendorId)
        setVendors((prev) =>
          prev.map((v) => (v.vendorId === vendor.vendorId ? updated : v))
        )
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

  // Format status to friendly Title Case
  const formatStatus = (rawStatus) => {
    if (!rawStatus) return 'Pending'
    const lower = rawStatus.toLowerCase()
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }

  // Filter vendors based on status and search query
  const filteredVendors = vendors.filter((v) => {
    const matchesStatus =
      statusFilter === 'ALL' || (v.status || '').toUpperCase() === statusFilter

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (v.businessName || '').toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.businessEmail || '').toLowerCase().includes(q) ||
      (v.username || '').toLowerCase().includes(q) ||
      (v.businessPhone || '').toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  const pendingCount = vendors.filter((v) => v.status === 'PENDING').length

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading vendors..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="admin-vendors-root">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Vendors</h1>
          <p className="admin-page-desc">
            Manage marketplace sellers, review commercial registrations, and process vendor applications.
          </p>
        </div>

        <div className="header-actions-group">
          {pendingCount > 0 && (
            <Link to="/admin/vendors/pending" className="pending-queue-pill-btn">
              <Clock size={15} />
              <span>{pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}</span>
              <ArrowRight size={14} />
            </Link>
          )}

          <button
            type="button"
            className={`admin-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh vendor list"
          >
            <RefreshCw size={15} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`admin-toast-banner toast-${toast.type}`}
          role="status"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : toast.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Clock size={18} />
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

      {/* Search & Filter Toolbar */}
      <div className="admin-toolbar-card">
        {/* Status Filter Tabs */}
        <div className="status-tabs-list">
          <button
            type="button"
            className={`status-tab ${statusFilter === 'ALL' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Vendors ({vendors.length})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'APPROVED' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved ({vendors.filter((v) => v.status === 'APPROVED').length})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'PENDING' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'REJECTED' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected ({vendors.filter((v) => v.status === 'REJECTED').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by business name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="admin-table-container">
        {filteredVendors.length === 0 ? (
          <div className="admin-empty-table">
            <Building2 size={36} className="empty-table-icon" />
            <p className="empty-table-title">No vendors found.</p>
            <span className="empty-table-subtitle">
              {searchQuery
                ? `No vendor matches "${searchQuery}".`
                : 'No vendors registered under this status category.'}
            </span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Vendor</th>
                <th>Email</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => {
                const statusFriendly = formatStatus(vendor.status)
                const statusClass = (vendor.status || 'pending').toLowerCase()

                return (
                  <tr key={vendor.vendorId}>
                    <td className="td-business">
                      <span className="business-name">{vendor.businessName}</span>
                    </td>

                    <td>
                      <span className="user-primary">@{vendor.username}</span>
                    </td>

                    <td className="td-secondary">
                      {vendor.businessEmail || vendor.email || '—'}
                    </td>

                    <td>
                      <span className={`status-badge badge-${statusClass}`}>
                        {statusFriendly}
                      </span>
                    </td>

                    <td className="td-actions">
                      <div className="actions-cluster">
                        <Link
                          to={`/admin/vendors/${vendor.vendorId}`}
                          className="btn-action-view"
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                        </Link>

                        {vendor.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              className="btn-action-approve"
                              onClick={() => handleOpenModal(vendor, 'approve')}
                              title="Approve Vendor"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              className="btn-action-reject"
                              onClick={() => handleOpenModal(vendor, 'reject')}
                              title="Reject Vendor"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
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

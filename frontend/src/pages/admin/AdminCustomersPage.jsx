import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Search,
  CheckCircle2,
  Eye,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import {
  getAllCustomers,
  disableCustomer,
  enableCustomer,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import './AdminCustomersPage.css'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | ACTIVE | DISABLED
  const [toast, setToast] = useState(null)

  // Confirmation Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    customer: null,
    action: null, // 'enable' | 'disable'
    loading: false,
  })

  const loadData = useCallback(async () => {
    try {
      const data = await getAllCustomers()
      setCustomers(Array.isArray(data) ? data : [])
    } catch {
      setToast({ type: 'error', message: 'Unable to load customers. Please try again.' })
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

  const handleOpenModal = (customer, action) => {
    setModalConfig({
      isOpen: true,
      customer,
      action,
      loading: false,
    })
  }

  const handleCloseModal = () => {
    setModalConfig({
      isOpen: false,
      customer: null,
      action: null,
      loading: false,
    })
  }

  const handleConfirmAction = async () => {
    const { customer, action } = modalConfig
    if (!customer || !action) return

    setModalConfig((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'disable') {
        const updated = await disableCustomer(customer.id)
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? updated : c))
        )
        setToast({
          type: 'info',
          message: 'Customer account disabled.',
        })
      } else {
        const updated = await enableCustomer(customer.id)
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? updated : c))
        )
        setToast({
          type: 'success',
          message: 'Customer account enabled.',
        })
      }
      handleCloseModal()
    } catch {
      setModalConfig((prev) => ({ ...prev, loading: false }))
      setToast({
        type: 'error',
        message: action === 'disable'
          ? 'Customer account could not be disabled.'
          : 'Customer account could not be enabled.',
      })
    }
  }

  // Filter customers by status and search query
  const filteredCustomers = customers.filter((c) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.enabled) ||
      (statusFilter === 'DISABLED' && !c.enabled)

    const q = searchQuery.toLowerCase().trim()
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      (c.username || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)

    return matchesStatus && matchesSearch
  })

  const activeCount = customers.filter((c) => c.enabled).length
  const disabledCount = customers.length - activeCount

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading customers..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="admin-customers-root">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-desc">
            Manage customer accounts, monitor active users, and control access permissions.
          </p>
        </div>

        <button
          type="button"
          className={`admin-refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={handleManualRefresh}
          disabled={refreshing}
          title="Refresh customers"
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

      {/* Toolbar */}
      <div className="admin-toolbar-card">
        {/* Status Filter Tabs */}
        <div className="status-tabs-list">
          <button
            type="button"
            className={`status-tab ${statusFilter === 'ALL' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Accounts ({customers.length})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'ACTIVE' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`status-tab ${statusFilter === 'DISABLED' ? 'tab-active' : ''}`}
            onClick={() => setStatusFilter('DISABLED')}
          >
            Disabled ({disabledCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, username, or email..."
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

      {/* Customer Management Table */}
      <div className="admin-table-container">
        {filteredCustomers.length === 0 ? (
          <div className="admin-empty-table">
            <Users size={36} className="empty-table-icon" />
            <p className="empty-table-title">No customers found.</p>
            <span className="empty-table-subtitle">
              {searchQuery
                ? `No customers matched "${searchQuery}".`
                : 'Registered customer accounts will appear here.'}
            </span>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => {
                const fullName = `${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'
                return (
                  <tr key={c.id}>
                    <td>
                      <span className="customer-full-name">{fullName}</span>
                    </td>

                    <td>
                      <span className="customer-username">@{c.username}</span>
                    </td>

                    <td>
                      <span className="customer-email-text">{c.email}</span>
                    </td>

                    <td>
                      <span className={c.enabled ? 'status-badge badge-approved' : 'status-badge badge-rejected'}>
                        {c.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="td-actions">
                      <div className="actions-cluster">
                        <Link
                          to={`/admin/customers/${c.id}`}
                          className="btn-action-view"
                          title="View Customer Details"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </Link>

                        {c.enabled ? (
                          <button
                            type="button"
                            className="btn-action-reject"
                            onClick={() => handleOpenModal(c, 'disable')}
                            title="Disable Customer"
                          >
                            <ShieldAlert size={14} />
                            <span>Disable</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-action-approve"
                            onClick={() => handleOpenModal(c, 'enable')}
                            title="Enable Customer"
                          >
                            <ShieldCheck size={14} />
                            <span>Enable</span>
                          </button>
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
          modalConfig.action === 'disable'
            ? 'Disable Customer Account?'
            : 'Enable Customer Account?'
        }
        message={
          modalConfig.action === 'disable' ? (
            <span>
              Are you sure you want to disable the account for{' '}
              <strong>{modalConfig.customer?.username}</strong>?
              They will be prevented from signing in until re-enabled.
            </span>
          ) : (
            <span>
              Are you sure you want to enable the account for{' '}
              <strong>{modalConfig.customer?.username}</strong>?
              This will restore their sign in access.
            </span>
          )
        }
        confirmText={modalConfig.action === 'disable' ? 'Disable Account' : 'Enable Account'}
        confirmVariant={modalConfig.action === 'disable' ? 'danger' : 'success'}
        onConfirm={handleConfirmAction}
        onCancel={handleCloseModal}
        loading={modalConfig.loading}
      />
    </div>
  )
}

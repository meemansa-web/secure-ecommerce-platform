import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  User,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import {
  getCustomerById,
  disableCustomer,
  enableCustomer,
} from '../../api/adminApi'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import Loading from '../../components/common/Loading'
import './AdminCustomersPage.css'

export default function AdminCustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [customer, setCustomer] = useState(null)
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
    getCustomerById(id)
      .then((data) => {
        if (!ignore) {
          setCustomer(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || 'Customer record not found.')
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
    if (!action || !customer) return

    setModalConfig((prev) => ({ ...prev, loading: true }))

    try {
      if (action === 'disable') {
        const updated = await disableCustomer(customer.id)
        setCustomer(updated)
        setToast({
          type: 'info',
          message: 'Customer account disabled.',
        })
      } else {
        const updated = await enableCustomer(customer.id)
        setCustomer(updated)
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

  if (loading) {
    return (
      <div className="admin-loading-wrapper">
        <Loading text="Loading customer details..." fullScreen={false} />
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="admin-customers-root">
        <div className="admin-empty-table" style={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={36} className="empty-table-icon" style={{ color: '#df5848' }} />
          <p className="empty-table-title">Customer Not Found</p>
          <span className="empty-table-subtitle">{error || 'The requested customer profile could not be located.'}</span>
          <button
            type="button"
            className="btn-action-view"
            style={{ marginTop: '1.25rem' }}
            onClick={() => navigate('/admin/customers')}
          >
            Back to Customers
          </button>
        </div>
      </div>
    )
  }

  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || '—'

  return (
    <div className="admin-customers-root">
      {/* Back Link & Header */}
      <div className="admin-page-header">
        <div>
          <Link
            to="/admin/customers"
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
            <span>Back to Customers</span>
          </Link>
          <h1 className="admin-page-title">{fullName}</h1>
          <p className="admin-page-desc">
            Customer Profile &bull; @{customer.username}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={customer.enabled ? 'status-badge badge-approved' : 'status-badge badge-rejected'} style={{ fontSize: '0.8125rem', padding: '0.35rem 0.85rem' }}>
            {customer.enabled ? 'Active' : 'Disabled'}
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

      {/* Profile Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Personal & Account Information */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3 className="panel-card-title">Customer Details</h3>
          </div>

          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Full Name
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {fullName}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Username
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} color="var(--text-muted)" />
                @{customer.username}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>
                Email Address
              </span>
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} color="var(--text-muted)" />
                {customer.email}
              </span>
            </div>
          </div>
        </div>

        {/* Account Access Controls */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <h3 className="panel-card-title">Account Status & Access</h3>
          </div>

          <div className="panel-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Account Access
              </span>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {customer.enabled
                  ? 'This customer account is active and able to sign in, shop, and manage their orders.'
                  : 'This account has been disabled. The user cannot log in until access is restored by an administrator.'}
              </p>
            </div>

            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              {customer.enabled ? (
                <button
                  type="button"
                  className="btn-action-reject"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                  onClick={() => handleOpenModal('disable')}
                >
                  <ShieldAlert size={16} />
                  <span>Disable Customer Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-action-approve"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
                  onClick={() => handleOpenModal('enable')}
                >
                  <ShieldCheck size={16} />
                  <span>Enable Customer Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
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
              Are you sure you want to disable the account for <strong>{customer.username}</strong>?
              They will be unable to log in until re-enabled.
            </span>
          ) : (
            <span>
              Restore sign in access for customer <strong>{customer.username}</strong>?
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

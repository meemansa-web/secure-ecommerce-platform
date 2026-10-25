import React, { useState } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react'

import { useAuth } from '../../context/useAuth'
import Button from '../../components/common/Button'
import './CustomerDashboard.css'

export default function CustomerAddressesPage() {
  const { user } = useAuth()

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || 'Customer'

  const storageKey = `modimal_addresses_${user?.email || 'customer'}`

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // fallback
    }
    const initial = [
      {
        id: 1,
        fullName: displayName,
        phone: '+91 98765 43210',
        addressLine: '42 Heritage Boulevard, Suite 500',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        isDefault: true,
        tag: 'Home',
      },
    ]
    try {
      localStorage.setItem(storageKey, JSON.stringify(initial))
    } catch {
      // storage unavailable
    }
    return initial
  })

  const [feedback, setFeedback] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    tag: 'Home',
    isDefault: false,
  })

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 3500)
  }

  const persistAddresses = (newAddresses) => {
    setAddresses(newAddresses)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newAddresses))
    } catch (e) {
      console.error('Failed to save addresses to storage', e)
    }
  }

  const openAddModal = () => {
    setEditingAddress(null)
    setFieldErrors({})
    setFormData({
      fullName: displayName,
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      tag: 'Home',
      isDefault: addresses.length === 0,
    })
    setModalOpen(true)
  }

  const openEditModal = (addr) => {
    setEditingAddress(addr)
    setFieldErrors({})
    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      tag: addr.tag || 'Home',
      isDefault: Boolean(addr.isDefault),
    })
    setModalOpen(true)
  }

  const handleDelete = (id) => {
    const updated = addresses.filter((a) => a.id !== id)
    // If the deleted address was default and other addresses remain, make the first one default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true
    }
    persistAddresses(updated)
    showToast('Delivery address removed.', 'info')
  }

  const handleSetDefault = (id) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    persistAddresses(updated)
    showToast('Default delivery address updated.')
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required.'
    if (!formData.phone.trim()) errs.phone = 'Contact number is required.'
    if (!formData.addressLine.trim()) errs.addressLine = 'Street address is required.'
    if (!formData.city.trim()) errs.city = 'City is required.'
    if (!formData.state.trim()) errs.state = 'State is required.'
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal code is required.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (editingAddress) {
      const updated = addresses.map((a) => {
        if (a.id === editingAddress.id) {
          return { ...a, ...formData }
        }
        if (formData.isDefault) {
          return { ...a, isDefault: false }
        }
        return a
      })
      persistAddresses(updated)
      showToast('Address updated successfully.')
    } else {
      const newAddr = {
        id: Date.now(),
        ...formData,
      }
      let updated
      if (formData.isDefault) {
        updated = addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      } else {
        updated = [...addresses, newAddr]
      }
      persistAddresses(updated)
      showToast('New delivery address added successfully.')
    }

    setModalOpen(false)
  }

  return (
    <div className="customer-dashboard-root">
      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h1 className="section-title">Saved Delivery Addresses</h1>
            <p className="section-desc">
              Manage your delivery locations and primary dispatch destinations.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            iconPosition="left"
            onClick={openAddModal}
          >
            Add New Address
          </Button>
        </div>

        {/* Action feedback notification */}
        {feedback && (
          <div
            className="dashboard-alert"
            style={{
              backgroundColor:
                feedback.type === 'info'
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'var(--success-bg, rgba(82, 168, 101, 0.15))',
              border: `1px solid ${
                feedback.type === 'info'
                  ? 'rgba(59, 130, 246, 0.25)'
                  : 'var(--success, #2e6037)'
              }`,
              color: 'var(--color-text-primary)',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={18} style={{ color: feedback.type === 'info' ? '#3b82f6' : 'var(--success, #2e6037)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{feedback.text}</span>
          </div>
        )}

        {/* Addresses Grid or Empty State */}
        {addresses.length === 0 ? (
          <div className="empty-notice-box" style={{ padding: '3.5rem 2rem' }}>
            <MapPin size={40} className="notice-icon" />
            <h2 className="notice-title" style={{ fontSize: '1.25rem' }}>No Addresses Saved</h2>
            <p className="notice-desc" style={{ maxWidth: '420px', marginBottom: '1.75rem' }}>
              Add a delivery address to make checkout quick and seamless.
            </p>
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              iconPosition="left"
              onClick={openAddModal}
            >
              Add First Address
            </Button>
          </div>
        ) : (
          <div className="profile-details-grid">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="profile-field-card"
                style={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  padding: '1.5rem',
                  position: 'relative',
                  border: addr.isDefault
                    ? '2px solid var(--text-primary)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {addr.tag}
                  </span>

                  {addr.isDefault && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--success, #2e6037)',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Default Address</span>
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {addr.fullName}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {addr.addressLine}
                    <br />
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Phone: {addr.phone}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '0.78125rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                        marginRight: 'auto',
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                  <div style={{ marginLeft: addr.isDefault ? 'auto' : 0, display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                      title="Edit Address"
                      aria-label="Edit Address"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--sale-badge, #ef4444)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                      }}
                      title="Delete Address"
                      aria-label="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-hover)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="e.g. Sarah Jenkins"
                  style={{
                    height: '40px',
                    padding: '0 0.85rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${fieldErrors.fullName ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                {fieldErrors.fullName && <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>{fieldErrors.fullName}</span>}
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    height: '40px',
                    padding: '0 0.85rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${fieldErrors.phone ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                {fieldErrors.phone && <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>{fieldErrors.phone}</span>}
              </div>

              {/* Street Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={(e) => setFormData((p) => ({ ...p, addressLine: e.target.value }))}
                  placeholder="Flat / House no., Building, Apartment, Street"
                  style={{
                    height: '40px',
                    padding: '0 0.85rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: `1px solid ${fieldErrors.addressLine ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
                {fieldErrors.addressLine && <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>{fieldErrors.addressLine}</span>}
              </div>

              {/* City & State Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    style={{
                      height: '40px',
                      padding: '0 0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: `1px solid ${fieldErrors.city ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.city && <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>{fieldErrors.city}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                    placeholder="State"
                    style={{
                      height: '40px',
                      padding: '0 0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: `1px solid ${fieldErrors.state ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.state && <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>{fieldErrors.state}</span>}
                </div>
              </div>

              {/* Postal Code & Tag */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                    Postal Code / PIN
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
                    placeholder="e.g. 560001"
                    style={{
                      height: '40px',
                      padding: '0 0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: `1px solid ${fieldErrors.postalCode ? 'var(--sale-badge)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  />
                  {fieldErrors.postalCode && <span style={{ fontSize: '0.75rem', color: 'var(--sale-badge)' }}>{fieldErrors.postalCode}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
                    Address Tag
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData((p) => ({ ...p, tag: e.target.value }))}
                    style={{
                      height: '40px',
                      padding: '0 0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Set Default Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="addrDefaultCheck"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData((p) => ({ ...p, isDefault: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--text-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="addrDefaultCheck" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Make this my default delivery address
                </label>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  {editingAddress ? 'Save Changes' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

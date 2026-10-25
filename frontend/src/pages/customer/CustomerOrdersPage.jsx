import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  ArrowRight,
  Truck,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  Printer,
  X,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Camera,
  AlertTriangle,
  Trash2,
  Send,
} from 'lucide-react'
import { getCustomerOrders } from '../../api/orderApi'
import { getProductImage } from '../../utils/productImages'
import { useAuth } from '../../context/useAuth'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import './CustomerOrdersPage.css'

export default function CustomerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)

  // Return & Exchange Requests State
  const RETURNS_STORAGE_KEY = 'ecommerce_returns_requests'
  const [returnRequests, setReturnRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(RETURNS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Return modal state
  const [returnModalItem, setReturnModalItem] = useState(null)
  const [returnOrder, setReturnOrder] = useState(null)
  const [returnType, setReturnType] = useState('Exchange')
  const [returnReason, setReturnReason] = useState('Damaged / Broken Product Received')
  const [returnNotes, setReturnNotes] = useState('')
  const [defectPhoto, setDefectPhoto] = useState(null)
  const [defectPhotoName, setDefectPhotoName] = useState('')
  const [returnError, setReturnError] = useState(null)
  const [returnSuccessNotice, setReturnSuccessNotice] = useState(null)

  const handleOpenReturnModal = (order, item) => {
    setReturnOrder(order)
    setReturnModalItem(item)
    setReturnType('Exchange')
    setReturnReason('Damaged / Broken Product Received')
    setReturnNotes('')
    setDefectPhoto(null)
    setDefectPhotoName('')
    setReturnError(null)
  }

  const handleDefectPhotoSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setReturnError('Please upload an image file (PNG, JPG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setReturnError('Photo size must be under 5MB')
      return
    }
    setDefectPhotoName(file.name)
    setReturnError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setDefectPhoto(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitReturn = (e) => {
    e.preventDefault()
    if (!defectPhoto) {
      setReturnError('Please upload a clear photo showing the damage or defect on the product.')
      return
    }
    if (!returnNotes.trim()) {
      setReturnError('Please provide a brief description of what is damaged or defective.')
      return
    }

    const newRequest = {
      id: 'RET-' + Date.now().toString().slice(-6),
      orderId: returnOrder.id,
      orderNumber: returnOrder.orderNumber,
      productId: returnModalItem.productId,
      productName: returnModalItem.productName,
      customerName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || 'Customer'),
      customerEmail: user?.email || 'customer@modimal.com',
      shippingAddress: returnOrder.shippingAddress || '',
      requestType: returnType,
      reason: returnReason,
      description: returnNotes.trim(),
      defectPhoto: defectPhoto,
      status: 'PENDING_ADMIN_REVIEW',
      adminNotes: null,
      createdAt: new Date().toISOString(),
    }

    const updated = [newRequest, ...returnRequests]
    setReturnRequests(updated)
    try {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to save return request', err)
    }

    setReturnModalItem(null)
    setReturnSuccessNotice(
      `Your ${returnType} request for "${returnModalItem.productName}" (Order #${returnOrder.orderNumber}) has been submitted! Admin will review your defective product photo and route the replacement.`
    )
    setTimeout(() => setReturnSuccessNotice(null), 6000)
  }

  const getReturnStatus = (orderId, productId) => {
    return returnRequests.find((r) => r.orderId === orderId && r.productId === productId)
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerOrders()
      setOrders(data || [])
    } catch (err) {
      console.error('Failed to load orders', err)
      setError(
        err.response?.data?.message ||
          'Unable to load your order history. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent'
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="orders-page-root" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="Retrieving your orders from database..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="orders-page-root">
      {/* Page Header */}
      <div className="orders-header-row">
        <div>
          <h1 className="orders-main-title">My Orders & Receipts</h1>
          <p className="orders-subtitle">
            Track fulfillment, view transaction records, and download invoices.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            title="Refresh order history"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Return & Exchange Success Alert */}
      {returnSuccessNotice && (
        <div className="orders-success-banner">
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{returnSuccessNotice}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && !error ? (
        <div className="cart-empty-wrapper" style={{ padding: '4.5rem 2rem' }}>
          <Package size={52} strokeWidth={1.25} className="cart-empty-icon" />
          <h2 className="cart-empty-title">No orders placed yet</h2>
          <p className="cart-empty-desc">
            When you complete an order, its real-time fulfillment status, payment receipt, and invoice will be recorded here.
          </p>
          <Link to="/products">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="orders-list-wrapper">
          {orders.map((order) => {
            const isConfirmed = order.status === 'CONFIRMED'
            const isShipped = order.status === 'SHIPPED'
            const isDelivered = order.status === 'DELIVERED'

            return (
              <div key={order.id} className="order-card">
                {/* Header with Meta */}
                <div className="order-card-header">
                  <div className="order-header-meta">
                    <div className="order-meta-col">
                      <span className="order-meta-label">Order Number</span>
                      <span className="order-meta-val" style={{ fontFamily: 'monospace' }}>
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="order-meta-col">
                      <span className="order-meta-label">Date Placed</span>
                      <span className="order-meta-val">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="order-meta-col">
                      <span className="order-meta-label">Total Amount</span>
                      <span className="order-meta-val" style={{ color: 'var(--color-accent)' }}>
                        ₹{Number(order.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      className={`order-status-badge ${
                        isDelivered
                          ? 'status-delivered'
                          : isShipped
                          ? 'status-shipped'
                          : isConfirmed
                          ? 'status-confirmed'
                          : 'status-pending'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>{order.status}</span>
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Printer}
                      iconPosition="left"
                      onClick={() => setSelectedInvoiceOrder(order)}
                    >
                      Invoice
                    </Button>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="order-progress-wrapper">
                  <div className="order-stepper">
                    <div className="stepper-bar-line">
                      <div
                        className="stepper-bar-fill"
                        style={{
                          width: isDelivered ? '100%' : isShipped ? '70%' : isConfirmed ? '45%' : '15%',
                        }}
                      />
                    </div>

                    {/* Step 1: Placed */}
                    <div className="stepper-step completed">
                      <div className="stepper-node">✓</div>
                      <span className="stepper-title">Order Placed</span>
                    </div>

                    {/* Step 2: Payment Verified */}
                    <div className="stepper-step completed">
                      <div className="stepper-node">✓</div>
                      <span className="stepper-title">Payment Verified</span>
                    </div>

                    {/* Step 3: Processing */}
                    <div className={`stepper-step ${isConfirmed ? 'active' : isShipped || isDelivered ? 'completed' : ''}`}>
                      <div className="stepper-node">{isShipped || isDelivered ? '✓' : '3'}</div>
                      <span className="stepper-title">Processing</span>
                    </div>

                    {/* Step 4: Dispatched */}
                    <div className={`stepper-step ${isShipped ? 'active' : isDelivered ? 'completed' : ''}`}>
                      <div className="stepper-node">{isDelivered ? '✓' : '4'}</div>
                      <span className="stepper-title">Dispatched</span>
                    </div>

                    {/* Step 5: Delivered */}
                    <div className={`stepper-step ${isDelivered ? 'active' : ''}`}>
                      <div className="stepper-node">5</div>
                      <span className="stepper-title">Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="order-items-list">
                  {order.items &&
                    order.items.map((item) => {
                      const itemImg = getProductImage({ id: item.productId, name: item.productName })
                      const retStatus = getReturnStatus(order.id, item.productId)

                      return (
                        <div key={item.id} className="order-single-item">
                          <div className="order-item-img-box">
                            <img src={itemImg} alt={item.productName} className="order-item-img" />
                          </div>

                          <div className="order-item-details-col">
                            <h4 className="order-item-title">{item.productName}</h4>
                            <span className="order-item-submeta">
                              Qty: <strong>{item.quantity}</strong> &nbsp;•&nbsp; Unit Price: ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>

                            {/* Return / Exchange Status or Request Button */}
                            <div className="item-return-action-bar">
                              {retStatus ? (
                                <div className={`return-status-pill status-${retStatus.status.toLowerCase()}`}>
                                  {retStatus.status === 'PENDING_ADMIN_REVIEW' && (
                                    <>
                                      <Clock size={12} />
                                      <span>{retStatus.requestType} Requested: Awaiting Admin Inspection</span>
                                    </>
                                  )}
                                  {retStatus.status === 'ROUTED_TO_VENDOR' && (
                                    <>
                                      <CheckCircle2 size={12} color="#22c55e" />
                                      <span style={{ color: '#22c55e' }}>{retStatus.requestType} Approved! Routed to Vendor</span>
                                    </>
                                  )}
                                  {retStatus.status === 'RESOLVED' && (
                                    <>
                                      <CheckCircle2 size={12} color="#22c55e" />
                                      <span>{retStatus.requestType} Resolved</span>
                                    </>
                                  )}
                                  {retStatus.status === 'REJECTED' && (
                                    <>
                                      <AlertTriangle size={12} color="#ef4444" />
                                      <span style={{ color: '#ef4444' }}>Request Declined: {retStatus.adminNotes || 'Does not qualify'}</span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="item-return-btn"
                                  onClick={() => handleOpenReturnModal(order, item)}
                                  title="Request return or exchange for damaged/defective product"
                                >
                                  <RotateCcw size={12} />
                                  <span>Return / Exchange Item</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="order-item-total">
                            ₹{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Card Footer: Payment & Delivery Information */}
                <div className="order-card-footer">
                  <div className="order-footer-details">
                    <div className="footer-info-item">
                      <CreditCard size={16} />
                      <span>
                        Paid via: <strong>{order.payment?.paymentMethod || 'Online'}</strong>
                        {order.payment?.transactionId && (
                          <span style={{ fontFamily: 'monospace', marginLeft: '0.4rem', color: 'var(--color-text-muted)' }}>
                            ({order.payment.transactionId})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="footer-info-item">
                      <MapPin size={16} />
                      <span title={order.shippingAddress}>
                        Delivering to:{' '}
                        <strong>
                          {order.shippingAddress && order.shippingAddress.length > 40
                            ? order.shippingAddress.substring(0, 40) + '...'
                            : order.shippingAddress || 'Registered Address'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="order-footer-actions">
                    <Link to="/products">
                      <Button variant="ghost" size="sm" icon={ExternalLink} iconPosition="right">
                        Buy More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <div className="modal-overlay" onClick={() => setSelectedInvoiceOrder(null)}>
          <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src="/logo-icon.png" alt="Nivora" style={{ height: '36px', width: 'auto' }} />
                <div>
                  <span className="invoice-brand-title">NIVORA</span>
                  <p style={{ fontSize: '0.78125rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                    TAX INVOICE / PURCHASE RECEIPT
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="primary" size="sm" icon={Printer} iconPosition="left" onClick={handlePrint}>
                  Print
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Invoice To:
                </span>
                <p style={{ fontWeight: 600, marginTop: '0.25rem' }}>
                  {selectedInvoiceOrder.userEmail}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {selectedInvoiceOrder.shippingAddress}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Invoice Details:
                </span>
                <p style={{ marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  <strong>Order #:</strong> {selectedInvoiceOrder.orderNumber}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  Date: {formatDate(selectedInvoiceOrder.createdAt)}
                </p>
                <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  Txn ID: {selectedInvoiceOrder.payment?.transactionId || 'N/A'}
                </p>
                <p style={{ color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>
                  Payment: {selectedInvoiceOrder.payment?.paymentStatus || 'COMPLETED'} ({selectedInvoiceOrder.payment?.paymentMethod})
                </p>
              </div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items?.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.productName}</strong></td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-totals-box">
              <div>
                <span style={{ color: 'var(--color-text-muted)', marginRight: '1.5rem' }}>Delivery / Handling:</span>
                <span>COMPLIMENTARY</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', marginRight: '1.5rem' }}>Applicable Taxes:</span>
                <span>INCLUDED</span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ marginRight: '1.5rem' }}>Total Paid:</span>
                <span style={{ color: 'var(--color-accent)' }}>
                  ₹{Number(selectedInvoiceOrder.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              Thank you for shopping with NIVORA. For questions regarding this order, contact support@nivora.com.
            </div>
          </div>
        </div>
      )}

      {/* Return / Exchange Modal */}
      {returnModalItem && returnOrder && (
        <div className="order-modal-backdrop" onClick={() => setReturnModalItem(null)}>
          <div className="return-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="return-modal-header">
              <div className="return-header-title-wrap">
                <div className="return-icon-badge">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="return-modal-title">Return or Exchange Item</h3>
                  <span className="return-modal-sub">
                    Order #{returnOrder.orderNumber} • Placed {formatDate(returnOrder.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="invoice-close-btn"
                onClick={() => setReturnModalItem(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="return-modal-form">
              {/* Product Reference Card */}
              <div className="return-product-summary">
                <img
                  src={getProductImage({ id: returnModalItem.productId, name: returnModalItem.productName })}
                  alt={returnModalItem.productName}
                  className="return-item-thumb"
                />
                <div>
                  <h4 className="return-item-name">{returnModalItem.productName}</h4>
                  <span className="return-item-meta">
                    Quantity: {returnModalItem.quantity} unit(s) • Paid: ₹{Number(returnModalItem.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {returnError && (
                <div className="return-error-banner">
                  <AlertTriangle size={16} />
                  <span>{returnError}</span>
                </div>
              )}

              {/* Request Type Selection: Exchange vs Return */}
              <div className="return-field-group">
                <label className="return-field-label">Request Type</label>
                <div className="return-type-selector">
                  <button
                    type="button"
                    className={`return-type-card ${returnType === 'Exchange' ? 'active' : ''}`}
                    onClick={() => setReturnType('Exchange')}
                  >
                    <div className="return-type-title">Exchange / Replacement</div>
                    <div className="return-type-desc">Dispatch a brand new replacement piece for the defective item</div>
                  </button>

                  <button
                    type="button"
                    className={`return-type-card ${returnType === 'Return' ? 'active' : ''}`}
                    onClick={() => setReturnType('Return')}
                  >
                    <div className="return-type-title">Return & Refund</div>
                    <div className="return-type-desc">Send back item for full refund to original payment source</div>
                  </button>
                </div>
              </div>

              {/* Reason Dropdown */}
              <div className="return-field-group">
                <label className="return-field-label">
                  Reason for Return / Exchange <span className="req-star">*</span>
                </label>
                <select
                  className="return-select-input"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                >
                  <option value="Damaged / Broken Product Received">Damaged / Broken Product Received</option>
                  <option value="Defective / Component Malfunctioning">Defective / Component Malfunctioning</option>
                  <option value="Incorrect Item or Size Received">Incorrect Item or Size Received</option>
                  <option value="Significantly Different from Description">Significantly Different from Description</option>
                  <option value="Missing Parts or Accessories">Missing Parts or Accessories</option>
                  <option value="Other Quality Concern">Other Quality Concern</option>
                </select>
              </div>

              {/* Problem Description */}
              <div className="return-field-group">
                <label className="return-field-label">
                  Describe Defect / Damage Details <span className="req-star">*</span>
                </label>
                <textarea
                  className="return-textarea"
                  rows={3}
                  maxLength={600}
                  placeholder="Explain exactly what is wrong or damaged with the product you received..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  required
                />
              </div>

              {/* Defective Product Photo Upload */}
              <div className="return-field-group">
                <label className="return-field-label">
                  Upload Photo of Defective Product <span className="req-star">*</span>
                </label>
                <p className="return-upload-subtext">
                  A clear photo showing the damage or defect is required for Admin inspection before routing to the vendor.
                </p>

                {defectPhoto ? (
                  <div className="defect-photo-preview-box">
                    <img src={defectPhoto} alt="Defective product upload" className="defect-img-preview" />
                    <div className="defect-photo-meta">
                      <span className="defect-name">{defectPhotoName || 'Defect Evidence Photo'}</span>
                      <span className="defect-verified-tag">✓ Ready for Admin Review</span>
                    </div>
                    <button
                      type="button"
                      className="defect-remove-btn"
                      onClick={() => {
                        setDefectPhoto(null)
                        setDefectPhotoName('')
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div className="defect-upload-dropzone">
                    <Camera size={28} className="defect-camera-icon" />
                    <p className="dropzone-text">Take or choose photo of damaged product</p>
                    <label htmlFor="defectPhotoInput" className="dropzone-btn-label">
                      Browse Defect Photo
                    </label>
                    <input
                      id="defectPhotoInput"
                      type="file"
                      accept="image/*"
                      className="hidden-file-input"
                      onChange={(e) => handleDefectPhotoSelect(e.target.files?.[0])}
                    />
                    <span className="dropzone-hint">PNG, JPG, WEBP • Max 5MB</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="return-modal-actions">
                <Button type="submit" variant="primary" icon={Send} iconPosition="left">
                  Submit {returnType} Request
                </Button>
                <Button type="button" variant="outline" onClick={() => setReturnModalItem(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

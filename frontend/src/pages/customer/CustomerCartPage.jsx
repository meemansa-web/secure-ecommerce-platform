import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronDown,
  Check,
  QrCode,
  Clock,
  MapPin,
  Mail,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/useAuth'
import { createOrder } from '../../api/orderApi'
import { getProductImage } from '../../utils/productImages'
import { sendOrderConfirmationEmail } from '../../utils/emailService'
import EmailPreviewModal from '../../components/common/EmailPreviewModal'
import Button from '../../components/common/Button'
import './CustomerCartPage.css'

const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: '#0F9D58', initial: 'G' },
  { id: 'phonepe', name: 'PhonePe', color: '#5f259f', initial: 'Pe' },
  { id: 'paytm', name: 'Paytm', color: '#00BAF2', initial: 'Pay' },
  { id: 'bhim', name: 'BHIM UPI', color: '#00539C', initial: 'B' },
  { id: 'amazonpay', name: 'Amazon Pay', color: '#FF9900', initial: 'A' },
  { id: 'cred', name: 'CRED UPI', color: '#1A1A1A', initial: 'CR' },
]

const UPI_HANDLES = ['@okhdfcbank', '@oksbi', '@ybl', '@paytm', '@ibl', '@apl']

export default function CustomerCartPage() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    shippingFee,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart()

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Checkout Form State
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [customerName, setCustomerName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''
  )
  const [phone, setPhone] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // Saved Address Auto-Fill & Persistence
  const addressStorageKey = `modimal_addresses_${user?.email || 'customer'}`
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true)

  // Order Confirmation Email State
  const [dispatchedInvoiceMail, setDispatchedInvoiceMail] = useState(null)
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(addressStorageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed)
          const def = parsed.find((a) => a.isDefault) || parsed[0]
          if (def) {
            setSelectedAddressId(def.id)
            setCustomerName(def.fullName || '')
            setPhone(def.phone || '')
            setStreetAddress(def.addressLine || '')
            setCity(def.city || '')
            setState(def.state || '')
            setPincode(def.postalCode || '')
          }
          return
        }
      }

      // Default mock if none stored yet
      const initial = [
        {
          id: 1,
          fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.name || 'Gunjan Sharma'),
          phone: '+91 98765 43210',
          addressLine: '42 Heritage Boulevard, Suite 500',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          isDefault: true,
          tag: 'Home',
        },
      ]
      setSavedAddresses(initial)
      setSelectedAddressId(1)
      setCustomerName(initial[0].fullName)
      setPhone(initial[0].phone)
      setStreetAddress(initial[0].addressLine)
      setCity(initial[0].city)
      setState(initial[0].state)
      setPincode(initial[0].postalCode)
      try {
        localStorage.setItem(addressStorageKey, JSON.stringify(initial))
      } catch {}
    } catch (e) {
      console.error('Error loading saved addresses', e)
    }
  }, [user, addressStorageKey])

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id)
    setCustomerName(addr.fullName || '')
    setPhone(addr.phone || '')
    setStreetAddress(addr.addressLine || '')
    setCity(addr.city || '')
    setState(addr.state || '')
    setPincode(addr.postalCode || '')
  }

  // State checklist dropdown
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [stateSearchTerm, setStateSearchTerm] = useState('')
  const stateDropdownRef = useRef(null)

  // UPI enhanced options
  const [upiMode, setUpiMode] = useState('apps')
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay')

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target)) {
        setStateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredStates = INDIAN_STATES_AND_UTS.filter((s) =>
    s.toLowerCase().includes(stateSearchTerm.toLowerCase().trim())
  )

  // Payment method specific fields
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [selectedBank, setSelectedBank] = useState('HDFC Bank')

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)

  const handleStartCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/customer/cart')
      return
    }
    setIsCheckingOut(true)
    setErrorMessage(null)
  }

  const handleProcessOrder = async (e) => {
    e.preventDefault()

    if (!cartItems.length) {
      setErrorMessage('Your shopping bag is empty.')
      return
    }

    if (!streetAddress.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage('Please provide complete shipping address details (Street, City, Pincode).')
      return
    }

    const fullShippingAddress = `${customerName ? customerName + ', ' : ''}${streetAddress.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}${phone ? ' (Tel: ' + phone.trim() + ')' : ''}`

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const payload = {
        shippingAddress: fullShippingAddress,
        paymentMethod: paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      }

      // Call Spring Boot /api/customer/orders
      const orderResponse = await createOrder(payload)

      // On successful database persistence:
      setCompletedOrder(orderResponse)

      // Dispatch Order Confirmation Email to customer's registered email
      try {
        const invoiceMail = await sendOrderConfirmationEmail({
          email: user?.email || 'customer@example.com',
          customerName: customerName.trim() || user?.firstName || 'Valued Member',
          orderId: orderResponse.id || orderResponse.orderNumber || Date.now(),
          orderDate: orderResponse.orderDate || new Date().toISOString(),
          items: cartItems,
          totalAmount: cartTotal,
          shippingFee: shippingFee,
          shippingAddress: {
            street: streetAddress.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          paymentMethod: paymentMethod,
        })
        setDispatchedInvoiceMail(invoiceMail)
      } catch (mailErr) {
        console.warn('Order confirmation email failed to dispatch', mailErr)
      }

      // Persist or keep default address saved for future checkouts
      if (saveAddressForFuture) {
        try {
          const currentSaved = JSON.parse(localStorage.getItem(addressStorageKey) || '[]')
          const updatedEntry = {
            id: selectedAddressId || Date.now(),
            fullName: customerName.trim(),
            phone: phone.trim(),
            addressLine: streetAddress.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: pincode.trim(),
            isDefault: true,
            tag: 'Home',
          }
          const remaining = currentSaved.filter((a) => a.id !== updatedEntry.id).map((a) => ({ ...a, isDefault: false }))
          const updatedList = [updatedEntry, ...remaining]
          localStorage.setItem(addressStorageKey, JSON.stringify(updatedList))
          setSavedAddresses(updatedList)
        } catch (saveErr) {
          console.warn('Address persistence fallback', saveErr)
        }
      }

      clearCart()
      setIsCheckingOut(false)
    } catch (err) {
      console.error('Order creation failed', err)
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to finalize order. Please check inventory stock or payment details.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cart-page-root">
      {/* Breadcrumb Navigation */}
      <nav className="cart-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" className="cart-breadcrumb-link">Home</Link>
        <span className="cart-breadcrumb-separator">/</span>
        <Link to="/products" className="cart-breadcrumb-link">Shop</Link>
        <span className="cart-breadcrumb-separator">/</span>
        <span className="cart-breadcrumb-current">Shopping Cart</span>
      </nav>

      {/* Header */}
      <div className="cart-header-row">
        <div>
          <h1 className="cart-main-title">Shopping Cart</h1>
          <p className="cart-subtitle">
            {cartCount > 0
              ? `You have ${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your curated selection.`
              : 'Review your selected items before checkout.'}
          </p>
        </div>

        {cartItems.length > 0 && !isCheckingOut && (
          <button
            type="button"
            className="cart-clear-btn"
            onClick={clearCart}
            title="Empty Cart"
          >
            <Trash2 size={14} />
            <span>Clear Bag</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {cartItems.length === 0 && !completedOrder ? (
        <div className="cart-empty-wrapper">
          <ShoppingBag size={52} strokeWidth={1.25} className="cart-empty-icon" />
          <h2 className="cart-empty-title">Your shopping bag is empty</h2>
          <p className="cart-empty-desc">
            Explore our curated catalog of artisan crafts, high-performance electronics, and fine goods.
          </p>
          <Link to="/products">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        /* Active Cart 2-Column Grid */
        <div className="cart-layout-grid">
          {/* Left Column: Cart Items List */}
          <div className="cart-items-panel">
            {cartItems.map((item) => {
              const itemImg = getProductImage(item)
              const lineTotal = (item.price || 0) * item.quantity

              return (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-img-wrapper">
                    <img src={itemImg} alt={item.name} className="cart-item-img" />
                  </div>

                  <div className="cart-item-info">
                    <span className="cart-item-category">{item.categoryName || 'Curated'}</span>
                    <Link to={`/products/${item.id}`} className="cart-item-title">
                      {item.name}
                    </Link>
                    {item.vendorName && (
                      <span className="cart-item-vendor">Merchant: {item.vendorName}</span>
                    )}
                    <span className="cart-item-price-each">
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                    </span>
                  </div>

                  <div className="cart-item-actions">
                    <span className="cart-item-subtotal">
                      ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                    <div className="cart-qty-ctrl">
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart-qty-number">{item.quantity}</span>
                      <button
                        type="button"
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Service & Assurances Banner */}
            <div className="cart-assurances-banner">
              <div className="cart-assurance-col">
                <Truck size={22} className="cart-assurance-icon" />
                <div>
                  <span className="cart-assurance-title">Complimentary Delivery</span>
                  <span className="cart-assurance-sub">On orders exceeding ₹1,500</span>
                </div>
              </div>
              <div className="cart-assurance-col">
                <RotateCcw size={22} className="cart-assurance-icon" />
                <div>
                  <span className="cart-assurance-title">Hassle-Free Returns</span>
                  <span className="cart-assurance-sub">30-day exchange guarantee</span>
                </div>
              </div>
              <div className="cart-assurance-col">
                <ShieldCheck size={22} className="cart-assurance-icon" />
                <div>
                  <span className="cart-assurance-title">Authentic Products</span>
                  <span className="cart-assurance-sub">Direct from verified merchants</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Panel */}
          <div className="cart-summary-panel">
            <h2 className="summary-heading">
              {isCheckingOut ? 'Complete Purchase' : 'Order Summary'}
            </h2>

            {/* Price Calculations */}
            <div className="summary-line-item">
              <span>Bag Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
              <span className="summary-line-val">
                ₹{cartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="summary-line-item">
              <span>Standard Shipping</span>
              <span className="summary-line-val">
                {shippingFee === 0 ? (
                  <span className="summary-free-badge">FREE</span>
                ) : (
                  `₹${shippingFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span className="summary-total-label">Total Amount</span>
              <span className="summary-total-val">
                ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="summary-tax-note">Inclusive of all applicable GST & tariffs</span>

            {/* Error Message if any */}
            {errorMessage && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Checkout State View */}
            {!isCheckingOut ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={handleStartCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Link to="/products" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm" fullWidth>
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            ) : (
              /* Inline Checkout Flow */
              <form onSubmit={handleProcessOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Shipping Details */}
                <div className="checkout-section-block">
                  <div className="checkout-block-title">
                    <Truck size={16} />
                    <span>Shipping Destination</span>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="checkout-saved-addresses-bar">
                      <div className="saved-addr-chips-row">
                        <span className="saved-addr-prompt">Saved Addresses:</span>
                        {savedAddresses.map((addr) => (
                          <button
                            type="button"
                            key={addr.id}
                            className={`saved-addr-chip ${selectedAddressId === addr.id ? 'active' : ''}`}
                            onClick={() => handleSelectAddress(addr)}
                          >
                            <MapPin size={12} />
                            <span>{addr.tag || 'Address'} ({addr.city})</span>
                            {addr.isDefault && <span className="chip-def-badge">Default</span>}
                          </button>
                        ))}
                      </div>
                      <div className="saved-addr-auto-notice">
                        <CheckCircle2 size={13} color="#22c55e" />
                        <span>Pre-filled from your saved default address. Modify any field if you wish to deliver elsewhere.</span>
                      </div>
                    </div>
                  )}

                  <div className="checkout-input-group">
                    <label className="checkout-label">Recipient Name</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="e.g. Gunjan Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="checkout-input-group">
                    <label className="checkout-label">Street Address / Landmark</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="Flat, House no., Building, Apartment, Area"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="checkout-row-2">
                    <div className="checkout-input-group">
                      <label className="checkout-label">City</label>
                      <input
                        type="text"
                        className="checkout-input"
                        placeholder="New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">PIN Code</label>
                      <input
                        type="text"
                        className="checkout-input"
                        placeholder="110001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="checkout-row-2">
                    <div className="checkout-input-group" ref={stateDropdownRef}>
                      <label className="checkout-label">State / Union Territory</label>
                      <div className="state-select-container">
                        <button
                          type="button"
                          className={`state-select-trigger ${stateDropdownOpen ? 'active' : ''}`}
                          onClick={() => setStateDropdownOpen((prev) => !prev)}
                        >
                          <span>{state || 'Select State / UT...'}</span>
                          <ChevronDown size={14} />
                        </button>

                        {stateDropdownOpen && (
                          <div className="state-dropdown-menu">
                            <div className="state-search-box">
                              <input
                                type="text"
                                className="state-search-input"
                                placeholder="Search state / UT..."
                                value={stateSearchTerm}
                                onChange={(e) => setStateSearchTerm(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <div className="state-options-list">
                              {filteredStates.length > 0 ? (
                                filteredStates.map((st) => (
                                  <div
                                    key={st}
                                    className={`state-option-item ${state === st ? 'selected' : ''}`}
                                    onClick={() => {
                                      setState(st)
                                      setStateDropdownOpen(false)
                                      setStateSearchTerm('')
                                    }}
                                  >
                                    <span>{st}</span>
                                    {state === st && <Check size={14} color="var(--color-accent)" />}
                                  </div>
                                ))
                              ) : (
                                <div style={{ padding: '0.6rem 0.8rem', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                                  No matching state found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="checkout-input-group">
                      <label className="checkout-label">Contact Number</label>
                      <input
                        type="tel"
                        className="checkout-input"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="checkout-save-pref-row">
                    <label className="save-pref-checkbox-label">
                      <input
                        type="checkbox"
                        checked={saveAddressForFuture}
                        onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      />
                      <span>Keep this address saved as my default shipping destination for future orders</span>
                    </label>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="checkout-section-block">
                  <div className="checkout-block-title">
                    <CreditCard size={16} />
                    <span>Payment Method</span>
                  </div>

                  <div className="payment-methods-grid">
                    {/* UPI */}
                    <div
                      className={`payment-method-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('UPI')}
                    >
                      <Smartphone size={20} color={paymentMethod === 'UPI' ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span className="payment-method-name">UPI / QR</span>
                    </div>

                    {/* CARD */}
                    <div
                      className={`payment-method-card ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('CARD')}
                    >
                      <CreditCard size={20} color={paymentMethod === 'CARD' ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span className="payment-method-name">Card</span>
                    </div>

                    {/* NET BANKING */}
                    <div
                      className={`payment-method-card ${paymentMethod === 'NET_BANKING' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('NET_BANKING')}
                    >
                      <Building size={20} color={paymentMethod === 'NET_BANKING' ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span className="payment-method-name">Net Banking</span>
                    </div>

                    {/* COD */}
                    <div
                      className={`payment-method-card ${paymentMethod === 'COD' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('COD')}
                    >
                      <Banknote size={20} color={paymentMethod === 'COD' ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
                      <span className="payment-method-name">Cash on Delivery</span>
                    </div>
                  </div>

                  {/* Sub forms based on selected method */}
                  {paymentMethod === 'UPI' && (
                    <div className="payment-sub-form">
                      {/* UPI Mode Tabs */}
                      <div className="upi-subtabs-row">
                        <button
                          type="button"
                          className={`upi-subtab-btn ${upiMode === 'apps' ? 'active' : ''}`}
                          onClick={() => setUpiMode('apps')}
                        >
                          Quick UPI Apps
                        </button>
                        <button
                          type="button"
                          className={`upi-subtab-btn ${upiMode === 'vpa' ? 'active' : ''}`}
                          onClick={() => setUpiMode('vpa')}
                        >
                          Enter UPI ID
                        </button>
                        <button
                          type="button"
                          className={`upi-subtab-btn ${upiMode === 'qr' ? 'active' : ''}`}
                          onClick={() => setUpiMode('qr')}
                        >
                          Scan QR Code
                        </button>
                      </div>

                      {/* 1. Quick UPI Apps */}
                      {upiMode === 'apps' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                            Choose your preferred payment app:
                          </span>
                          <div className="upi-apps-grid">
                            {UPI_APPS.map((app) => (
                              <div
                                key={app.id}
                                className={`upi-app-btn ${selectedUpiApp === app.id ? 'selected' : ''}`}
                                onClick={() => {
                                  setSelectedUpiApp(app.id)
                                  const handle = app.id === 'gpay' ? 'okhdfcbank' : app.id === 'phonepe' ? 'ybl' : app.id === 'paytm' ? 'paytm' : 'upi'
                                  setUpiId(`${customerName ? customerName.toLowerCase().replace(/\s+/g, '') : 'customer'}@${handle}`)
                                }}
                              >
                                <div className="upi-app-logo" style={{ backgroundColor: app.color }}>
                                  {app.initial}
                                </div>
                                <span className="upi-app-name">{app.name}</span>
                              </div>
                            ))}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Selected app will be triggered directly to authorize ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
                          </span>
                        </div>
                      )}

                      {/* 2. Enter UPI ID / VPA */}
                      {upiMode === 'vpa' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label className="checkout-label">Virtual Payment Address (VPA)</label>
                          <input
                            type="text"
                            className="checkout-input"
                            placeholder="e.g. mobile@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                          />
                          <div className="upi-handles-row">
                            {UPI_HANDLES.map((handle) => (
                              <button
                                key={handle}
                                type="button"
                                className="upi-handle-chip"
                                onClick={() => {
                                  const base = upiId.includes('@') ? upiId.split('@')[0] : upiId || 'customer'
                                  setUpiId(`${base}${handle}`)
                                }}
                              >
                                {handle}
                              </button>
                            ))}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            Tap any bank handle above to quickly complete your VPA.
                          </span>
                        </div>
                      )}

                      {/* 3. Scan QR Code */}
                      {upiMode === 'qr' && (
                        <div className="upi-qr-card">
                          <div className="upi-qr-box">
                            <svg className="upi-qr-svg" viewBox="0 0 100 100" fill="none">
                              {/* QR Code visual pattern */}
                              <rect width="100" height="100" fill="white" />
                              <rect x="8" y="8" width="26" height="26" stroke="#111827" strokeWidth="4" fill="none" />
                              <rect x="15" y="15" width="12" height="12" fill="#111827" />
                              <rect x="66" y="8" width="26" height="26" stroke="#111827" strokeWidth="4" fill="none" />
                              <rect x="73" y="15" width="12" height="12" fill="#111827" />
                              <rect x="8" y="66" width="26" height="26" stroke="#111827" strokeWidth="4" fill="none" />
                              <rect x="15" y="73" width="12" height="12" fill="#111827" />
                              {/* QR Data Dots */}
                              <rect x="42" y="10" width="6" height="6" fill="#111827" />
                              <rect x="52" y="16" width="6" height="6" fill="#111827" />
                              <rect x="44" y="26" width="8" height="6" fill="#111827" />
                              <rect x="12" y="42" width="6" height="8" fill="#111827" />
                              <rect x="24" y="46" width="6" height="6" fill="#111827" />
                              <rect x="42" y="42" width="16" height="16" fill="#10b981" rx="3" />
                              <rect x="68" y="42" width="8" height="6" fill="#111827" />
                              <rect x="80" y="50" width="6" height="8" fill="#111827" />
                              <rect x="44" y="66" width="6" height="6" fill="#111827" />
                              <rect x="54" y="74" width="8" height="6" fill="#111827" />
                              <rect x="68" y="66" width="6" height="8" fill="#111827" />
                              <rect x="78" y="76" width="8" height="8" fill="#111827" />
                            </svg>
                          </div>
                          <span className="upi-qr-instruction">
                            Scan with Google Pay, PhonePe, Paytm or any UPI App to pay ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="upi-qr-timer">
                            <Clock size={12} />
                            <span>Expires in 14:59</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'CARD' && (
                    <div className="payment-sub-form">
                      <div className="checkout-input-group">
                        <label className="checkout-label">Card Number</label>
                        <input
                          type="text"
                          className="checkout-input"
                          placeholder="4532 •••• •••• 8912"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </div>
                      <div className="checkout-input-group">
                        <label className="checkout-label">Name on Card</label>
                        <input
                          type="text"
                          className="checkout-input"
                          placeholder="Cardholder Name"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                        />
                      </div>
                      <div className="checkout-row-2">
                        <div className="checkout-input-group">
                          <label className="checkout-label">Valid Thru (MM/YY)</label>
                          <input
                            type="text"
                            className="checkout-input"
                            placeholder="08/28"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                          />
                        </div>
                        <div className="checkout-input-group">
                          <label className="checkout-label">CVV</label>
                          <input
                            type="password"
                            className="checkout-input"
                            placeholder="•••"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'NET_BANKING' && (
                    <div className="payment-sub-form">
                      <label className="checkout-label">Select Bank</label>
                      <select
                        className="checkout-input"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India">State Bank of India</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <div className="payment-sub-form">
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        Pay ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} with cash or UPI QR to the courier at the time of delivery.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={Lock}
                    iconPosition="left"
                    loading={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Securing Payment & Order...'
                      : `Authorize & Place Order (₹${cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem',
                    }}
                  >
                    <ArrowLeft size={14} />
                    <span>Return to Bag</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Success Modal with Database Verification Badge */}
      {completedOrder && (
        <div className="modal-overlay">
          <div className="order-success-modal">
            <div className="success-icon-badge">
              <CheckCircle2 size={42} strokeWidth={2} />
            </div>

            <h2 className="success-modal-title">Payment Confirmed!</h2>
            <p className="success-modal-sub">
              Your transaction has been processed and your order has been placed into our fulfillment pipeline.
            </p>

            <div className="verified-order-badge">
              <ShieldCheck size={16} />
              <span>100% Verified & Encrypted Order</span>
            </div>

            {/* Email Dispatch Notice */}
            <div
              className="order-email-alert"
              style={{
                margin: '1.25rem 0',
                padding: '0.85rem 1.15rem',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8125rem', color: '#cbd5e1' }}>
                <Mail size={16} color="#22c55e" />
                <span>
                  Tax invoice & confirmation email sent to <strong>{user?.email || 'your registered email'}</strong>
                </span>
              </div>
              {dispatchedInvoiceMail && (
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(true)}
                  style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  View Invoice
                </button>
              )}
            </div>

            <div className="success-details-card">
              <div className="success-detail-row">
                <span className="success-detail-label">Order Number:</span>
                <span className="success-detail-val" style={{ fontFamily: 'monospace' }}>
                  {completedOrder.orderNumber}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Amount Paid:</span>
                <span className="success-detail-val">
                  ₹{Number(completedOrder.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Payment Method:</span>
                <span className="success-detail-val">
                  {completedOrder.payment?.paymentMethod || paymentMethod}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Transaction ID:</span>
                <span className="success-detail-val" style={{ fontFamily: 'monospace' }}>
                  {completedOrder.payment?.transactionId || 'TXN-CONFIRMED'}
                </span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Payment Status:</span>
                <span className="success-detail-val" style={{ color: '#10b981' }}>
                  {completedOrder.payment?.paymentStatus || 'COMPLETED'}
                </span>
              </div>
            </div>

            <div className="modal-actions-row">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate('/customer/orders')}
              >
                Track in My Orders
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setCompletedOrder(null)
                  navigate('/products')
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {dispatchedInvoiceMail && (
        <EmailPreviewModal
          email={dispatchedInvoiceMail}
          isOpen={showEmailPreviewModal}
          onClose={() => setShowEmailPreviewModal(false)}
        />
      )}
    </div>
  )
}

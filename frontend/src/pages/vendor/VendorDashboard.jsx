import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Eye,
  Edit,
  Store,
  RotateCcw,
  Camera,
  ShieldCheck,
  X,
} from 'lucide-react'
import { getVendorProducts, getLowStockProducts, getVendorProfile } from '../../api/vendorApi'
import { getProductImage } from '../../utils/productImages'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import './VendorDashboard.css'

export default function VendorDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [profile, setProfile] = useState(null)
  const [products, setProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [error, setError] = useState(null)

  // Returns & Replacements routed by Admin
  const RETURNS_STORAGE_KEY = 'ecommerce_returns_requests'
  const [routedReturns, setRoutedReturns] = useState(() => {
    try {
      const saved = localStorage.getItem(RETURNS_STORAGE_KEY)
      return saved ? JSON.parse(saved).filter((r) => r.status === 'ROUTED_TO_VENDOR' || r.status === 'RESOLVED') : []
    } catch {
      return []
    }
  })
  const [vendorLightboxImg, setVendorLightboxImg] = useState(null)
  const [returnNotice, setReturnNotice] = useState(null)

  const handleFulfillReplacement = (reqId) => {
    try {
      const all = JSON.parse(localStorage.getItem(RETURNS_STORAGE_KEY) || '[]')
      const updated = all.map((r) =>
        r.id === reqId ? { ...r, status: 'RESOLVED', vendorFulfilledAt: new Date().toISOString() } : r
      )
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(updated))
      setRoutedReturns(updated.filter((r) => r.status === 'ROUTED_TO_VENDOR' || r.status === 'RESOLVED'))
      setReturnNotice(`Replacement for claim ${reqId} marked as dispatched and fulfilled!`)
      setTimeout(() => setReturnNotice(null), 4000)
    } catch (e) {
      console.error(e)
    }
  }

  const loadDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    setError(null)

    try {
      const [profileRes, productsRes, lowStockRes] = await Promise.allSettled([
        getVendorProfile(),
        getVendorProducts(),
        getLowStockProducts(),
      ])

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value)
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
        setProducts(productsRes.value)
      }
      if (lowStockRes.status === 'fulfilled' && Array.isArray(lowStockRes.value)) {
        setLowStockProducts(lowStockRes.value)
      }
    } catch (err) {
      setError('Failed to load some dashboard metrics. Please refresh.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="vendor-loading-wrap">
        <Loading text="Loading your merchant dashboard..." fullScreen={false} />
      </div>
    )
  }

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.active).length
  const inactiveProducts = totalProducts - activeProducts
  const lowStockCount = lowStockProducts.length

  const recentProducts = [...products].reverse().slice(0, 5)

  return (
    <div className="vendor-dashboard-root">
      {/* Top Welcome Bar */}
      <div className="vendor-dash-hero">
        <div className="vendor-hero-info">
          <div className="vendor-hero-badge">
            <Store size={14} />
            <span>Merchant Overview</span>
          </div>
          <h1 className="vendor-hero-title">
            Welcome back, {profile?.businessName || 'Partner'}
          </h1>
          <p className="vendor-hero-subtitle">
            Manage your product catalog, maintain active stock levels, and monitor customer-facing listings.
          </p>
        </div>

        <div className="vendor-hero-actions">
          <button
            type="button"
            className="vendor-btn-secondary"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            title="Refresh dashboard stats"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <Link to="/vendor/products/new">
            <Button variant="primary" icon={PlusCircle} iconPosition="left">
              Upload Product
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="vendor-alert-banner alert-warning">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="vendor-stats-grid">
        {/* Total Products */}
        <div className="vendor-stat-card">
          <div className="vendor-stat-icon-wrap stat-icon-blue">
            <Package size={22} />
          </div>
          <div className="vendor-stat-content">
            <span className="vendor-stat-label">Total Catalog</span>
            <div className="vendor-stat-value">{totalProducts}</div>
            <span className="vendor-stat-hint">Total registered products</span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="vendor-stat-card">
          <div className="vendor-stat-icon-wrap stat-icon-green">
            <CheckCircle2 size={22} />
          </div>
          <div className="vendor-stat-content">
            <span className="vendor-stat-label">Active in Storefront</span>
            <div className="vendor-stat-value">{activeProducts}</div>
            <span className="vendor-stat-hint">Visible to customers for purchase</span>
          </div>
        </div>

        {/* Inactive Listings */}
        <div className="vendor-stat-card">
          <div className="vendor-stat-icon-wrap stat-icon-muted">
            <TrendingUp size={22} />
          </div>
          <div className="vendor-stat-content">
            <span className="vendor-stat-label">Inactive / Paused</span>
            <div className="vendor-stat-value">{inactiveProducts}</div>
            <span className="vendor-stat-hint">Hidden from storefront</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`vendor-stat-card ${lowStockCount > 0 ? 'stat-card-alert' : ''}`}>
          <div className="vendor-stat-icon-wrap stat-icon-red">
            <AlertTriangle size={22} />
          </div>
          <div className="vendor-stat-content">
            <span className="vendor-stat-label">Low Stock Items</span>
            <div className="vendor-stat-value">{lowStockCount}</div>
            <span className="vendor-stat-hint">
              {lowStockCount > 0 ? 'Needs immediate restock' : 'All inventory healthy'}
            </span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Callout (if any) */}
      {lowStockCount > 0 && (
        <div className="vendor-callout-card callout-urgent">
          <div className="callout-header">
            <div className="callout-title-wrap">
              <AlertTriangle size={20} className="callout-icon" />
              <h3>Low Stock Attention Needed ({lowStockCount} Products)</h3>
            </div>
            <Link to="/vendor/inventory" className="callout-action-link">
              <span>Go to Inventory Management</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          <p className="callout-desc">
            The following products have dropped below their designated safety threshold. Restock them soon to prevent lost sales.
          </p>
          <div className="callout-items-chips">
            {lowStockProducts.slice(0, 4).map((item) => (
              <div key={item.inventoryId} className="low-stock-chip">
                <span className="chip-name">{item.productName}</span>
                <span className="chip-qty">{item.quantity} remaining</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Catalog Activity Table */}
      <div className="vendor-table-card">
        <div className="table-card-header">
          <div>
            <h2 className="table-card-title">Recent Products</h2>
            <p className="table-card-subtitle">Your most recently created catalog items</p>
          </div>
          <Link to="/vendor/products" className="view-all-link">
            <span>View All ({totalProducts})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="vendor-empty-state">
            <Package size={40} strokeWidth={1.2} />
            <h3>No products uploaded yet</h3>
            <p>Start selling on NIVORA by adding your first product to our marketplace.</p>
            <Link to="/vendor/products/new">
              <Button variant="primary" icon={PlusCircle} iconPosition="left">
                Upload First Product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="vendor-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => {
                  const imageUrl = getProductImage(product)

                  return (
                    <tr key={product.id}>
                      {/* Product Name & Image */}
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="product-thumbnail"
                            loading="lazy"
                          />
                          <div className="product-cell-meta">
                            <span className="product-cell-name">{product.name}</span>
                            <span className="product-cell-desc">
                              {product.description
                                ? product.description.slice(0, 55) + (product.description.length > 55 ? '...' : '')
                                : 'No description'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="category-tag">
                          {product.categoryName || 'General'}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="price-tag">
                          ₹{Number(product.price).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-pill ${product.active ? 'status-active' : 'status-inactive'}`}>
                          {product.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-group">
                          <Link
                            to={`/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-action-btn"
                            title="View on public storefront"
                          >
                            <Eye size={15} />
                          </Link>

                          <Link
                            to={`/vendor/products/${product.id}/edit`}
                            className="table-action-btn"
                            title="Edit product details"
                          >
                            <Edit size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Returns & Replacements Routed by Admin Section */}
      <div className="vendor-section-card" style={{ marginTop: '1.5rem' }}>
        <div className="section-card-header">
          <div className="section-header-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={18} color="var(--accent-olive, #d4af37)" />
              <h2 className="section-title">Returns & Replacements (Routed by Admin)</h2>
            </div>
            <p className="section-subtitle">
              Customer claims inspected and verified by Admin team requiring vendor fulfillment or dispatch.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem', borderRadius: '999px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-accent, #d4af37)', fontWeight: 600 }}>
            {routedReturns.length} Action Items
          </span>
        </div>

        {returnNotice && (
          <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            ✓ {returnNotice}
          </div>
        )}

        {routedReturns.length === 0 ? (
          <div className="empty-catalog-state" style={{ padding: '2.5rem 1rem' }}>
            <ShieldCheck size={36} color="#22c55e" style={{ margin: '0 auto 0.75rem' }} />
            <h3 className="empty-title">All Customer Shipments in Good Standing</h3>
            <p className="empty-desc">
              No damaged product reports currently assigned to your merchant account.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="vendor-data-table">
              <thead>
                <tr>
                  <th>Claim ID / Order</th>
                  <th>Customer & Shipping</th>
                  <th>Product</th>
                  <th>Defect Evidence</th>
                  <th>Type & Notes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Fulfillment Action</th>
                </tr>
              </thead>
              <tbody>
                {routedReturns.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>#{req.id}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Order #{req.orderNumber}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px' }}>
                        {req.shippingAddress}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU #{req.productId}</div>
                    </td>
                    <td>
                      {req.defectPhoto ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img
                            src={req.defectPhoto}
                            alt="Defect"
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--border-medium)' }}
                            onClick={() => setVendorLightboxImg(req.defectPhoto)}
                            title="Click to view customer defect photo"
                          />
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', color: 'var(--color-accent, #d4af37)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setVendorLightboxImg(req.defectPhoto)}
                          >
                            Inspect
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No photo</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                        {req.requestType}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        "{req.description}"
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${req.status === 'RESOLVED' ? 'status-active' : 'status-inactive'}`} style={{ fontSize: '0.72rem' }}>
                        {req.status === 'RESOLVED' ? '✓ Dispatched & Fulfilled' : '⏳ Awaiting Vendor Dispatch'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status === 'ROUTED_TO_VENDOR' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleFulfillReplacement(req.id)}
                        >
                          Dispatch Replacement
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                          ✓ Fulfilled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Defect Photo Lightbox */}
      {vendorLightboxImg && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
          onClick={() => setVendorLightboxImg(null)}
        >
          <div style={{ position: 'relative', maxWidth: '800px', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={{ position: 'absolute', top: '-38px', right: '0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              onClick={() => setVendorLightboxImg(null)}
            >
              <X size={24} />
            </button>
            <img src={vendorLightboxImg} alt="Enlarged defect proof" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  )
}

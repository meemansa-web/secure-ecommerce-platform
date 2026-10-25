import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Power,
  Boxes,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  X,
  Loader2,
} from 'lucide-react'
import {
  getVendorProducts,
  activateVendorProduct,
  deactivateVendorProduct,
  increaseVendorStock,
  setVendorInventory,
} from '../../api/vendorApi'
import { getProductImage } from '../../utils/productImages'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import './VendorProductsPage.css'

export default function VendorProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Restock Modal State
  const [restockModalProduct, setRestockModalProduct] = useState(null)
  const [restockQty, setRestockQty] = useState('10')
  const [restockSubmitting, setRestockSubmitting] = useState(false)
  const [restockError, setRestockError] = useState(null)

  // Action Loading state for specific product ID
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Load Products
  const loadProducts = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    setError(null)

    try {
      const data = await getVendorProducts()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (err) {
      setError('Unable to load products. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Toggle Active / Inactive
  const handleToggleActive = async (product) => {
    setActionLoadingId(product.id)
    setError(null)
    setSuccessMsg(null)

    try {
      if (product.active) {
        await deactivateVendorProduct(product.id)
        setSuccessMsg(`"${product.name}" has been paused and hidden from storefront.`)
      } else {
        await activateVendorProduct(product.id)
        setSuccessMsg(`"${product.name}" is now active and visible to buyers.`)
      }
      await loadProducts()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product status.'
      setError(msg)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle Quick Restock Submit
  const handleRestockSubmit = async (e) => {
    e.preventDefault()
    if (!restockModalProduct) return

    const qty = parseInt(restockQty, 10)
    if (isNaN(qty) || qty <= 0) {
      setRestockError('Please enter a valid quantity of 1 or more.')
      return
    }

    setRestockSubmitting(true)
    setRestockError(null)

    try {
      await increaseVendorStock(restockModalProduct.id, qty)
      setSuccessMsg(`Successfully added ${qty} units to "${restockModalProduct.name}".`)
      setRestockModalProduct(null)
      await loadProducts()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to increase stock.'
      setRestockError(msg)
    } finally {
      setRestockSubmitting(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (statusFilter === 'ACTIVE') return p.active
    if (statusFilter === 'INACTIVE') return !p.active
    return true
  })

  if (loading) {
    return (
      <div className="vendor-loading-wrap">
        <Loading text="Loading your product catalog..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="vendor-products-root">
      {/* Page Header */}
      <div className="v-page-header">
        <div className="v-header-info">
          <div className="v-header-badge">
            <Package size={13} />
            <span>Product Catalog</span>
          </div>
          <h1 className="v-page-title editorial-title-serif">My Products</h1>
          <p className="v-page-subtitle">
            Manage your store offerings, toggle product visibility, and update pricing.
          </p>
        </div>

        <div className="v-header-actions">
          <button
            type="button"
            className="v-btn-secondary"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
            title="Refresh product list"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <Link to="/vendor/products/new">
            <Button variant="primary" icon={PlusCircle} iconPosition="left">
              Upload New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="v-alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
          <button type="button" className="alert-dismiss" onClick={() => setSuccessMsg(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="v-alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" className="alert-dismiss" onClick={() => setError(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Toolbar: Search & Status Filters */}
      <div className="v-catalog-toolbar">
        {/* Search */}
        <div className="v-search-box">
          <Search size={16} className="v-search-icon" />
          <input
            type="text"
            placeholder="Search products by title or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="v-clear-search"
              onClick={() => setSearchQuery('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="v-filter-tabs">
          <button
            type="button"
            className={`v-filter-tab ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({products.length})
          </button>
          <button
            type="button"
            className={`v-filter-tab ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active ({products.filter((p) => p.active).length})
          </button>
          <button
            type="button"
            className={`v-filter-tab ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('INACTIVE')}
          >
            Inactive ({products.filter((p) => !p.active).length})
          </button>
        </div>
      </div>

      {/* Product List Table / Empty State */}
      <div className="v-table-card">
        {filteredProducts.length === 0 ? (
          <div className="v-empty-box">
            <Package size={44} strokeWidth={1.2} />
            <h3>No products found</h3>
            <p>
              {searchQuery || statusFilter !== 'ALL'
                ? 'No products match your search or active filter.'
                : 'You have not uploaded any products to your store yet.'}
            </p>
            {searchQuery || statusFilter !== 'ALL' ? (
              <button
                type="button"
                className="v-btn-secondary"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('ALL')
                }}
              >
                Clear Filters
              </button>
            ) : (
              <Link to="/vendor/products/new">
                <Button variant="primary" icon={PlusCircle} iconPosition="left">
                  Upload First Product
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="v-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Department</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const imageUrl = getProductImage(product)
                  const isActionBusy = actionLoadingId === product.id

                  return (
                    <tr key={product.id}>
                      {/* Product Name & Visual */}
                      <td>
                        <div className="v-product-cell">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="v-product-thumb"
                            loading="lazy"
                          />
                          <div className="v-product-details">
                            <span className="v-product-title">{product.name}</span>
                            <span className="v-product-sku">ID: #{product.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="v-dept-badge">{product.categoryName || 'General'}</span>
                      </td>

                      {/* Price */}
                      <td>
                        <span className="v-price-text">
                          ₹{Number(product.price).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`v-status-badge ${
                            product.active ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          <span className="status-dot" />
                          <span>{product.active ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td>
                        <span className="v-date-text">
                          {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="v-row-actions">
                          {/* Storefront Link (if active) */}
                          <Link
                            to={`/products/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="v-action-btn"
                            title="View on customer storefront"
                          >
                            <ExternalLink size={15} />
                          </Link>

                          {/* Quick Restock Dialog */}
                          <button
                            type="button"
                            className="v-action-btn"
                            onClick={() => {
                              setRestockModalProduct(product)
                              setRestockQty('10')
                              setRestockError(null)
                            }}
                            title="Quick restock inventory"
                          >
                            <Boxes size={15} />
                          </button>

                          {/* Edit Details */}
                          <Link
                            to={`/vendor/products/${product.id}/edit`}
                            className="v-action-btn"
                            title="Edit product info"
                          >
                            <Edit size={15} />
                          </Link>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            type="button"
                            className={`v-action-btn toggle-btn ${
                              product.active ? 'btn-deactivate' : 'btn-activate'
                            }`}
                            onClick={() => handleToggleActive(product)}
                            disabled={isActionBusy}
                            title={product.active ? 'Deactivate / Pause listing' : 'Activate product'}
                          >
                            {isActionBusy ? (
                              <Loader2 size={15} className="spin-icon" />
                            ) : (
                              <Power size={15} />
                            )}
                          </button>
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

      {/* Quick Restock Modal Dialog */}
      {restockModalProduct && (
        <div className="v-modal-overlay" onClick={() => setRestockModalProduct(null)}>
          <div className="v-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-header">
              <div className="modal-title-wrap">
                <Boxes size={18} />
                <h3>Restock Inventory</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setRestockModalProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="v-modal-body">
              <p className="modal-product-name">
                Product: <strong>{restockModalProduct.name}</strong>
              </p>

              {restockError && (
                <div className="v-alert alert-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={15} />
                  <span>{restockError}</span>
                </div>
              )}

              <form onSubmit={handleRestockSubmit}>
                <div className="form-field-group">
                  <label htmlFor="restockQtyInput" className="form-field-label">
                    Add Units to Stock
                  </label>
                  <input
                    id="restockQtyInput"
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="form-field-input"
                    placeholder="10"
                    autoFocus
                    disabled={restockSubmitting}
                  />
                  <div className="quick-add-pills">
                    <button
                      type="button"
                      className="qty-pill"
                      onClick={() => setRestockQty('5')}
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      className="qty-pill"
                      onClick={() => setRestockQty('10')}
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      className="qty-pill"
                      onClick={() => setRestockQty('25')}
                    >
                      +25
                    </button>
                    <button
                      type="button"
                      className="qty-pill"
                      onClick={() => setRestockQty('50')}
                    >
                      +50
                    </button>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={restockSubmitting}
                    icon={restockSubmitting ? Loader2 : Boxes}
                  >
                    {restockSubmitting ? 'Updating...' : `Add ${restockQty || 0} Units`}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRestockModalProduct(null)}
                    disabled={restockSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

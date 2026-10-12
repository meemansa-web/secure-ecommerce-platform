import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Sliders,
  RefreshCw,
  X,
  Package,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import {
  getVendorProducts,
  getVendorInventory,
  setVendorInventory,
  increaseVendorStock,
  decreaseVendorStock,
  getLowStockProducts,
} from '../../api/vendorApi'
import { getProductImage } from '../../utils/productImages'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import './VendorInventoryPage.css'

export default function VendorInventoryPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [products, setProducts] = useState([])
  const [inventories, setInventories] = useState({}) // { [productId]: InventoryResponse }
  const [lowStockList, setLowStockList] = useState([])
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  // Configure Threshold Modal
  const [configProduct, setConfigProduct] = useState(null)
  const [configQuantity, setConfigQuantity] = useState('')
  const [configThreshold, setConfigThreshold] = useState('')
  const [configSubmitting, setConfigSubmitting] = useState(false)

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    setErrorMsg(null)

    try {
      const [prodsData, lowStockData] = await Promise.all([
        getVendorProducts(),
        getLowStockProducts(),
      ])

      if (Array.isArray(prodsData)) {
        setProducts(prodsData)

        // Load inventory for each product
        const invEntries = await Promise.allSettled(
          prodsData.map((p) => getVendorInventory(p.id))
        )

        const invMap = {}
        invEntries.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value) {
            invMap[prodsData[index].id] = res.value
          }
        })
        setInventories(invMap)
      }

      if (Array.isArray(lowStockData)) {
        setLowStockList(lowStockData)
      }
    } catch (err) {
      setErrorMsg('Failed to load inventory data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Quick Increase
  const handleQuickIncrease = async (productId, amount) => {
    setActionLoadingId(productId)
    setErrorMsg(null)
    setFeedbackMsg(null)

    try {
      const updated = await increaseVendorStock(productId, amount)
      setInventories((prev) => ({ ...prev, [productId]: updated }))
      setFeedbackMsg(`Added ${amount} units to stock. New total: ${updated.quantity}`)
      // Refresh low stock list in background
      const low = await getLowStockProducts()
      setLowStockList(low || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to increase stock.'
      setErrorMsg(msg)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Quick Decrease
  const handleQuickDecrease = async (productId, amount) => {
    const currentQty = inventories[productId]?.quantity || 0
    if (currentQty < amount) {
      setErrorMsg(`Cannot decrease by ${amount}. Only ${currentQty} units currently in stock.`)
      return
    }

    setActionLoadingId(productId)
    setErrorMsg(null)
    setFeedbackMsg(null)

    try {
      const updated = await decreaseVendorStock(productId, amount)
      setInventories((prev) => ({ ...prev, [productId]: updated }))
      setFeedbackMsg(`Reduced stock by ${amount}. New total: ${updated.quantity}`)
      const low = await getLowStockProducts()
      setLowStockList(low || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to decrease stock.'
      setErrorMsg(msg)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Open Configure Modal
  const openConfigModal = (product) => {
    const currentInv = inventories[product.id]
    setConfigProduct(product)
    setConfigQuantity(currentInv ? String(currentInv.quantity) : '0')
    setConfigThreshold(currentInv ? String(currentInv.lowStockThreshold) : '5')
  }

  // Save Inventory Configuration
  const handleSaveConfig = async (e) => {
    e.preventDefault()
    if (!configProduct) return

    const qty = parseInt(configQuantity, 10)
    const threshold = parseInt(configThreshold, 10)

    if (isNaN(qty) || qty < 0) {
      setErrorMsg('Quantity must be 0 or greater.')
      return
    }
    if (isNaN(threshold) || threshold < 0) {
      setErrorMsg('Threshold must be 0 or greater.')
      return
    }

    setConfigSubmitting(true)
    setErrorMsg(null)

    try {
      const updated = await setVendorInventory(configProduct.id, {
        quantity: qty,
        lowStockThreshold: threshold,
      })
      setInventories((prev) => ({ ...prev, [configProduct.id]: updated }))
      setFeedbackMsg(`Inventory settings updated for "${configProduct.name}".`)
      setConfigProduct(null)
      const low = await getLowStockProducts()
      setLowStockList(low || [])
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update inventory configuration.'
      setErrorMsg(msg)
    } finally {
      setConfigSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="vendor-loading-wrap">
        <Loading text="Loading store inventory records..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="vendor-inventory-root">
      {/* Header */}
      <div className="v-page-header">
        <div className="v-header-info">
          <div className="v-header-badge">
            <Boxes size={13} />
            <span>Stock Management</span>
          </div>
          <h1 className="v-page-title editorial-title-serif">Stock & Inventory</h1>
          <p className="v-page-subtitle">
            Monitor real-time fulfillment levels, adjust quantities, and configure low-stock safety thresholds.
          </p>
        </div>

        <div className="v-header-actions">
          <button
            type="button"
            className="v-btn-secondary"
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh inventory counts"
          >
            <RefreshCw size={15} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {feedbackMsg && (
        <div className="v-alert alert-success">
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
          <button type="button" className="alert-dismiss" onClick={() => setFeedbackMsg(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="v-alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
          <button type="button" className="alert-dismiss" onClick={() => setErrorMsg(null)}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Low Stock Warning Box */}
      {lowStockList.length > 0 && (
        <div className="inventory-warning-card">
          <div className="warning-card-head">
            <AlertTriangle size={20} className="warning-icon" />
            <div>
              <h3 className="warning-title">Low Stock Alert ({lowStockList.length} items)</h3>
              <p className="warning-desc">
                These items are currently at or below their low-stock threshold. Restock promptly to avoid stockouts.
              </p>
            </div>
          </div>

          <div className="warning-table-wrap">
            <table className="warning-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th style={{ textAlign: 'right' }}>Quick Restock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockList.map((item) => (
                  <tr key={item.inventoryId}>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>
                    <td>
                      <span className="qty-danger">{item.quantity} units</span>
                    </td>
                    <td>
                      <span className="threshold-pill">≤ {item.lowStockThreshold} units</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="quick-restock-btn"
                        onClick={() => handleQuickIncrease(item.productId, 10)}
                        disabled={actionLoadingId === item.productId}
                      >
                        +10 Units
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Catalog Inventory Table */}
      <div className="v-table-card">
        <div className="inv-table-header">
          <div>
            <h2 className="table-card-title">All Catalog Items</h2>
            <p className="table-card-subtitle">Active and paused products with live stock quantities</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="v-empty-box">
            <Boxes size={44} strokeWidth={1.2} />
            <h3>No products found</h3>
            <p>Upload your first product to start tracking inventory and fulfillment.</p>
            <Link to="/vendor/products/new">
              <Button variant="primary">Upload Product</Button>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="v-data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock Level</th>
                  <th>Fulfillment Status</th>
                  <th>Threshold</th>
                  <th style={{ textAlign: 'right' }}>Adjust Quantity</th>
                  <th style={{ textAlign: 'right' }}>Configure</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const inv = inventories[product.id]
                  const quantity = inv ? inv.quantity : 0
                  const threshold = inv ? inv.lowStockThreshold : 5
                  const isLow = inv ? inv.lowStock : quantity <= threshold
                  const inStock = quantity > 0
                  const isBusy = actionLoadingId === product.id

                  return (
                    <tr key={product.id}>
                      {/* Product Name */}
                      <td>
                        <div className="v-product-cell">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="v-product-thumb"
                            loading="lazy"
                          />
                          <div className="v-product-details">
                            <span className="v-product-title">{product.name}</span>
                            <span className="v-product-sku">
                              Dept: {product.categoryName || 'General'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td>
                        <div className="stock-level-cell">
                          <span
                            className={`stock-quantity-number ${
                              !inStock ? 'qty-out' : isLow ? 'qty-low' : 'qty-ok'
                            }`}
                          >
                            {quantity}
                          </span>
                          <span className="stock-unit-label">units</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        {!inStock ? (
                          <span className="inv-badge badge-out">Out of Stock</span>
                        ) : isLow ? (
                          <span className="inv-badge badge-low">Low Stock</span>
                        ) : (
                          <span className="inv-badge badge-healthy">In Stock</span>
                        )}
                      </td>

                      {/* Threshold */}
                      <td>
                        <span className="threshold-text">Alerts at ≤ {threshold}</span>
                      </td>

                      {/* Adjust Quantity Buttons */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="qty-controls-row">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => handleQuickDecrease(product.id, 1)}
                            disabled={isBusy || quantity <= 0}
                            title="Decrease by 1"
                          >
                            <Minus size={13} />
                          </button>

                          <button
                            type="button"
                            className="qty-btn qty-btn-plus"
                            onClick={() => handleQuickIncrease(product.id, 5)}
                            disabled={isBusy}
                            title="Add 5 units"
                          >
                            +5
                          </button>

                          <button
                            type="button"
                            className="qty-btn qty-btn-plus"
                            onClick={() => handleQuickIncrease(product.id, 10)}
                            disabled={isBusy}
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Configure Button */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="v-action-btn"
                          onClick={() => openConfigModal(product)}
                          title="Configure exact stock & threshold limit"
                        >
                          <Sliders size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configure Inventory Modal */}
      {configProduct && (
        <div className="v-modal-overlay" onClick={() => setConfigProduct(null)}>
          <div className="v-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-header">
              <div className="modal-title-wrap">
                <Sliders size={18} />
                <h3>Configure Inventory</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setConfigProduct(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="v-modal-body">
              <p className="modal-product-name">
                Product: <strong>{configProduct.name}</strong>
              </p>

              <div className="form-field-group">
                <label htmlFor="exactQuantity" className="form-field-label">
                  Total Units in Stock
                </label>
                <input
                  id="exactQuantity"
                  type="number"
                  min="0"
                  value={configQuantity}
                  onChange={(e) => setConfigQuantity(e.target.value)}
                  className="form-field-input"
                  required
                  disabled={configSubmitting}
                />
              </div>

              <div className="form-field-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="exactThreshold" className="form-field-label">
                  Low Stock Alert Threshold
                </label>
                <input
                  id="exactThreshold"
                  type="number"
                  min="0"
                  value={configThreshold}
                  onChange={(e) => setConfigThreshold(e.target.value)}
                  className="form-field-input"
                  required
                  disabled={configSubmitting}
                />
                <span className="field-helper-text">
                  You will receive alert badges when stock falls to this count or below.
                </span>
              </div>

              <div className="modal-actions-row">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={configSubmitting}
                  icon={configSubmitting ? Loader2 : CheckCircle2}
                >
                  {configSubmitting ? 'Saving...' : 'Save Inventory'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfigProduct(null)}
                  disabled={configSubmitting}
                >
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

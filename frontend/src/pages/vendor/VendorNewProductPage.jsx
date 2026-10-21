import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Upload,
  Package,
  Layers,
  Boxes,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  Loader2,
  Sparkles,
  ShoppingBag,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { createVendorProduct, setVendorInventory, getActiveCategories } from '../../api/vendorApi'
import { getProductImage } from '../../utils/productImages'
import Button from '../../components/common/Button'
import './VendorNewProductPage.css'

export default function VendorNewProductPage() {
  const navigate = useNavigate()

  // Categories list
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    initialStock: '20',
    lowStockThreshold: '5',
    description: '',
  })

  // Photo upload state
  const [productPhoto, setProductPhoto] = useState(null)
  const [photoFileName, setPhotoFileName] = useState('')
  const [photoUploadMode, setPhotoUploadMode] = useState('file') // 'file' | 'url'
  const [photoUrlInput, setPhotoUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Errors & Status
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [createdProduct, setCreatedProduct] = useState(null)

  // Load Active Categories
  useEffect(() => {
    let isMounted = true
    const fetchCats = async () => {
      try {
        const cats = await getActiveCategories()
        if (isMounted && Array.isArray(cats)) {
          setCategories(cats)
          if (cats.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: String(cats[0].id) }))
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiError('Unable to load categories. Please check your connection.')
        }
      } finally {
        if (isMounted) setLoadingCategories(false)
      }
    }
    fetchCats()
    return () => {
      isMounted = false
    }
  }, [])

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (apiError) setApiError(null)
  }

  // File Upload Handlers
  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'Please upload an image file (JPEG, PNG, WEBP)' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Image size must be less than 5MB' }))
      return
    }
    setPhotoFileName(file.name)
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.photo
      return copy
    })
    const reader = new FileReader()
    reader.onload = (uploadEvent) => {
      setProductPhoto(uploadEvent.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFileSelect(file)
  }

  const handleApplyUrl = () => {
    if (photoUrlInput.trim()) {
      setProductPhoto(photoUrlInput.trim())
      setPhotoFileName('External Web Photo')
    }
  }

  const handleRemovePhoto = () => {
    setProductPhoto(null)
    setPhotoFileName('')
    setPhotoUrlInput('')
  }

  // Selected category object
  const selectedCategory = categories.find((c) => String(c.id) === String(formData.categoryId))

  // Live preview image (uploaded photo takes precedence)
  const previewImage =
    productPhoto ||
    getProductImage({
      name: formData.name || 'Product',
      categoryName: selectedCategory?.name || '',
    })

  // Validate inputs
  const validate = () => {
    const errs = {}

    if (!formData.name.trim()) {
      errs.name = 'Product name is required'
    } else if (formData.name.trim().length > 150) {
      errs.name = 'Product name must not exceed 150 characters'
    }

    if (!formData.categoryId) {
      errs.categoryId = 'Please select a category'
    }

    const priceNum = parseFloat(formData.price)
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errs.price = 'Price must be greater than ₹0.00'
    }

    const stockNum = parseInt(formData.initialStock, 10)
    if (formData.initialStock === '' || isNaN(stockNum) || stockNum < 0) {
      errs.initialStock = 'Initial stock cannot be negative'
    }

    const thresholdNum = parseInt(formData.lowStockThreshold, 10)
    if (formData.lowStockThreshold === '' || isNaN(thresholdNum) || thresholdNum < 0) {
      errs.lowStockThreshold = 'Threshold cannot be negative'
    }

    if (formData.description && formData.description.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    if (!validate()) return

    setSubmitting(true)

    try {
      // 1. Create Product in backend
      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        categoryId: Number(formData.categoryId),
      }

      const newProduct = await createVendorProduct(productPayload)

      // 2. Set Initial Inventory (quantity & threshold)
      const stockQty = parseInt(formData.initialStock, 10) || 0
      const threshold = parseInt(formData.lowStockThreshold, 10) || 5

      try {
        await setVendorInventory(newProduct.id, {
          quantity: stockQty,
          lowStockThreshold: threshold,
        })
      } catch (invErr) {
        console.warn('Initial inventory setup failed, product created with default stock:', invErr)
      }

      // 3. Save custom product photo to local storage registry
      if (productPhoto) {
        try {
          const registry = JSON.parse(
            localStorage.getItem('vendor_uploaded_product_images') || '{}'
          )
          if (newProduct?.id) registry[newProduct.id] = productPhoto
          if (newProduct?.name) registry[newProduct.name.trim().toLowerCase()] = productPhoto
          localStorage.setItem('vendor_uploaded_product_images', JSON.stringify(registry))
        } catch (e) {
          console.warn('Could not save photo to registry', e)
        }
      }

      setCreatedProduct(newProduct)
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error
        setApiError(msg || 'Failed to create product. Please verify the information.')
      } else {
        setApiError('Unable to connect to the server. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setCreatedProduct(null)
    setProductPhoto(null)
    setPhotoFileName('')
    setPhotoUrlInput('')
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      price: '',
      initialStock: '20',
      lowStockThreshold: '5',
      description: '',
    })
    setErrors({})
    setApiError(null)
  }

  return (
    <div className="upload-page-root">
      {/* Header */}
      <div className="upload-page-header">
        <div className="upload-header-meta">
          <div className="upload-badge-pill">
            <Upload size={12} />
            <span>Marketplace Catalog</span>
          </div>
          <h1 className="upload-page-title editorial-title-serif">Upload New Product</h1>
          <p className="upload-page-subtitle">
            Publish products directly to the NIVORA marketplace. All products are verified and instantly available for customer purchase.
          </p>
        </div>

        <Link to="/vendor/products" className="upload-back-link">
          <span>View All Products</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Success View */}
      {createdProduct ? (
        <div className="upload-success-card">
          <div className="success-icon-badge">
            <CheckCircle2 size={36} color="var(--success, #22c55e)" />
          </div>

          <h2 className="success-heading">Product Published Successfully!</h2>
          <p className="success-subtext">
            <strong>{createdProduct.name}</strong> is now live on the marketplace. Customers can find and purchase this item in the <strong>{createdProduct.categoryName}</strong> department.
          </p>

          <div className="published-summary-box">
            <div className="summary-col">
              <span className="summary-label">Catalog ID</span>
              <span className="summary-value">#{createdProduct.id}</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Unit Price</span>
              <span className="summary-value">
                ₹{Number(createdProduct.price).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Stock Added</span>
              <span className="summary-value">{formData.initialStock} units</span>
            </div>
            <div className="summary-col">
              <span className="summary-label">Status</span>
              <span className="summary-value status-live">Live in Store</span>
            </div>
          </div>

          <div className="success-action-buttons">
            <Link to={`/products/${createdProduct.id}`} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" icon={Eye} iconPosition="left">
                View in Customer Storefront
              </Button>
            </Link>

            <Button variant="secondary" onClick={handleResetForm}>
              Upload Another Product
            </Button>

            <Link to="/vendor/products">
              <Button variant="outline">
                Back to My Products
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Two-Column Layout: Form & Live Editorial Preview */
        <div className="upload-grid-layout">
          {/* LEFT: Product Form */}
          <div className="upload-form-panel">
            {apiError && (
              <div className="upload-error-banner">
                <AlertCircle size={18} />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="upload-form" noValidate>
              {/* Product Title */}
              <div className="form-field-group">
                <label htmlFor="productName" className="form-field-label">
                  Product Title / Name <span className="required-star">*</span>
                </label>
                <input
                  id="productName"
                  name="name"
                  type="text"
                  maxLength={150}
                  placeholder="e.g. Wireless Ergonomic Mechanical Keyboard"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-field-input ${errors.name ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                <div className="field-hint-row">
                  {errors.name ? (
                    <span className="field-error-text">{errors.name}</span>
                  ) : (
                    <span className="field-helper-text">Descriptive name that appears in search and listings.</span>
                  )}
                  <span className="char-counter">{formData.name.length}/150</span>
                </div>
              </div>

              {/* Category & Price Row */}
              <div className="form-row-2">
                {/* Category Dropdown */}
                <div className="form-field-group">
                  <label htmlFor="categoryId" className="form-field-label">
                    Department Category <span className="required-star">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`form-field-input ${errors.categoryId ? 'field-error' : ''}`}
                    disabled={submitting || loadingCategories}
                  >
                    {loadingCategories ? (
                      <option value="">Loading categories...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.categoryId && (
                    <span className="field-error-text">{errors.categoryId}</span>
                  )}
                </div>

                {/* Price */}
                <div className="form-field-group">
                  <label htmlFor="productPrice" className="form-field-label">
                    Retail Price (₹ INR) <span className="required-star">*</span>
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">₹</span>
                    <input
                      id="productPrice"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="1999.00"
                      value={formData.price}
                      onChange={handleChange}
                      className={`form-field-input input-with-prefix ${errors.price ? 'field-error' : ''}`}
                      disabled={submitting}
                    />
                  </div>
                  {errors.price && (
                    <span className="field-error-text">{errors.price}</span>
                  )}
                </div>
              </div>

              {/* Product Photography Upload Section */}
              <div className="form-field-group">
                <div className="field-label-row">
                  <label className="form-field-label">
                    Product Photography & Visual Asset
                  </label>
                  <div className="photo-mode-tabs">
                    <button
                      type="button"
                      className={`photo-tab-btn ${photoUploadMode === 'file' ? 'active' : ''}`}
                      onClick={() => setPhotoUploadMode('file')}
                    >
                      <Camera size={13} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      className={`photo-tab-btn ${photoUploadMode === 'url' ? 'active' : ''}`}
                      onClick={() => setPhotoUploadMode('url')}
                    >
                      <span>Web URL</span>
                    </button>
                  </div>
                </div>

                {photoUploadMode === 'file' ? (
                  productPhoto && !photoUrlInput ? (
                    <div className="uploaded-photo-preview-card">
                      <div className="photo-thumb-wrap">
                        <img src={productPhoto} alt="Product Upload Preview" className="photo-thumb-img" />
                      </div>
                      <div className="photo-thumb-meta">
                        <span className="photo-thumb-name">{photoFileName || 'Custom Product Photo'}</span>
                        <span className="photo-thumb-badge">✓ Active Storefront Asset</span>
                      </div>
                      <button
                        type="button"
                        className="photo-remove-btn"
                        onClick={handleRemovePhoto}
                        title="Remove photo"
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`photo-drop-zone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="drop-zone-icon">
                        <ImageIcon size={32} strokeWidth={1.5} />
                      </div>
                      <p className="drop-zone-title">
                        Drag and drop product photo, or{' '}
                        <label htmlFor="productPhotoInput" className="drop-browse-label">
                          browse files
                        </label>
                      </p>
                      <span className="drop-zone-hint">
                        PNG, JPG, WEBP • Max 5MB • Instant Storefront Preview
                      </span>
                      <input
                        id="productPhotoInput"
                        type="file"
                        accept="image/*"
                        className="hidden-file-input"
                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                        disabled={submitting}
                      />
                    </div>
                  )
                ) : (
                  <div className="photo-url-input-wrap">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or direct image URL"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="form-field-input"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="photo-apply-url-btn"
                      onClick={handleApplyUrl}
                    >
                      Apply Photo
                    </button>
                  </div>
                )}

                {errors.photo && <span className="field-error-text">{errors.photo}</span>}
                <span className="field-helper-text">
                  Your uploaded image displays in the Live Storefront Preview and appears on the customer catalog upon publishing.
                </span>
              </div>

              {/* Inventory Setup Row: Initial Stock & Low Stock Threshold */}
              <div className="form-row-2">
                <div className="form-field-group">
                  <label htmlFor="initialStock" className="form-field-label">
                    Initial Stock Units <span className="required-star">*</span>
                  </label>
                  <input
                    id="initialStock"
                    name="initialStock"
                    type="number"
                    min="0"
                    placeholder="20"
                    value={formData.initialStock}
                    onChange={handleChange}
                    className={`form-field-input ${errors.initialStock ? 'field-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.initialStock ? (
                    <span className="field-error-text">{errors.initialStock}</span>
                  ) : (
                    <span className="field-helper-text">Available units ready to ship.</span>
                  )}
                </div>

                <div className="form-field-group">
                  <label htmlFor="lowStockThreshold" className="form-field-label">
                    Low Stock Alert Alert Limit <span className="required-star">*</span>
                  </label>
                  <input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    placeholder="5"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    className={`form-field-input ${errors.lowStockThreshold ? 'field-error' : ''}`}
                    disabled={submitting}
                  />
                  {errors.lowStockThreshold ? (
                    <span className="field-error-text">{errors.lowStockThreshold}</span>
                  ) : (
                    <span className="field-helper-text">Alerts triggered when stock reaches this count.</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-field-group">
                <label htmlFor="productDesc" className="form-field-label">
                  Product Description
                </label>
                <textarea
                  id="productDesc"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  placeholder="Detail key materials, dimensions, warranty, and craftsmanship highlights..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-field-input form-field-textarea ${errors.description ? 'field-error' : ''}`}
                  disabled={submitting}
                />
                <div className="field-hint-row">
                  {errors.description ? (
                    <span className="field-error-text">{errors.description}</span>
                  ) : (
                    <span className="field-helper-text">Helps buyers understand specifications and features.</span>
                  )}
                  <span className="char-counter">{formData.description.length}/1000</span>
                </div>
              </div>

              {/* Submit Row */}
              <div className="upload-submit-row">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  icon={submitting ? Loader2 : Upload}
                  iconPosition="right"
                >
                  {submitting ? 'Publishing to Marketplace...' : 'Publish Product to Store'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/vendor/products')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Storefront Card Preview */}
          <div className="upload-preview-panel">
            <div className="preview-sticky-wrap">
              <div className="preview-header">
                <div className="preview-badge">
                  <Sparkles size={12} />
                  <span>Customer Storefront Preview</span>
                </div>
                <span className="preview-hint">Live Buyer Perspective</span>
              </div>

              {/* Product Preview Card */}
              <div className="store-product-preview-card">
                <div className="preview-image-wrap">
                  <img
                    src={previewImage}
                    alt={formData.name || 'Product Preview'}
                    className="preview-img"
                  />
                  <div className="preview-category-pill">
                    {selectedCategory?.name || 'Department'}
                  </div>
                  {formData.initialStock && parseInt(formData.initialStock, 10) <= 0 ? (
                    <div className="preview-stock-badge badge-out">Out of Stock</div>
                  ) : (
                    <div className="preview-stock-badge badge-in">In Stock</div>
                  )}
                </div>

                <div className="preview-card-body">
                  <span className="preview-brand-tag">NIVORA CURATED</span>
                  <h3 className="preview-product-title">
                    {formData.name.trim() || 'Untitled Product'}
                  </h3>

                  <p className="preview-product-desc">
                    {formData.description.trim() ||
                      'Product description and buyer specifications will be rendered here.'}
                  </p>

                  <div className="preview-card-footer">
                    <div className="preview-price-block">
                      <span className="preview-price-label">Price</span>
                      <span className="preview-price-value">
                        ₹{formData.price
                          ? Number(formData.price).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '0.00'}
                      </span>
                    </div>

                    <button type="button" className="mock-cart-btn" disabled tabIndex={-1}>
                      <ShoppingBag size={14} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="preview-note-box">
                <p>
                  {productPhoto ? (
                    <>
                      <strong>Custom Photo Active:</strong> Your uploaded product photograph will be presented to buyers across catalog listings, search, and detail pages.
                    </>
                  ) : (
                    <>
                      <strong>Automated Curated Imagery:</strong> Upload a custom photo above, or NIVORA will automatically pair high-resolution editorial photography matching your category and keywords.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

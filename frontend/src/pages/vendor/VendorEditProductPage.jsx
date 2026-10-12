import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Edit,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ShoppingBag,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react'
import { getVendorProductById, updateVendorProduct, getActiveCategories } from '../../api/vendorApi'
import { getProductImage } from '../../utils/productImages'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import './VendorNewProductPage.css' // Reuses the upload page grid and form styling

export default function VendorEditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  // Photo state
  const [productPhoto, setProductPhoto] = useState(() => {
    try {
      const reg = JSON.parse(localStorage.getItem('vendor_uploaded_product_images') || '{}')
      return reg[id] || null
    } catch {
      return null
    }
  })
  const [photoFileName, setPhotoFileName] = useState('')
  const [photoUploadMode, setPhotoUploadMode] = useState('file')
  const [photoUrlInput, setPhotoUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [cats, product] = await Promise.all([
          getActiveCategories(),
          getVendorProductById(id),
        ])

        if (isMounted) {
          setCategories(cats || [])
          setFormData({
            name: product.name || '',
            categoryId: String(product.categoryId || ''),
            price: product.price ? String(product.price) : '',
            description: product.description || '',
          })
        }
      } catch (err) {
        if (isMounted) {
          setError('Product not found or unable to load details.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (error) setError(null)
  }

  // File Upload Handlers
  const handleFileSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({ ...prev, photo: 'Please upload an image file (JPEG, PNG, WEBP)' }))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, photo: 'Image size must be less than 5MB' }))
      return
    }
    setPhotoFileName(file.name)
    setFieldErrors((prev) => {
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

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.categoryId))

  const previewImage =
    productPhoto ||
    getProductImage({
      name: formData.name || 'Product',
      categoryName: selectedCategory?.name || '',
    })

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

    if (formData.description && formData.description.length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!validate()) return

    setSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        categoryId: Number(formData.categoryId),
      }

      await updateVendorProduct(id, payload)

      // Save custom photo to registry
      if (productPhoto) {
        try {
          const reg = JSON.parse(localStorage.getItem('vendor_uploaded_product_images') || '{}')
          reg[id] = productPhoto
          if (payload.name) reg[payload.name.trim().toLowerCase()] = productPhoto
          localStorage.setItem('vendor_uploaded_product_images', JSON.stringify(reg))
        } catch (e) {
          console.warn('Could not save photo to registry', e)
        }
      }

      setSuccessMsg('Product details updated successfully.')
      setTimeout(() => {
        navigate('/vendor/products')
      }, 1500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update product.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="vendor-loading-wrap">
        <Loading text="Loading product details..." fullScreen={false} />
      </div>
    )
  }

  return (
    <div className="upload-page-root">
      {/* Header */}
      <div className="upload-page-header">
        <div className="upload-header-meta">
          <div className="upload-badge-pill">
            <Edit size={12} />
            <span>Catalog Editor</span>
          </div>
          <h1 className="upload-page-title editorial-title-serif">Edit Product #{id}</h1>
          <p className="upload-page-subtitle">
            Update pricing, category assignment, and product description.
          </p>
        </div>

        <Link to="/vendor/products" className="upload-back-link">
          <ArrowLeft size={14} />
          <span>Back to Products</span>
        </Link>
      </div>

      {successMsg && (
        <div className="upload-error-banner" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.25)', color: '#16a34a' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="upload-error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="upload-grid-layout">
        {/* Form Panel */}
        <div className="upload-form-panel">
          <form onSubmit={handleSubmit} className="upload-form" noValidate>
            {/* Name */}
            <div className="form-field-group">
              <label htmlFor="editProductName" className="form-field-label">
                Product Title <span className="required-star">*</span>
              </label>
              <input
                id="editProductName"
                name="name"
                type="text"
                maxLength={150}
                value={formData.name}
                onChange={handleChange}
                className={`form-field-input ${fieldErrors.name ? 'field-error' : ''}`}
                disabled={submitting}
              />
              <div className="field-hint-row">
                {fieldErrors.name ? (
                  <span className="field-error-text">{fieldErrors.name}</span>
                ) : (
                  <span className="field-helper-text">Descriptive name for catalog listings.</span>
                )}
                <span className="char-counter">{formData.name.length}/150</span>
              </div>
            </div>

            {/* Category & Price */}
            <div className="form-row-2">
              <div className="form-field-group">
                <label htmlFor="editCategoryId" className="form-field-label">
                  Department Category <span className="required-star">*</span>
                </label>
                <select
                  id="editCategoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`form-field-input ${fieldErrors.categoryId ? 'field-error' : ''}`}
                  disabled={submitting}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoryId && (
                  <span className="field-error-text">{fieldErrors.categoryId}</span>
                )}
              </div>

              <div className="form-field-group">
                <label htmlFor="editProductPrice" className="form-field-label">
                  Retail Price (₹ INR) <span className="required-star">*</span>
                </label>
                <div className="input-prefix-wrap">
                  <span className="input-prefix">₹</span>
                  <input
                    id="editProductPrice"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className={`form-field-input input-with-prefix ${fieldErrors.price ? 'field-error' : ''}`}
                    disabled={submitting}
                  />
                </div>
                {fieldErrors.price && (
                  <span className="field-error-text">{fieldErrors.price}</span>
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
                      <label htmlFor="editProductPhotoInput" className="drop-browse-label">
                        browse files
                      </label>
                    </p>
                    <span className="drop-zone-hint">
                      PNG, JPG, WEBP • Max 5MB • Instant Storefront Preview
                    </span>
                    <input
                      id="editProductPhotoInput"
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

              {fieldErrors.photo && <span className="field-error-text">{fieldErrors.photo}</span>}
              <span className="field-helper-text">
                Your uploaded image displays in the Live Storefront Preview and appears on the customer catalog upon saving.
              </span>
            </div>

            {/* Description */}
            <div className="form-field-group">
              <label htmlFor="editProductDesc" className="form-field-label">
                Product Description
              </label>
              <textarea
                id="editProductDesc"
                name="description"
                rows={5}
                maxLength={1000}
                value={formData.description}
                onChange={handleChange}
                className={`form-field-input form-field-textarea ${fieldErrors.description ? 'field-error' : ''}`}
                disabled={submitting}
              />
              <div className="field-hint-row">
                {fieldErrors.description ? (
                  <span className="field-error-text">{fieldErrors.description}</span>
                ) : (
                  <span className="field-helper-text">Product description and specs.</span>
                )}
                <span className="char-counter">{formData.description.length}/1000</span>
              </div>
            </div>

            {/* Submit */}
            <div className="upload-submit-row">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                icon={submitting ? Loader2 : Save}
                iconPosition="right"
              >
                {submitting ? 'Saving Changes...' : 'Save Changes'}
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

        {/* Live Preview Panel */}
        <div className="upload-preview-panel">
          <div className="preview-sticky-wrap">
            <div className="preview-header">
              <div className="preview-badge">
                <Sparkles size={12} />
                <span>Customer Storefront Preview</span>
              </div>
              <span className="preview-hint">Live Buyer Perspective</span>
            </div>

            <div className="store-product-preview-card">
              <div className="preview-image-wrap">
                <img
                  src={previewImage}
                  alt={formData.name || 'Product'}
                  className="preview-img"
                />
                <div className="preview-category-pill">
                  {selectedCategory?.name || 'Department'}
                </div>
              </div>

              <div className="preview-card-body">
                <span className="preview-brand-tag">NIVORA CURATED</span>
                <h3 className="preview-product-title">
                  {formData.name.trim() || 'Untitled Product'}
                </h3>

                <p className="preview-product-desc">
                  {formData.description.trim() || 'Product description will appear here.'}
                </p>

                <div className="preview-card-footer">
                  <div className="preview-price-block">
                    <span className="preview-price-label">Price</span>
                    <span className="preview-price-value">
                      ₹{formData.price ? Number(formData.price).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) : '0.00'}
                    </span>
                  </div>

                  <button type="button" className="mock-cart-btn" disabled tabIndex={-1}>
                    <ShoppingBag size={14} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Info,
  Star,
  ThumbsUp,
  Camera,
  Image as ImageIcon,
  Trash2,
  MessageSquare,
  Award,
  X,
  Upload,
} from 'lucide-react'
import { getProductById, getProductInventory, getProductsByCategory, getAllProducts } from '../api/productApi'
import { getProductImage } from '../utils/productImages'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/useAuth'
import ProductCard from '../components/ecommerce/ProductCard'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import './ProductDetailPage.css'

export default function ProductDetailPage() {
  const { productId } = useParams()

  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)
  const [selectedQty, setSelectedQty] = useState(1)

  const { user } = useAuth()

  // Real Customer Reviews & Feedback (Zero dummy reviews)
  const storageKey = `ecommerce_product_reviews_${productId}`
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return []
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed)
        ? parsed.filter((r) => r.id !== 'rev-1' && r.id !== 'rev-2')
        : []
    } catch {
      return []
    }
  })

  // Similar Category Products State
  const [similarProducts, setSimilarProducts] = useState([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)

  // Scroll to top and reload reviews whenever product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    try {
      const saved = localStorage.getItem(`ecommerce_product_reviews_${productId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((r) => r.id !== 'rev-1' && r.id !== 'rev-2')
          : []
        setReviews(cleaned)
      } else {
        setReviews([])
      }
    } catch {
      setReviews([])
    }
  }, [productId])

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewAuthor, setReviewAuthor] = useState(() => {
    if (user?.firstName) return `${user.firstName} ${user.lastName || ''}`.trim()
    return user?.name || ''
  })
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [reviewPhoto, setReviewPhoto] = useState(null)
  const [reviewPhotoName, setReviewPhotoName] = useState('')
  const [reviewFormError, setReviewFormError] = useState(null)
  const [reviewSuccessNotice, setReviewSuccessNotice] = useState(null)
  const [lightboxImg, setLightboxImg] = useState(null)

  const handleReviewPhotoSelect = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setReviewFormError('Please select a valid image file (JPEG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setReviewFormError('Image size must be less than 5MB')
      return
    }
    setReviewPhotoName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      setReviewPhoto(e.target.result)
      setReviewFormError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleStarClickToRate = (starVal) => {
    setReviewRating(starVal)
    setShowReviewForm(true)
    setTimeout(() => {
      const el = document.getElementById('review-form-anchor')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!reviewAuthor.trim()) {
      setReviewFormError('Please enter your name')
      return
    }
    if (!reviewComment.trim()) {
      setReviewFormError('Please write your review feedback')
      return
    }

    const newRev = {
      id: 'rev-' + Date.now(),
      author: reviewAuthor.trim(),
      verified: true,
      rating: Number(reviewRating),
      date: 'Just now',
      title: reviewTitle.trim() || `${reviewRating} Star Verified Review`,
      comment: reviewComment.trim(),
      photo: reviewPhoto,
      helpful: 0,
    }

    const updated = [newRev, ...reviews]
    setReviews(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
      const globalRatings = JSON.parse(localStorage.getItem('ecommerce_product_ratings') || '{}')
      const avg = (updated.reduce((sum, r) => sum + Number(r.rating || 5), 0) / updated.length).toFixed(1)
      globalRatings[productId] = { rating: Number(avg), count: updated.length }
      localStorage.setItem('ecommerce_product_ratings', JSON.stringify(globalRatings))
    } catch (err) {
      console.error('Failed to save review', err)
    }

    setReviewSuccessNotice('Thank you! Your verified rating and review have been published.')
    setShowReviewForm(false)
    setReviewTitle('')
    setReviewComment('')
    setReviewPhoto(null)
    setReviewPhotoName('')
    setReviewRating(5)
    setTimeout(() => setReviewSuccessNotice(null), 4000)
  }

  const handleHelpful = (id) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, helpful: (r.helpful || 0) + 1 } : r))
    setReviews(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch (err) {
      console.error(err)
    }
  }

  const hasReviews = reviews.length > 0
  const averageRating = hasReviews
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : '0.0'

  const starRatingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(Number(r.rating)) === star).length,
    percentage:
      hasReviews
        ? Math.round(
            (reviews.filter((r) => Math.round(Number(r.rating)) === star).length / reviews.length) *
              100
          )
        : 0,
  }))

  useEffect(() => {
    let isMounted = true

    const loadProductAndStock = async () => {
      try {
        setLoading(true)
        setError(null)

        // Real Spring Boot endpoints: GET /api/products/{id} & GET /api/inventory/product/{id}
        const [prodData, invData] = await Promise.all([
          getProductById(productId),
          getProductInventory(productId).catch(() => null),
        ])

        if (isMounted) {
          setProduct(prodData)
          setInventory(invData)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Product not found or currently unavailable in the catalog.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (productId) {
      loadProductAndStock()
    }

    return () => {
      isMounted = false
    }
  }, [productId])

  // Load Similar Products in the Same Category (Meesho / Myntra style)
  useEffect(() => {
    let isMounted = true

    const loadSimilar = async () => {
      if (!product?.categoryId) return
      try {
        setLoadingSimilar(true)
        let prods = []
        try {
          prods = await getProductsByCategory(product.categoryId)
        } catch {
          const all = await getAllProducts()
          prods = (all || []).filter((p) => String(p.categoryId) === String(product.categoryId))
        }

        if (isMounted) {
          const filtered = (prods || []).filter((p) => String(p.id) !== String(productId))
          setSimilarProducts(filtered)
        }
      } catch (err) {
        console.warn('Failed to load category products', err)
      } finally {
        if (isMounted) setLoadingSimilar(false)
      }
    }

    loadSimilar()

    return () => {
      isMounted = false
    }
  }, [product?.categoryId, productId])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, selectedQty)
    setActionNotice({
      type: 'cart',
      text: `${selectedQty} ${selectedQty === 1 ? 'item' : 'items'} added to your shopping bag.`,
    })
    setTimeout(() => setActionNotice(null), 3000)
  }

  const isWishlisted = product ? isInWishlist(product.id) : false

  const handleAddToWishlist = () => {
    if (!product) return
    const added = toggleWishlist(product)
    setActionNotice({
      type: 'wishlist',
      text: added
        ? 'Item saved to your wishlist.'
        : 'Item removed from your wishlist.',
      link: added ? '/customer/wishlist' : null,
      linkText: added ? 'View Wishlist' : null,
    })
    setTimeout(() => setActionNotice(null), 3500)
  }

  if (loading) {
    return (
      <div className="product-detail-page container" style={{ padding: '5rem 1.5rem', minHeight: '60vh' }}>
        <Loading text="Loading product details..." fullScreen={false} />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', marginBottom: '1rem' }}>
          Product Not Found
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          {error || 'The requested item could not be retrieved from the catalog.'}
        </p>
        <Link to="/products">
          <Button variant="primary" icon={ArrowLeft} iconPosition="left">
            Return to Marketplace
          </Button>
        </Link>
      </div>
    )
  }

  const formattedPrice =
    typeof product.price === 'number' || typeof product.price === 'string'
      ? `₹${Number(product.price).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '—'

  const placeholderImg = getProductImage(product)

  // Stock status determination
  const inStock = inventory ? inventory.inStock : product.active
  const isLowStock = inventory?.lowStock
  const quantity = inventory?.quantity

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-link">Shop</Link>
          <span className="breadcrumb-separator">/</span>
          {product.categoryName && (
            <>
              <Link
                to={`/products?category=${product.categoryId}`}
                className="breadcrumb-link"
              >
                {product.categoryName}
              </Link>
              <span className="breadcrumb-separator">/</span>
            </>
          )}
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div
            className="dashboard-alert"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: 'var(--color-text-primary)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Info size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem' }}>{actionNotice.text}</span>
            </div>
            {actionNotice.link && (
              <Link
                to={actionNotice.link}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                {actionNotice.linkText} →
              </Link>
            )}
          </div>
        )}

        {/* Product Hero Grid */}
        <div className="detail-hero-grid">
          {/* Media Column */}
          <div className="detail-media-col">
            <div className="detail-image-frame">
              <img
                src={placeholderImg}
                alt={product.name}
                className="detail-product-img"
              />
              <span className="detail-id-tag">SKU #{product.id}</span>
            </div>
          </div>

          {/* Details & Purchase Column */}
          <div className="detail-info-col">
            {/* Category Tag */}
            <div className="detail-category-row">
              <span className="detail-category-badge">
                {product.categoryName || 'Catalog'}
              </span>
              {product.vendorName && (
                <span className="detail-vendor-badge">
                  <Building2 size={13} />
                  <span>Vendor: {product.vendorName}</span>
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="detail-product-title">{product.name}</h1>

            {/* Product Rating Badge (Myntra / Meesho style) */}
            <div className="detail-header-rating-row">
              {hasReviews ? (
                <button
                  type="button"
                  className="product-rating-pill-badge"
                  onClick={() => {
                    const el = document.getElementById('customer-reviews-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  title="View Customer Ratings & Reviews"
                >
                  <span className="rating-badge-score">{averageRating}</span>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span className="rating-badge-sep">|</span>
                  <span className="rating-badge-reviews">
                    {reviews.length} {reviews.length === 1 ? 'Rating' : 'Ratings'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="product-rating-pill-badge unrated"
                  onClick={() => {
                    const el = document.getElementById('customer-reviews-section')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                    setShowReviewForm(true)
                  }}
                  title="Be the first to rate this product"
                >
                  <div className="unrated-stars-wrap">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} color="var(--color-accent, #d4af37)" />
                    ))}
                  </div>
                  <span className="rating-badge-reviews">Be the first to rate & review</span>
                </button>
              )}
            </div>

            {/* Price Row */}
            <div className="detail-price-row">
              <span className="detail-price-amount">{formattedPrice}</span>
              <span className="detail-tax-inclusive">Tax Included</span>
            </div>

            {/* Stock Availability Badge */}
            <div className="detail-stock-row">
              {inStock ? (
                isLowStock ? (
                  <div className="stock-pill stock-low">
                    <AlertTriangle size={15} />
                    <span>Low Stock: Only {quantity} units remaining</span>
                  </div>
                ) : (
                  <div className="stock-pill stock-available">
                    <CheckCircle2 size={15} />
                    <span>In Stock {quantity ? `(${quantity} units available)` : ''}</span>
                  </div>
                )
              ) : (
                <div className="stock-pill stock-out">
                  <XCircle size={15} />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="detail-description-box">
              <h2 className="detail-subheading">Description</h2>
              <p className="detail-description-text">
                {product.description || 'No detailed description provided by the merchant.'}
              </p>
            </div>

            {/* Purchase & Wishlist Actions */}
            <div className="detail-actions-row">
              {inStock && (
                <div className="detail-qty-selector">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    disabled={selectedQty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{selectedQty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setSelectedQty((q) => Math.min(quantity || 99, q + 1))}
                    disabled={quantity !== undefined && selectedQty >= quantity}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={ShoppingBag}
                iconPosition="left"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                Add to Cart
              </Button>

              <Button
                variant={isWishlisted ? 'secondary' : 'outline'}
                size="lg"
                icon={Heart}
                iconPosition="left"
                onClick={handleAddToWishlist}
                title={isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                style={isWishlisted ? { color: '#ef4444', borderColor: '#ef4444' } : {}}
              >
                {isWishlisted ? 'Saved in Wishlist' : 'Wishlist'}
              </Button>
            </div>

            {/* Service & Assurance Badges */}
            <div className="detail-assurance-list">
              <div className="assurance-item">
                <Truck size={18} className="assurance-icon" />
                <div>
                  <span className="assurance-title">Complimentary Worldwide Dispatch</span>
                  <span className="assurance-desc">On orders exceeding ₹999</span>
                </div>
              </div>

              <div className="assurance-item">
                <ShieldCheck size={18} className="assurance-icon" />
                <div>
                  <span className="assurance-title">Verified Secure Checkout</span>
                  <span className="assurance-desc">256-bit encrypted SSL transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback Section */}
        <section className="product-reviews-section" id="customer-reviews-section">
          <div className="reviews-section-header">
            <div>
              <div className="reviews-section-badge">
                <Award size={13} />
                <span>Verified Buyer Feedback</span>
              </div>
              <h2 className="reviews-section-title">Customer Ratings & Reviews</h2>
              <p className="reviews-section-subtitle">
                Authentic experiences and photo feedback shared by verified purchasers of this item.
              </p>
            </div>

            <Button
              variant={showReviewForm ? 'outline' : 'primary'}
              icon={showReviewForm ? X : MessageSquare}
              iconPosition="left"
              onClick={() => {
                setShowReviewForm((prev) => !prev)
                setReviewFormError(null)
              }}
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </div>

          {/* Success Notice */}
          {reviewSuccessNotice && (
            <div className="review-alert-success">
              <CheckCircle2 size={18} />
              <span>{reviewSuccessNotice}</span>
            </div>
          )}

          {/* Overall Rating & Breakdown Scorecard / Interactive Empty State */}
          {hasReviews ? (
            <div className="reviews-scorecard-grid">
              <div className="reviews-overall-score">
                <span className="overall-score-number">{averageRating}</span>
                <div className="overall-stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      fill={star <= Math.round(Number(averageRating)) ? '#f59e0b' : 'none'}
                      color={star <= Math.round(Number(averageRating)) ? '#f59e0b' : '#64748b'}
                    />
                  ))}
                </div>
                <span className="overall-count-label">
                  Based on {reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}
                </span>

                <div className="quick-rate-mini-prompt">
                  <span className="quick-rate-mini-title">Rate this product:</span>
                  <div className="quick-rate-mini-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="quick-star-btn"
                        onClick={() => handleStarClickToRate(star)}
                        title={`Click to rate ${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star size={18} fill="none" color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="reviews-breakdown-bars">
                {starRatingCounts.map(({ star, count, percentage }) => (
                  <div key={star} className="breakdown-bar-row">
                    <span className="breakdown-star-label">{star} ★</span>
                    <div className="breakdown-track">
                      <div className="breakdown-fill" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="breakdown-count-val">
                      {count} ({percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="reviews-empty-invite-card">
              <div className="empty-invite-icon-wrap">
                <Star size={34} color="var(--color-accent, #d4af37)" />
              </div>
              <div className="empty-invite-body">
                <h3 className="empty-invite-title">No Reviews Yet</h3>
                <p className="empty-invite-text">
                  Be the first customer to share your thoughts, rate this product, or upload photos.
                </p>
                <div className="quick-rate-prompt-box">
                  <span className="quick-rate-label">Click a star to rate now:</span>
                  <div className="quick-rate-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="quick-star-btn"
                        onClick={() => handleStarClickToRate(star)}
                        title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star size={24} fill="#f59e0b" color="#f59e0b" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                icon={MessageSquare}
                iconPosition="left"
                onClick={() => {
                  setShowReviewForm(true)
                  setTimeout(() => {
                    const el = document.getElementById('review-form-anchor')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
              >
                Write First Review
              </Button>
            </div>
          )}

          {/* Collapsible Write a Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="review-form-card" id="review-form-anchor">
              <h3 className="review-form-heading">Share Your Experience</h3>
              <p className="review-form-subtext">
                Your feedback helps our community make informed decisions. You can also upload photos of the product you received.
              </p>

              {reviewFormError && (
                <div className="review-form-error-banner">
                  <AlertTriangle size={16} />
                  <span>{reviewFormError}</span>
                </div>
              )}

              {/* Star Rating Selector */}
              <div className="review-input-group">
                <label className="review-input-label">
                  Your Overall Rating <span className="req-star">*</span>
                </label>
                <div className="interactive-star-selector">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = (hoverRating || reviewRating) >= starVal
                    return (
                      <button
                        type="button"
                        key={starVal}
                        className="star-pick-btn"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(starVal)}
                        title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={28}
                          fill={isFilled ? '#f59e0b' : 'none'}
                          color={isFilled ? '#f59e0b' : '#64748b'}
                        />
                      </button>
                    )
                  })}
                  <span className="rating-desc-text">
                    {(hoverRating || reviewRating) === 5 && '5/5 — Exceptional quality'}
                    {(hoverRating || reviewRating) === 4 && '4/5 — Very good & satisfied'}
                    {(hoverRating || reviewRating) === 3 && '3/5 — Average / Acceptable'}
                    {(hoverRating || reviewRating) === 2 && '2/5 — Below expectations'}
                    {(hoverRating || reviewRating) === 1 && '1/5 — Poor / Disappointed'}
                  </span>
                </div>
              </div>

              {/* Author Name & Title */}
              <div className="review-two-col">
                <div className="review-input-group">
                  <label className="review-input-label">
                    Your Name <span className="req-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="review-text-input"
                    placeholder="e.g. Gunjan Sharma"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="review-input-group">
                  <label className="review-input-label">Review Headline / Summary</label>
                  <input
                    type="text"
                    className="review-text-input"
                    placeholder="e.g. Beautiful fabric and perfect fit"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>
              </div>

              {/* Feedback Textbox */}
              <div className="review-input-group">
                <label className="review-input-label">
                  Your Detailed Feedback <span className="req-star">*</span>
                </label>
                <textarea
                  className="review-textarea"
                  rows={4}
                  maxLength={1200}
                  placeholder="Tell us what you liked or disliked about this product: material quality, fit, finish, speed of delivery, packaging, or longevity..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
                <div className="review-textarea-counter">
                  {reviewComment.length} / 1200 characters
                </div>
              </div>

              {/* Customer Photo Upload Section */}
              <div className="review-input-group">
                <label className="review-input-label">
                  Attach Product Photo (Optional)
                </label>

                {reviewPhoto ? (
                  <div className="review-photo-preview-item">
                    <img src={reviewPhoto} alt="Customer upload preview" className="review-preview-img" />
                    <div className="review-photo-info">
                      <span className="photo-title">{reviewPhotoName || 'Product Photo'}</span>
                      <span className="photo-status">✓ Photo attached</span>
                    </div>
                    <button
                      type="button"
                      className="review-photo-del-btn"
                      onClick={() => {
                        setReviewPhoto(null)
                        setReviewPhotoName('')
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div className="review-upload-dropzone">
                    <Camera size={26} className="review-upload-icon" />
                    <p className="review-upload-title">
                      Upload customer photo of the received item
                    </p>
                    <label htmlFor="reviewPhotoUpload" className="review-upload-btn-label">
                      Choose Photo
                    </label>
                    <input
                      id="reviewPhotoUpload"
                      type="file"
                      accept="image/*"
                      className="hidden-file-input"
                      onChange={(e) => handleReviewPhotoSelect(e.target.files?.[0])}
                    />
                    <span className="review-upload-hint">PNG, JPG or WEBP (Max 5MB)</span>
                  </div>
                )}
              </div>

              <div className="review-form-actions">
                <Button type="submit" variant="primary" icon={MessageSquare} iconPosition="left">
                  Submit Verified Review
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Customer Reviews Feed */}
          <div className="reviews-feed-list">
            {reviews.map((rev) => (
              <div key={rev.id} className="single-review-card">
                <div className="review-card-top">
                  <div className="review-author-meta">
                    <div className="review-avatar">
                      {rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="review-author-row">
                        <span className="review-author-name">{rev.author}</span>
                        {rev.verified && (
                          <span className="review-verified-pill">
                            <CheckCircle2 size={11} />
                            <span>Verified Purchaser</span>
                          </span>
                        )}
                      </div>
                      <span className="review-date-label">{rev.date}</span>
                    </div>
                  </div>

                  <div className="review-card-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        fill={s <= rev.rating ? '#f59e0b' : 'none'}
                        color={s <= rev.rating ? '#f59e0b' : '#64748b'}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="review-card-headline">{rev.title}</h4>
                <p className="review-card-comment">{rev.comment}</p>

                {/* Review Photo Thumbnail */}
                {rev.photo && (
                  <div className="review-photo-attached-wrap">
                    <img
                      src={rev.photo}
                      alt="Customer review photo"
                      className="review-thumb-clickable"
                      onClick={() => setLightboxImg(rev.photo)}
                      title="Click to view full photo"
                    />
                    <span className="review-thumb-caption">Customer Photo (Click to enlarge)</span>
                  </div>
                )}

                <div className="review-card-footer">
                  <button
                    type="button"
                    className="review-helpful-btn"
                    onClick={() => handleHelpful(rev.id)}
                  >
                    <ThumbsUp size={13} />
                    <span>Helpful ({rev.helpful || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Photo Lightbox Modal */}
          {lightboxImg && (
            <div className="photo-lightbox-backdrop" onClick={() => setLightboxImg(null)}>
              <div className="lightbox-modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setLightboxImg(null)}
                >
                  <X size={20} />
                </button>
                <img src={lightboxImg} alt="Enlarged review photo" className="lightbox-img" />
              </div>
            </div>
          )}
        </section>

        {/* Similar Category Products (Meesho / Myntra style) */}
        {similarProducts && similarProducts.length > 0 && (
          <section className="similar-products-section">
            <div className="similar-products-header">
              <div className="similar-header-info">
                <span className="similar-badge">Explore More</span>
                <h2 className="similar-title">
                  Similar Products in {product.categoryName || 'this Category'}
                </h2>
                <p className="similar-subtitle">
                  Explore other trending picks and matching options from this collection.
                </p>
              </div>
              {product.categoryId && (
                <Link
                  to={`/products?category=${product.categoryId}`}
                  className="similar-view-all-link"
                >
                  <span>View All ({similarProducts.length})</span>
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>

            <div className="similar-products-grid">
              {similarProducts.slice(0, 4).map((simProduct) => (
                <ProductCard key={simProduct.id} product={simProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

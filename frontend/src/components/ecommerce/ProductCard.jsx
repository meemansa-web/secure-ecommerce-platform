import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowRight, Star } from 'lucide-react'
import { getProductImage } from '../../utils/productImages'
import { getProductMetadata } from '../../utils/productMetadata'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import './ProductCard.css'

export default function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
}) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [toastMsg, setToastMsg] = useState(null)

  if (!product) return null

  const {
    id,
    name,
    categoryName,
    category,
    price,
    active = true,
    stockQuantity,
  } = product

  const displayCategory = categoryName || category || 'Curated'
  const meta = getProductMetadata(product)
  const formattedPrice =
    typeof price === 'number' || typeof price === 'string'
      ? `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '—'

  // Real customer rating lookup (No dummy seed)
  const productRatingData = (() => {
    try {
      const globalRatings = JSON.parse(localStorage.getItem('ecommerce_product_ratings') || '{}')
      if (globalRatings[id] && globalRatings[id].count > 0) {
        return globalRatings[id]
      }
      const revRaw = localStorage.getItem(`ecommerce_product_reviews_${id}`)
      if (revRaw) {
        const revs = JSON.parse(revRaw).filter((r) => r.id !== 'rev-1' && r.id !== 'rev-2')
        if (revs.length > 0) {
          const avg = (revs.reduce((sum, r) => sum + Number(r.rating || 5), 0) / revs.length).toFixed(1)
          return { rating: Number(avg), count: revs.length }
        }
      }
      if (product.rating && product.rating > 0) {
        return { rating: Number(product.rating), count: product.reviewsCount || 1 }
      }
    } catch {
      // ignore
    }
    return null
  })()

  // Curated appropriate placeholder
  const productImage = getProductImage(product)

  // Clean stock status
  let stockLabel = 'In Stock'
  let stockClass = 'stock-in'

  if (active === false || stockQuantity === 0) {
    stockLabel = 'Out of Stock'
    stockClass = 'stock-out'
  } else if (stockQuantity !== undefined && stockQuantity <= 5 && stockQuantity > 0) {
    stockLabel = 'Low Stock'
    stockClass = 'stock-low'
  }

  const isWishlisted = isInWishlist(product.id)

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist(product)
    setToastMsg(
      added ? (
        <span>
          Saved to wishlist •{' '}
          <Link to="/customer/wishlist" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 600 }}>
            View
          </Link>
        </span>
      ) : (
        'Removed from wishlist'
      )
    )
    setTimeout(() => setToastMsg(null), 2500)
    if (onWishlistToggle) onWishlistToggle(product)
  }

  const handleCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    setToastMsg('Added to your shopping bag')
    setTimeout(() => setToastMsg(null), 2200)
    if (onAddToCart) onAddToCart(product)
  }

  // Category theme styling for dynamic container border & colorful hover glow
  const getCategoryThemeClass = (cat) => {
    const c = (cat || '').toLowerCase()
    if (c.includes('elect') || c.includes('tech') || c.includes('audio')) return 'product-theme-tech'
    if (c.includes('fash') || c.includes('cloth') || c.includes('shoe') || c.includes('foot') || c.includes('dress') || c.includes('wear')) return 'product-theme-fashion'
    if (c.includes('home') || c.includes('liv') || c.includes('decor') || c.includes('light')) return 'product-theme-home'
    if (c.includes('jewel') || c.includes('access') || c.includes('watch') || c.includes('bag') || c.includes('leather')) return 'product-theme-access'
    return 'product-theme-default'
  }

  return (
    <div className={`editorial-product-card ${getCategoryThemeClass(displayCategory)}`}>
      <div className="card-ambient-glow" />
      <Link to={`/products/${id}`} className="card-link-wrapper">
        {/* Rectangular Portrait Visual */}
        <div className="card-media-wrapper">
          <img
            src={productImage}
            alt={name}
            className="card-media-img"
            loading="lazy"
          />

          {/* Wishlist Heart Button */}
          <button
            type="button"
            className={`card-wishlist-btn ${isWishlisted ? 'wishlist-active' : ''}`}
            onClick={handleWishlistClick}
            aria-label="Save to Wishlist"
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} strokeWidth={1.75} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Quick Add to Bag Action */}
          <button
            type="button"
            className="card-quick-add-btn"
            onClick={handleCartClick}
            aria-label="Add to Bag"
          >
            <ShoppingBag size={14} strokeWidth={1.75} />
            <span>Add to Bag</span>
          </button>

          {/* Real Customer Rating Badge (Meesho / Myntra style) */}
          {productRatingData && (
            <div
              className="card-rating-badge"
              title={`${productRatingData.rating} out of 5 stars (${productRatingData.count} ratings)`}
            >
              <span className="card-rating-num">{productRatingData.rating}</span>
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              <span className="card-rating-sep">|</span>
              <span className="card-rating-cnt">{productRatingData.count}</span>
            </div>
          )}

          {/* Customer Action Toast */}
          {toastMsg && (
            <div className="card-toast-feedback">
              {toastMsg}
            </div>
          )}
        </div>

        {/* Information Underneath */}
        <div className="card-editorial-info">
          <div className="card-category-row">
            <span className="card-brand-badge">{meta.brand}</span>
            <span className={`card-stock-label ${stockClass}`}>{stockLabel}</span>
          </div>

          <h3 className="card-product-title" title={name}>
            {name}
          </h3>

          <div className="card-price-row">
            <span className="card-current-price">{formattedPrice}</span>
            <span className="card-view-details">
              <span>View Details</span>
              <ArrowRight size={13} className="card-arrow-icon" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

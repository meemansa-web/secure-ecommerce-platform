import React from 'react'
import { Link } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { getProductImage } from '../../utils/productImages'
import Button from '../../components/common/Button'
import './CustomerWishlistPage.css'

export default function CustomerWishlistPage() {
  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    moveToCart,
    moveAllToCart,
    clearWishlist,
  } = useWishlist()

  return (
    <div className="wishlist-page-root">
      {/* Breadcrumb Navigation */}
      <nav className="cart-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/" className="cart-breadcrumb-link">Home</Link>
        <span className="cart-breadcrumb-separator">/</span>
        <Link to="/products" className="cart-breadcrumb-link">Shop</Link>
        <span className="cart-breadcrumb-separator">/</span>
        <span className="cart-breadcrumb-current">My Wishlist</span>
      </nav>

      {/* Page Header */}
      <div className="wishlist-header-row">
        <div>
          <h1 className="wishlist-main-title">My Wishlist</h1>
          <p className="wishlist-subtitle">
            {wishlistCount > 0
              ? `You have saved ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} to purchase later.`
              : 'Save items you love and move them directly to your bag anytime.'}
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <div className="wishlist-header-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={clearWishlist}
              title="Clear all saved items"
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ShoppingBag}
              iconPosition="left"
              onClick={moveAllToCart}
            >
              Move All to Bag
            </Button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <div className="cart-empty-wrapper" style={{ padding: '4.5rem 2rem' }}>
          <Heart size={52} strokeWidth={1.25} className="cart-empty-icon" />
          <h2 className="cart-empty-title">Your wishlist is currently empty</h2>
          <p className="cart-empty-desc">
            Explore our curated marketplace and tap the heart icon on any product to save it here for later.
          </p>
          <Link to="/products">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        /* Wishlist Cards Grid */
        <div className="wishlist-grid">
          {wishlistItems.map((item) => {
            const itemImg = getProductImage(item)
            return (
              <div key={item.id} className="wishlist-card">
                {/* Floating Remove Button */}
                <button
                  type="button"
                  className="wishlist-remove-float"
                  onClick={() => removeFromWishlist(item.id)}
                  title="Remove from wishlist"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>

                {/* Media Frame */}
                <Link to={`/products/${item.id}`} className="wishlist-img-frame">
                  <img src={itemImg} alt={item.name} className="wishlist-card-img" />
                </Link>

                {/* Content */}
                <div className="wishlist-card-content">
                  <span className="wishlist-cat-badge">{item.categoryName || 'Curated'}</span>
                  <Link to={`/products/${item.id}`} className="wishlist-item-title">
                    {item.name}
                  </Link>
                  {item.vendorName && (
                    <span className="wishlist-vendor-note">Seller: {item.vendorName}</span>
                  )}

                  <div className="wishlist-price-row">
                    <span className="wishlist-inr-price">
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="wishlist-stock-tag">In Stock</span>
                  </div>
                </div>

                {/* Action: Move to Bag */}
                <div className="wishlist-card-actions">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    icon={ShoppingBag}
                    iconPosition="left"
                    onClick={() => moveToCart(item)}
                  >
                    Move to Bag
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

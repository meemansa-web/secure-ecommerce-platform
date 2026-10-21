import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react'

import Button from '../components/common/Button'
import ProductCard from '../components/ecommerce/ProductCard'
import VisualCategorySection from '../components/ecommerce/VisualCategorySection'
import { getAllProducts } from '../api/productApi'
import {
  EDITORIAL_CATEGORIES,
  NEW_ARRIVALS,
  FEATURED_PRODUCTS,
  MARKETPLACE_BENEFITS,
} from '../data/mockPlaceholderData'
import './HomePage.css'

const BENEFIT_ICONS = {
  ShieldCheck,
  Lock,
  Sparkles,
  RefreshCw,
}

export default function HomePage() {
  const [activeArrivalsTab, setActiveArrivalsTab] = useState('All')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [liveProducts, setLiveProducts] = useState([])

  useEffect(() => {
    getAllProducts()
      .then((data) => {
        if (data && data.length > 0) setLiveProducts(data)
      })
      .catch(() => {})
  }, [])


  const arrivalsTabs = ['All', 'Electronics', 'Fashion']

  const displayProducts = liveProducts.length > 0 ? liveProducts : NEW_ARRIVALS

  const filteredArrivals =
    activeArrivalsTab === 'All'
      ? displayProducts
      : displayProducts.filter((p) => {
          const cat = (p.categoryName || p.category || '').toLowerCase()
          return cat.includes(activeArrivalsTab.toLowerCase())
        })


  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSubmitted(true)
    }
  }

  const handleAddToCart = (product) => {
    console.log('[NIVORA Luxury] Added to cart:', product.name)
  }

  return (
    <div className="editorial-home">
      {/* ========================================================================= */}
      {/* SECTION 1: EDITORIAL HERO WITH AMBIENT VIDEO & ANIMATED MOTION BACKDROP */}
      {/* ========================================================================= */}
      <section className="editorial-hero">
        <div className="hero-media-container">
          {/* Ambient Video Background (Autoplay, Loop, Muted, PlaysInline) */}
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&auto=format&fit=crop&q=85"
            className="hero-backdrop-video"
          >
            <source
              src="https://cdn.coverr.co/videos/coverr-shopping-in-a-clothing-store-6218/1080p.mp4"
              type="video/mp4"
            />
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              type="video/mp4"
            />
          </video>

          {/* Fallback & Layering Image */}
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&auto=format&fit=crop&q=85"
            alt="Modern Minimalist Curated Goods"
            className="hero-backdrop-img"
          />

          {/* Dynamic Floating Animated Color Mesh Orbs */}
          <div className="hero-glow-orb hero-orb-indigo" />
          <div className="hero-glow-orb hero-orb-fuchsia" />
          <div className="hero-glow-orb hero-orb-cyan" />
          <div className="hero-glow-orb hero-orb-amber" />

          <div className="hero-scrim-overlay" />

          <div className="hero-content-wrapper container">
            <div className="hero-text-box">
              <div className="hero-badge-pill">
                <Sparkles size={13} className="hero-badge-icon" />
                <span>2026 Curated Marketplace • Live Studio</span>
              </div>

              <h1 className="hero-headline editorial-title-serif">
                Discover Better <br />
                <span className="hero-headline-italic">Everyday.</span>
              </h1>

              <p className="hero-lead-text">
                Curated products from verified sellers, designed for the way you live.
                Refined tech, timeless wardrobe essentials, and handcrafted interior objects.
              </p>

              <div className="hero-buttons-row">
                <Link to="/products">
                  <Button variant="primary" size="lg" icon={ArrowRight} className="hero-btn-gradient">
                    Shop Now
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="outline" size="lg" className="hero-btn-glass">
                    Explore Collection
                  </Button>
                </Link>
              </div>

              {/* Floating Hero Product Showcase Pill */}
              <div className="hero-featured-pill">
                <div className="hero-pill-img-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80"
                    alt="Sony WH-1000XM5"
                    className="hero-pill-img"
                  />
                </div>
                <div className="hero-pill-info">
                  <span className="hero-pill-tag">Spotlight Item</span>
                  <p className="hero-pill-title">Sony WH-1000XM5 • ₹29,990</p>
                </div>
                <Link to="/products?brand=sony" className="hero-pill-action" title="View details">
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Value Assurance Bar */}
        <div className="hero-assurance-bar">
          <div className="container assurance-container">
            <div className="assurance-item">
              <CheckCircle2 size={16} className="assurance-icon" />
              <span>10,000+ Curated Products</span>
            </div>
            <div className="assurance-item">
              <CheckCircle2 size={16} className="assurance-icon" />
              <span>Verified Vendor Marketplace</span>
            </div>
            <div className="assurance-item">
              <CheckCircle2 size={16} className="assurance-icon" />
              <span>Buyer Protection Guaranteed</span>
            </div>
            <div className="assurance-item">
              <CheckCircle2 size={16} className="assurance-icon" />
              <span>Complimentary 30-Day Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Arched Category & Dimension Section (Meesho / Myntra Style) */}
      <VisualCategorySection
        title="Curated Collections & Brands"
        subtitle="Browse handpicked looks by Category, Gender & Top Brands inspired by Meesho & Myntra."
        activeTabDefault="categories"
      />

      {/* ========================================================================= */}
      {/* SECTION 2: SHOP BY CATEGORY (4 Large Image Blocks) */}
      {/* ========================================================================= */}
      <section className="editorial-section category-section">
        <div className="container">
          <div className="section-header-editorial">
            <div className="section-title-wrap">
              <span className="editorial-eyebrow">The Departments</span>
              <h2 className="editorial-title editorial-title-serif">Shop by Category</h2>
            </div>
            <Link to="/categories" className="editorial-text-link">
              <span>View All Categories</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="category-editorial-grid">
            {EDITORIAL_CATEGORIES.map((cat, idx) => {
              const themeKeys = ['cat-theme-fashion', 'cat-theme-tech', 'cat-theme-home', 'cat-theme-acc']
              const catClass = themeKeys[idx % themeKeys.length]
              return (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className={`category-large-card ${catClass}`}
                >
                  <div className="category-img-wrapper">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="category-img"
                      loading="lazy"
                    />
                    <div className="category-overlay-gradient" />
                    <span className="category-floating-badge">{cat.categoryKey}</span>
                  </div>
                  <div className="category-card-meta">
                    <h3 className="category-display-name">{cat.name}</h3>
                    <p className="category-display-sub">{cat.subtitle}</p>
                    <span className="category-explore-cta">
                      <span>Explore Collection</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: NEW ARRIVALS */}
      {/* ========================================================================= */}
      <section className="editorial-section new-arrivals-section">
        <div className="container">
          <div className="section-header-editorial">
            <div className="section-title-wrap">
              <span className="editorial-eyebrow">Fresh Selections</span>
              <h2 className="editorial-title editorial-title-serif">New Arrivals</h2>
            </div>

            {/* Category Filter Tabs */}
            <div className="arrivals-tab-group">
              {arrivalsTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`arrivals-tab-btn ${activeArrivalsTab === tab ? 'active-tab' : ''}`}
                  onClick={() => setActiveArrivalsTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="products-editorial-grid">
            {filteredArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: EDITORIAL COLLECTION (Split Layout Feature) */}
      {/* ========================================================================= */}
      <section className="editorial-split-section">
        <div className="container">
          {/* Split Block 1: Technology for Everyday Life */}
          <div className="editorial-split-row split-theme-tech">
            <div className="split-image-col">
              <img
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80"
                alt="Technology for Everyday Life"
                className="split-editorial-img"
                loading="lazy"
              />
            </div>
            <div className="split-content-col">
              <div className="split-content-inner">
                <span className="editorial-eyebrow">Curated Engineering</span>
                <h2 className="split-headline editorial-title-serif">
                  Technology for Everyday Life
                </h2>
                <p className="split-paragraph">
                  We believe instruments should integrate seamlessly into your natural environment.
                  Our curated tech catalog features acoustic hardware, tactile workspace essentials,
                  and minimal wireless chargers engineered with enduring utility and zero clutter.
                </p>
                <div className="split-cta-wrap">
                  <Link to="/products?category=Electronics">
                    <Button variant="primary" size="md" icon={ArrowRight}>
                      Shop Collection
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Split Block 2: Mindful Living & Home Objects */}
          <div className="editorial-split-row split-reverse split-theme-home">
            <div className="split-image-col">
              <img
                src="https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=1200&auto=format&fit=crop&q=80"
                alt="Spaces & Objects Designed for Calm"
                className="split-editorial-img"
                loading="lazy"
              />
            </div>
            <div className="split-content-col">
              <div className="split-content-inner">
                <span className="editorial-eyebrow">Artisan Interiors</span>
                <h2 className="split-headline editorial-title-serif">
                  Objects Crafted for Calm
                </h2>
                <p className="split-paragraph">
                  Discover handcrafted ceramic vessels, stoneware tableware, and natural linen textiles
                  sourced directly from independent makers and verified studios around the world.
                </p>
                <div className="split-cta-wrap">
                  <Link to="/products?category=Home">
                    <Button variant="outline" size="md" icon={ArrowRight}>
                      Explore Interior Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: BEST SELLERS / FEATURED PRODUCTS */}
      {/* ========================================================================= */}
      <section className="editorial-section featured-products-section">
        <div className="container">
          <div className="section-header-editorial">
            <div className="section-title-wrap">
              <span className="editorial-eyebrow">Most Coveted</span>
              <h2 className="editorial-title editorial-title-serif">Featured Products</h2>
            </div>
            <Link to="/products" className="editorial-text-link">
              <span>View All Products</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="products-editorial-grid">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: MARKETPLACE BENEFITS STRIP */}
      {/* ========================================================================= */}
      <section className="editorial-benefits-strip">
        <div className="container">
          <div className="benefits-strip-grid">
            {MARKETPLACE_BENEFITS.map((item, idx) => {
              const IconComp = BENEFIT_ICONS[item.iconName] || ShieldCheck
              const benefitThemes = ['benefit-emerald', 'benefit-indigo', 'benefit-purple', 'benefit-amber']
              const themeClass = benefitThemes[idx % benefitThemes.length]
              return (
                <div key={item.id} className={`benefit-minimal-item ${themeClass}`}>
                  <div className="benefit-minimal-icon">
                    <IconComp size={22} strokeWidth={1.5} />
                  </div>
                  <div className="benefit-minimal-text">
                    <h4 className="benefit-minimal-title">{item.title}</h4>
                    <p className="benefit-minimal-desc">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: NEWSLETTER */}
      {/* ========================================================================= */}
      <section className="editorial-newsletter-section">
        <div className="container">
          <div className="newsletter-card-editorial">
            <span className="editorial-eyebrow">Editorial Dispatch</span>
            <h2 className="newsletter-headline editorial-title-serif">
              Stay In The Know
            </h2>
            <p className="newsletter-description">
              Be the first to discover new products, collections and marketplace updates.
            </p>

            {newsletterSubmitted ? (
              <div className="newsletter-success-box">
                <Sparkles size={18} className="success-icon" />
                <span>Thank you for subscribing to our marketplace editorial.</span>
              </div>
            ) : (
              <form className="newsletter-form-minimal" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  className="newsletter-minimal-input"
                  placeholder="Enter your email address"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button type="submit" className="newsletter-submit-btn">
                  Subscribe
                </button>
              </form>
            )}

            <span className="newsletter-disclaimer">
              By subscribing, you agree to our Terms of Service & Privacy Policy. Unsubscribe anytime.
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

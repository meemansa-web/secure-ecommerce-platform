import React, { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  ChevronDown,
  Layers,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { GENDER_OPTIONS, CATEGORY_OPTIONS, BRAND_OPTIONS } from '../../utils/productMetadata'
import './ProductSubNavbar.css'

export default function ProductSubNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const currentCategory = searchParams.get('category') || ''
  const currentGender = searchParams.get('gender') || ''
  const currentBrand = searchParams.get('brand') || ''
  const currentFilter = searchParams.get('filter') || ''

  // Active Flyout State: 'gender' | 'category' | 'brand' | null
  const [activeFlyout, setActiveFlyout] = useState(null)

  const handleSelectGender = (genderId) => {
    setActiveFlyout(null)
    if (genderId === 'all') {
      navigate('/products')
    } else {
      navigate(`/products?gender=${genderId}`)
    }
  }

  const handleSelectCategory = (catSlug) => {
    setActiveFlyout(null)
    navigate(`/products?category=${catSlug}`)
  }

  const handleSelectBrand = (brandId) => {
    setActiveFlyout(null)
    navigate(`/products?brand=${brandId}`)
  }

  return (
    <div
      className="product-subnav-root"
      onMouseLeave={() => setActiveFlyout(null)}
    >
      <div className="product-subnav-container">
        {/* Sub-Nav Bar Elements */}
        <div className="product-subnav-bar">
          {/* Quick Highlight: Popular / All */}
          <Link
            to="/products"
            className={`subnav-quick-pill ${
              location.pathname === '/products' && !currentGender && !currentCategory && !currentBrand && !currentFilter
                ? 'active'
                : ''
            }`}
          >
            <Sparkles size={13} className="subnav-pill-icon" />
            <span>All Products</span>
          </Link>

          <Link
            to="/products?filter=new"
            className={`subnav-quick-pill ${currentFilter === 'new' ? 'active' : ''}`}
          >
            <TrendingUp size={13} className="subnav-pill-icon" />
            <span>New Arrivals</span>
          </Link>

          {/* Section Divider */}
          <div className="subnav-divider" />

          {/* SECTION 1: GENDER-BASED (लिंग आधारित) */}
          <div
            className={`subnav-dropdown-trigger ${activeFlyout === 'gender' ? 'open' : ''} ${
              currentGender ? 'has-active-selection' : ''
            }`}
            onMouseEnter={() => setActiveFlyout('gender')}
            onClick={() => setActiveFlyout((prev) => (prev === 'gender' ? null : 'gender'))}
          >
            <div className="trigger-label-wrap">
              <Users size={14} className="trigger-icon" />
              <span className="trigger-title">GENDER</span>
              {currentGender && (
                <span className="selection-badge">
                  {GENDER_OPTIONS.find((g) => g.id === currentGender)?.label || currentGender}
                </span>
              )}
            </div>
            <ChevronDown size={13} className="trigger-chevron" />
          </div>

          {/* SECTION 2: CATEGORY-BASED (श्रेणी आधारित) */}
          <div
            className={`subnav-dropdown-trigger ${activeFlyout === 'category' ? 'open' : ''} ${
              currentCategory ? 'has-active-selection' : ''
            }`}
            onMouseEnter={() => setActiveFlyout('category')}
            onClick={() => setActiveFlyout((prev) => (prev === 'category' ? null : 'category'))}
          >
            <div className="trigger-label-wrap">
              <Layers size={14} className="trigger-icon" />
              <span className="trigger-title">CATEGORIES</span>
              {currentCategory && (
                <span className="selection-badge">
                  {CATEGORY_OPTIONS.find((c) => c.slug === currentCategory)?.label || currentCategory}
                </span>
              )}
            </div>
            <ChevronDown size={13} className="trigger-chevron" />
          </div>

          {/* SECTION 3: BRAND-BASED (ब्रांड आधारित) */}
          <div
            className={`subnav-dropdown-trigger ${activeFlyout === 'brand' ? 'open' : ''} ${
              currentBrand ? 'has-active-selection' : ''
            }`}
            onMouseEnter={() => setActiveFlyout('brand')}
            onClick={() => setActiveFlyout((prev) => (prev === 'brand' ? null : 'brand'))}
          >
            <div className="trigger-label-wrap">
              <Award size={14} className="trigger-icon" />
              <span className="trigger-title">BRANDS</span>
              {currentBrand && (
                <span className="selection-badge">
                  {BRAND_OPTIONS.find((b) => b.id === currentBrand)?.label || currentBrand}
                </span>
              )}
            </div>
            <ChevronDown size={13} className="trigger-chevron" />
          </div>

          {/* Quick Category Direct Links (Meesho / Myntra Style) */}
          <div className="subnav-quick-categories">
            <button
              type="button"
              className={`subnav-cat-link ${currentGender === 'women' ? 'active' : ''}`}
              onClick={() => handleSelectGender('women')}
            >
              Women
            </button>
            <button
              type="button"
              className={`subnav-cat-link ${currentGender === 'men' ? 'active' : ''}`}
              onClick={() => handleSelectGender('men')}
            >
              Men
            </button>
            <button
              type="button"
              className={`subnav-cat-link ${currentGender === 'kids' ? 'active' : ''}`}
              onClick={() => handleSelectGender('kids')}
            >
              Kids
            </button>
            <button
              type="button"
              className={`subnav-cat-link ${currentCategory === 'footwear' ? 'active' : ''}`}
              onClick={() => handleSelectCategory('footwear')}
            >
              Footwear
            </button>
            <button
              type="button"
              className={`subnav-cat-link ${currentBrand === 'rare-rabbit' ? 'active' : ''}`}
              onClick={() => handleSelectBrand('rare-rabbit')}
            >
              Rare Rabbit
            </button>
            <button
              type="button"
              className={`subnav-cat-link ${currentBrand === 'puma' ? 'active' : ''}`}
              onClick={() => handleSelectBrand('puma')}
            >
              Puma
            </button>
            <button
              type="button"
              className={`subnav-cat-link ${currentBrand === 'fabindia' ? 'active' : ''}`}
              onClick={() => handleSelectBrand('fabindia')}
            >
              FabIndia
            </button>
          </div>
        </div>

        {/* FLYOUT MEGA-MENUS (3 DISTINCT SECTIONS) */}

        {/* 1. GENDER FLYOUT */}
        {activeFlyout === 'gender' && (
          <div className="subnav-mega-flyout">
            <div className="flyout-header-strip">
              <span className="flyout-section-tag">SHOP BY GENDER</span>
              <span className="flyout-helper-text">Select a collection to explore tailored sizes, styling & fits</span>
            </div>
            <div className="flyout-gender-grid">
              {GENDER_OPTIONS.filter((g) => g.id !== 'all').map((g) => (
                <div
                  key={g.id}
                  className={`flyout-gender-card ${currentGender === g.id ? 'active' : ''}`}
                  onClick={() => handleSelectGender(g.id)}
                >
                  <div className="gender-card-media">
                    <img src={g.image} alt={g.label} />
                    <div className="gender-card-scrim" />
                  </div>
                  <div className="gender-card-body">
                    <h4>{g.label}</h4>
                    <p>{g.tagline}</p>
                    <span className="gender-card-link">
                      <span>Explore {g.label}</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CATEGORY FLYOUT */}
        {activeFlyout === 'category' && (
          <div className="subnav-mega-flyout">
            <div className="flyout-header-strip">
              <span className="flyout-section-tag">SHOP BY CATEGORY</span>
              <span className="flyout-helper-text">Curated collections spanning ethnic, western, footwear, and tech</span>
            </div>
            <div className="flyout-category-grid">
              {CATEGORY_OPTIONS.map((c) => (
                <div
                  key={c.id}
                  className={`flyout-category-card ${currentCategory === c.slug ? 'active' : ''}`}
                  onClick={() => handleSelectCategory(c.slug)}
                >
                  <img src={c.image} alt={c.label} className="flyout-cat-img" />
                  <div className="flyout-cat-info">
                    <span className="flyout-cat-title">{c.label}</span>
                    <span className="flyout-cat-sub">{c.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BRAND FLYOUT */}
        {activeFlyout === 'brand' && (
          <div className="subnav-mega-flyout">
            <div className="flyout-header-strip">
              <span className="flyout-section-tag">SHOP BY BRAND</span>
              <span className="flyout-helper-text">Official collections from verified global & designer merchant partners</span>
            </div>
            <div className="flyout-brand-grid">
              {BRAND_OPTIONS.map((b) => (
                <div
                  key={b.id}
                  className={`flyout-brand-card ${currentBrand === b.id ? 'active' : ''}`}
                  onClick={() => handleSelectBrand(b.id)}
                >
                  <div className="brand-logo-pill">
                    <span className="brand-badge-tag">{b.badge}</span>
                    <h4 className="brand-card-name">{b.label}</h4>
                    <span className="brand-card-sub">{b.tagline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

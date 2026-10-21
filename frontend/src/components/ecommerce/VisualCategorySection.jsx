import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Layers,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { GENDER_OPTIONS, CATEGORY_OPTIONS, BRAND_OPTIONS } from '../../utils/productMetadata'
import './VisualCategorySection.css'

export default function VisualCategorySection({ title, subtitle, activeTabDefault = 'categories' }) {
  const navigate = useNavigate()
  // Active Dimension View: 'categories' | 'gender' | 'brands'
  const [activeDimension, setActiveDimension] = useState(activeTabDefault)

  return (
    <section className="visual-category-section">
      <div className="container">
        {/* Section Header with Dimension Tabs */}
        <div className="visual-section-header">
          <div className="visual-header-text">
            <span className="editorial-eyebrow">
              <Sparkles size={13} style={{ color: '#d4af37' }} />
              <span>CURATED COLLECTIONS</span>
            </span>
            <h2 className="visual-section-title editorial-title-serif">
              {title || 'Explore by Category, Gender & Brand'}
            </h2>
            <p className="visual-section-sub">
              {subtitle ||
                'Discover handcrafted garments, luxury footwear, tech essentials, and top partner brands.'}
            </p>
          </div>

          {/* 3 Distinct Dimension Switcher Buttons ("alag alag hona chahiye") */}
          <div className="dimension-switcher-tabs" role="tablist">
            <button
              type="button"
              className={`dimension-tab-btn ${activeDimension === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveDimension('categories')}
            >
              <Layers size={14} />
              <span>Category Based</span>
            </button>

            <button
              type="button"
              className={`dimension-tab-btn ${activeDimension === 'gender' ? 'active' : ''}`}
              onClick={() => setActiveDimension('gender')}
            >
              <Users size={14} />
              <span>Gender Based</span>
            </button>

            <button
              type="button"
              className={`dimension-tab-btn ${activeDimension === 'brands' ? 'active' : ''}`}
              onClick={() => setActiveDimension('brands')}
            >
              <Award size={14} />
              <span>Brand Based</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIMENSION 1: CATEGORY BASED (Meesho Style Arched Cards)                  */}
        {/* ========================================================================= */}
        {activeDimension === 'categories' && (
          <div className="visual-circle-row-wrap">
            <div className="visual-circle-row">
              {CATEGORY_OPTIONS.map((cat) => (
                <div
                  key={cat.id}
                  className="meesho-arch-card"
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="arch-media-frame">
                    <img src={cat.image} alt={cat.label} className="arch-img" loading="lazy" />
                    <div className="arch-glow-ring" />
                  </div>
                  <span className="arch-label">{cat.label}</span>
                  <span className="arch-subtext">{cat.subtitle}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DIMENSION 2: GENDER BASED (Men, Women, Kids, Unisex)                     */}
        {/* ========================================================================= */}
        {activeDimension === 'gender' && (
          <div className="gender-cards-grid">
            {GENDER_OPTIONS.filter((g) => g.id !== 'all').map((g) => (
              <div
                key={g.id}
                className="gender-feature-card"
                onClick={() => navigate(`/products?gender=${g.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="gender-card-bg-wrap">
                  <img src={g.image} alt={g.label} className="gender-bg-img" loading="lazy" />
                  <div className="gender-scrim-gradient" />
                </div>
                <div className="gender-content-overlay">
                  <span className="gender-collection-label">NIVORA CURATION</span>
                  <h3 className="gender-title">{g.label}</h3>
                  <p className="gender-tagline">{g.tagline}</p>
                  <div className="gender-cta-pill">
                    <span>Shop {g.label}</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* DIMENSION 3: BRAND BASED (Puma, Rare Rabbit, FabIndia, Zara, etc.)        */}
        {/* ========================================================================= */}
        {activeDimension === 'brands' && (
          <div className="brands-feature-grid">
            {BRAND_OPTIONS.map((b) => (
              <div
                key={b.id}
                className="brand-feature-card"
                onClick={() => navigate(`/products?brand=${b.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="brand-card-top">
                  <span className="brand-tier-badge">{b.badge}</span>
                  <TrendingUp size={14} className="brand-trending-icon" />
                </div>
                <div className="brand-card-avatar">
                  <img src={b.image} alt={b.label} className="brand-avatar-img" loading="lazy" />
                </div>
                <h4 className="brand-title-text">{b.label}</h4>
                <p className="brand-origin-text">{b.origin}</p>
                <span className="brand-tagline-text">{b.tagline}</span>
                <div className="brand-view-link">
                  <span>Explore Brand</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

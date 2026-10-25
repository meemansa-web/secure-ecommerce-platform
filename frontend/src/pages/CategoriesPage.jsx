import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { getAllCategories } from '../api/categoryApi'
import VisualCategorySection from '../components/ecommerce/VisualCategorySection'
import Loading from '../components/common/Loading'
import {
  GENDER_OPTIONS,
  CATEGORY_OPTIONS,
  BRAND_OPTIONS,
} from '../utils/productMetadata'
import './CategoriesPage.css'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const loadCategories = async () => {
      try {
        setLoading(true)
        const data = await getAllCategories()
        if (isMounted) setCategories(data || [])
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'We couldn’t load categories right now. Please try again.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="editorial-categories-page">
      <div className="container">
        {/* ========================================================================= */}
        {/* HERO HEADER                                                               */}
        {/* ========================================================================= */}
        <div className="categories-hero-header">
          <span className="editorial-eyebrow">
            <Sparkles size={13} style={{ color: '#d4af37' }} />
            <span>NIVORA MARKETPLACE DIRECTORY</span>
          </span>
          <h1 className="editorial-title editorial-title-serif">Collections & Departments</h1>
          <p className="categories-header-desc">
            Explore curated goods grouped strictly by Gender, Category, and Official Brand
            showcases.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* VISUAL ARCHED CATEGORY SHOWCASE (Meesho / Myntra Style)                   */}
        {/* ========================================================================= */}
        <div className="categories-visual-block">
          <VisualCategorySection
            title="Interactive Visual Catalog"
            subtitle="Browse visual circular arches inspired by leading fashion platforms."
            activeTabDefault="categories"
          />
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: GENDER-BASED                                                    */}
        {/* ========================================================================= */}
        <section className="category-dimension-section">
          <div className="dimension-section-title-wrap">
            <div className="dimension-title-badge gender-accent">
              <Users size={16} />
              <span>DIMENSION 1</span>
            </div>
            <h2 className="dimension-main-title editorial-title-serif">
              Shop by Gender
            </h2>
            <p className="dimension-sub-desc">
              Dedicated wardrobe selections tailored for Women, Men, Kids, and Unisex essentials.
            </p>
          </div>

          <div className="gender-editorial-grid">
            {GENDER_OPTIONS.filter((g) => g.id !== 'all').map((g) => (
              <Link
                key={g.id}
                to={`/products?gender=${g.id}`}
                className="gender-editorial-card"
              >
                <div className="gender-media-wrap">
                  <img src={g.image} alt={g.label} className="gender-img" loading="lazy" />
                  <div className="gender-scrim" />
                </div>
                <div className="gender-card-meta">
                  <span className="gender-sub-tag">COLLECTION</span>
                  <h3 className="gender-card-heading">{g.label}</h3>
                  <p className="gender-card-desc">{g.tagline}</p>
                  <span className="gender-action-link">
                    <span>Explore {g.label}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: CATEGORY-BASED                                                 */}
        {/* ========================================================================= */}
        <section className="category-dimension-section">
          <div className="dimension-section-title-wrap">
            <div className="dimension-title-badge category-accent">
              <Layers size={16} />
              <span>DIMENSION 2</span>
            </div>
            <h2 className="dimension-main-title editorial-title-serif">
              Shop by Category & Department
            </h2>
            <p className="dimension-sub-desc">
              Explore specialized product classes spanning ethnic heritage, western chic, footwear, and technology.
            </p>
          </div>

          <div className="category-editorial-grid">
            {CATEGORY_OPTIONS.map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="category-showcase-card"
              >
                <div className="cat-card-media">
                  <img src={c.image} alt={c.label} className="cat-card-img" loading="lazy" />
                  <div className="cat-card-scrim" />
                </div>
                <div className="cat-card-details">
                  <span className="cat-card-tag">{c.gender.toUpperCase()}</span>
                  <h3 className="cat-card-name">{c.label}</h3>
                  <p className="cat-card-subtitle">{c.subtitle}</p>
                  <span className="cat-card-link">
                    <span>View Products</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: BRAND-BASED                                                     */}
        {/* ========================================================================= */}
        <section className="category-dimension-section">
          <div className="dimension-section-title-wrap">
            <div className="dimension-title-badge brand-accent">
              <Award size={16} />
              <span>DIMENSION 3</span>
            </div>
            <h2 className="dimension-main-title editorial-title-serif">
              Shop by Brand
            </h2>
            <p className="dimension-sub-desc">
              Discover official collections from our verified global and Indian brand partners.
            </p>
          </div>

          <div className="brands-editorial-grid">
            {BRAND_OPTIONS.map((b) => (
              <Link
                key={b.id}
                to={`/products?brand=${b.id}`}
                className="brand-editorial-card"
              >
                <div className="brand-editorial-header">
                  <span className="brand-tag-pill">{b.badge}</span>
                  <TrendingUp size={14} className="brand-stat-icon" />
                </div>
                <div className="brand-avatar-wrap">
                  <img src={b.image} alt={b.label} className="brand-photo" loading="lazy" />
                </div>
                <h3 className="brand-title-header">{b.label}</h3>
                <span className="brand-origin-pill">{b.origin}</span>
                <p className="brand-story-text">{b.tagline}</p>
                <span className="brand-explore-btn">
                  <span>Browse {b.label}</span>
                  <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

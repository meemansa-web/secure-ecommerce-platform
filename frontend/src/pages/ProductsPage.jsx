import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  X,
  Filter,
} from 'lucide-react'

import { getAllProducts } from '../api/productApi'
import { getAllCategories } from '../api/categoryApi'
import ProductCard from '../components/ecommerce/ProductCard'
import VisualCategorySection from '../components/ecommerce/VisualCategorySection'
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import {
  GENDER_OPTIONS,
  CATEGORY_OPTIONS,
  BRAND_OPTIONS,
  getProductMetadata,
} from '../utils/productMetadata'
import './ProductsPage.css'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category') || 'all'
  const genderParam = searchParams.get('gender') || 'all'
  const brandParam = searchParams.get('brand') || 'all'
  const filterParam = searchParams.get('filter') || ''
  const searchParam = searchParams.get('search') || ''

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState(searchParam)
  const [sortBy, setSortBy] = useState('featured')
  const [showVisualSection, setShowVisualSection] = useState(true)

  // Sync internal search input with URL search param if it changes externally
  useEffect(() => {
    setSearchTerm(searchParam)
  }, [searchParam])

  // Load backend categories
  useEffect(() => {
    getAllCategories()
      .then((data) => setCategories(data || []))
      .catch((err) => console.error('Failed to load categories', err))
  }, [])

  // Load products
  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllProducts()
        if (isMounted) {
          setProducts(data || [])
        }
      } catch {
        if (isMounted) {
          setError(
            'We couldn’t load products right now. Please check your connection and try again.'
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  // Filter Update Handlers (Updating URL Search Parameters)
  const handleGenderChange = (genderId) => {
    const next = new URLSearchParams(searchParams)
    if (genderId === 'all') {
      next.delete('gender')
    } else {
      next.set('gender', genderId)
    }
    setSearchParams(next)
  }

  const handleCategoryChange = (catSlugOrId) => {
    const next = new URLSearchParams(searchParams)
    if (catSlugOrId === 'all') {
      next.delete('category')
    } else {
      next.set('category', catSlugOrId)
    }
    setSearchParams(next)
  }

  const handleBrandChange = (brandId) => {
    const next = new URLSearchParams(searchParams)
    if (brandId === 'all') {
      next.delete('brand')
    } else {
      next.set('brand', brandId)
    }
    setSearchParams(next)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchTerm.trim()) {
      next.set('search', searchTerm.trim())
    } else {
      next.delete('search')
    }
    setSearchParams(next)
  }

  const handleClearAllFilters = () => {
    setSearchParams(new URLSearchParams())
    setSearchTerm('')
  }

  // Multi-dimension Filtering (Gender, Category, Brand, New Arrivals, Search)
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const meta = getProductMetadata(prod)

      // 1. Gender Filter (Exact match for Men, Women, Kids, or Unisex)
      if (genderParam !== 'all') {
        if (meta.gender !== genderParam) {
          return false
        }
      }

      // 2. Brand Filter
      if (brandParam !== 'all') {
        if (meta.brandId !== brandParam) {
          return false
        }
      }

      // 3. Category Filter
      if (categoryParam !== 'all') {
        const matchCatId = String(prod.categoryId) === String(categoryParam)
        const catOption = CATEGORY_OPTIONS.find(
          (c) => c.slug === categoryParam || c.id === categoryParam
        )
        const nameLower = (prod.name || '').toLowerCase()
        const descLower = (prod.description || '').toLowerCase()
        const catNameLower = (prod.categoryName || '').toLowerCase()

        let matchSlug = false
        if (catOption) {
          if (meta.subCategory.toLowerCase() === catOption.label.toLowerCase()) {
            matchSlug = true
          } else if (
            catOption.slug === 'footwear' &&
            (nameLower.includes('sneaker') ||
              nameLower.includes('shoe') ||
              nameLower.includes('boot') ||
              nameLower.includes('puma') ||
              catNameLower.includes('footwear'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'ethnic-wear' &&
            (nameLower.includes('saree') ||
              nameLower.includes('kurta') ||
              nameLower.includes('kurti') ||
              nameLower.includes('chanderi'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'western-dresses' &&
            (nameLower.includes('dress') ||
              nameLower.includes('slip') ||
              nameLower.includes('midi') ||
              nameLower.includes('zara'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'menswear' &&
            (nameLower.includes('shirt') ||
              nameLower.includes('oxford') ||
              nameLower.includes('coat') ||
              nameLower.includes('rabbit'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'jewellery' &&
            (nameLower.includes('jhumka') ||
              nameLower.includes('watch') ||
              nameLower.includes('jewel') ||
              descLower.includes('kundan'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'electronics' &&
            (nameLower.includes('samsung') ||
              nameLower.includes('sony') ||
              nameLower.includes('macbook') ||
              nameLower.includes('phone') ||
              prod.categoryId === 1 ||
              catNameLower.includes('electronic'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'home-decor' &&
            (nameLower.includes('lamp') ||
              nameLower.includes('candle') ||
              nameLower.includes('coffee') ||
              catNameLower.includes('home'))
          ) {
            matchSlug = true
          } else if (
            catOption.slug === 'kids-wear' &&
            (nameLower.includes('kids') || meta.gender === 'kids')
          ) {
            matchSlug = true
          }
        }

        if (!matchCatId && !matchSlug) {
          return false
        }
      }

      // 4. New Arrivals Filter
      if (filterParam === 'new') {
        if (!meta.isNewArrival) {
          return false
        }
      }

      // 5. Search Term Filter
      const activeSearch = searchTerm.trim().toLowerCase()
      if (activeSearch) {
        const matchName = (prod.name || '').toLowerCase().includes(activeSearch)
        const matchDesc = (prod.description || '').toLowerCase().includes(activeSearch)
        const matchCat = (prod.categoryName || '').toLowerCase().includes(activeSearch)
        const matchBrand = meta.brand.toLowerCase().includes(activeSearch)
        const matchSub = meta.subCategory.toLowerCase().includes(activeSearch)
        if (!matchName && !matchDesc && !matchCat && !matchBrand && !matchSub) {
          return false
        }
      }

      return true
    })
  }, [products, genderParam, brandParam, categoryParam, filterParam, searchTerm])

  // Sort
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0)
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0)
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'newest') {
        return (b.id || 0) - (a.id || 0)
      }
      return 0
    })
  }, [filteredProducts, sortBy])

  // Dynamic Header Title & Eyebrow
  const headerMeta = useMemo(() => {
    if (filterParam === 'new') {
      return {
        eyebrow: 'FRESH DROPS 2026',
        title: 'New Arrivals Collection',
        desc: 'Explore the newest seasonal releases, contemporary silhouettes, and verified vendor launches.',
      }
    }
    if (genderParam !== 'all') {
      const g = GENDER_OPTIONS.find((opt) => opt.id === genderParam)
      return {
        eyebrow: 'SHOP BY GENDER',
        title: `${g?.label || genderParam}'s Collection`,
        desc: g?.tagline || `Tailored selections curated specifically for ${g?.label}.`,
      }
    }
    if (brandParam !== 'all') {
      const b = BRAND_OPTIONS.find((opt) => opt.id === brandParam)
      return {
        eyebrow: `OFFICIAL BRAND SHOWCASE • ${b?.badge || ''}`,
        title: `${b?.label || brandParam}`,
        desc: `${b?.tagline || 'Verified brand items'} — 100% authentic merchant stock on Nivora.`,
      }
    }
    if (categoryParam !== 'all') {
      const c = CATEGORY_OPTIONS.find((opt) => opt.slug === categoryParam || opt.id === categoryParam)
      return {
        eyebrow: 'CURATED DEPARTMENT',
        title: `${c?.label || categoryParam} Collection`,
        desc: c?.subtitle || 'Hand-picked designs from verified sellers across our marketplace.',
      }
    }
    return {
      eyebrow: 'THE COMPLETE CATALOG',
      title: 'Shop All Products',
      desc: 'Explore products curated from trusted sellers across our luxury marketplace.',
    }
  }, [filterParam, genderParam, brandParam, categoryParam])

  const hasActiveFilters =
    genderParam !== 'all' ||
    categoryParam !== 'all' ||
    brandParam !== 'all' ||
    Boolean(filterParam) ||
    Boolean(searchTerm)

  const activeVisualTab =
    brandParam !== 'all'
      ? 'brands'
      : genderParam !== 'all'
      ? 'gender'
      : 'categories'

  return (
    <div className="editorial-products-page">
      <div className="container">
        {/* ========================================================================= */}
        {/* 1. PAGE HEADER & SEARCH                                                   */}
        {/* ========================================================================= */}
        <div className="products-page-header">
          <div className="header-text-group">
            <span className="editorial-eyebrow">{headerMeta.eyebrow}</span>
            <h1 className="editorial-title editorial-title-serif">{headerMeta.title}</h1>
            <p className="header-caption">{headerMeta.desc}</p>
          </div>

          <form className="editorial-search-container" onSubmit={handleSearchSubmit}>
            <Search size={16} className="search-box-icon" />
            <input
              type="text"
              className="editorial-search-input"
              placeholder="Search products, brands, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {/* ========================================================================= */}
        {/* 2. VISUAL ARCHED SECTION (Meesho / Myntra Style Visual Showcase)          */}
        {/* ========================================================================= */}
        {showVisualSection && (
          <div className="catalog-visual-wrapper">
            <VisualCategorySection
              title="Explore by Category, Gender & Brand"
              subtitle="Browse visual collections inspired by top fashion hubs with one-tap filtering."
              activeTabDefault={activeVisualTab}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. ACTIVE APPLIED FILTERS CHIPS & CLEAR BUTTON                           */}
        {/* ========================================================================= */}
        {hasActiveFilters && (
          <div className="applied-filters-strip">
            <div className="applied-filters-label">
              <Filter size={13} />
              <span>Active Filters:</span>
            </div>
            <div className="applied-chips-list">
              {genderParam !== 'all' && (
                <span className="applied-chip">
                  Gender: <strong>{GENDER_OPTIONS.find((g) => g.id === genderParam)?.label}</strong>
                  <button type="button" onClick={() => handleGenderChange('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {categoryParam !== 'all' && (
                <span className="applied-chip">
                  Category: <strong>{CATEGORY_OPTIONS.find((c) => c.slug === categoryParam)?.label || categoryParam}</strong>
                  <button type="button" onClick={() => handleCategoryChange('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {brandParam !== 'all' && (
                <span className="applied-chip">
                  Brand: <strong>{BRAND_OPTIONS.find((b) => b.id === brandParam)?.label || brandParam}</strong>
                  <button type="button" onClick={() => handleBrandChange('all')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filterParam === 'new' && (
                <span className="applied-chip">
                  Collection: <strong>New Arrivals</strong>
                  <button
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.delete('filter')
                      setSearchParams(next)
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="applied-chip">
                  Search: <strong>"{searchTerm}"</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('')
                      const next = new URLSearchParams(searchParams)
                      next.delete('search')
                      setSearchParams(next)
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. SHOP TOOLBAR: COUNT & SORT CONTROLS                                    */}
        {/* ========================================================================= */}
        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            <span className="shop-product-count">
              Showing <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>

          <div className="shop-toolbar-right">
            <div className="shop-sort-wrap">
              <ArrowUpDown size={13} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shop-sort-select"
                aria-label="Sort products"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="newest">Sort by: Newest Releases</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A–Z</option>
              </select>
              <ChevronDown size={13} className="sort-chevron" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. MAIN PRODUCTS GRID / STATES                                            */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="products-loading-wrapper">
            <Loading text="Loading Nivora collection..." fullScreen={false} />
          </div>
        ) : error ? (
          <div className="products-error-card">
            <p>{error}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            title="No Products Found in This Filter"
            message={
              hasActiveFilters
                ? 'No products matched your combination of gender, brand, and category. Try clearing some filters to see more results.'
                : 'No products are currently available in this collection.'
            }
            actionText="View All Products"
            onAction={handleClearAllFilters}
          />
        ) : (
          <div className="editorial-products-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

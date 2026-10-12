import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

import './Footer.css'

export default function Footer() {
  return (
    <footer className="editorial-footer">
      <div className="container">
        {/* Main 5-Column Editorial Footer Grid */}
        <div className="footer-top-grid">
          {/* Brand Info Column */}
          <div className="footer-brand-column">
            <Link to="/" className="footer-brand-title">
              <img src="/logo.png" alt="Nivora Logo" className="footer-brand-logo-img" />
            </Link>
            <p className="footer-brand-manifesto">
              A curated multi-vendor marketplace celebrating honest design,
              enduring utility, and verified craftsmanship across technology, fashion,
              and everyday objects.
            </p>
            <div className="footer-badge-line">
              <ShieldCheck size={14} className="footer-shield" />
              <span>Verified Secure Checkout</span>
            </div>
          </div>

          {/* Column 1: SHOP */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Shop</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/products?filter=new" className="footer-nav-link">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/products" className="footer-nav-link">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="footer-nav-link">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="footer-nav-link">
                  Everyday Tech
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="footer-nav-link">
                  Wardrobe Essentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: ACCOUNT */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Account</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/login" className="footer-nav-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-nav-link">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-nav-link">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-nav-link">
                  Order Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: SELL */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Sell</h4>
            <ul className="footer-nav-list">
              <li>
                <Link to="/register" className="footer-nav-link">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-nav-link">
                  Vendor Login
                </Link>
              </li>
              <li>
                <a href="#standards" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  Marketplace Standards
                </a>
              </li>
              <li>
                <a href="#guidelines" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  Seller Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: HELP */}
          <div className="footer-nav-col">
            <h4 className="footer-col-title">Help</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="#about" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  About Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  Contact
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#shipping" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="footer-nav-link">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="footer-bottom-editorial">
          <div className="footer-bottom-left">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} NIVORA Marketplace Inc. All rights reserved.
            </p>
          </div>

          <div className="footer-social-links">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn"
              aria-label="Instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn"
              aria-label="Twitter / X"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn"
              aria-label="Facebook"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found-root">
      <div className="not-found-card">
        <div className="not-found-icon-box">
          <FileQuestion size={48} className="not-found-icon" />
        </div>
        <span className="not-found-status">Error 404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-description">
          The page you are looking for might have been moved, renamed, or is temporarily
          unavailable. Please verify the URL or return home.
        </p>

        <div className="not-found-actions">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" icon={Home}>
              Back to Home
            </Button>
          </Link>
          <Link to="/products" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md" icon={ArrowLeft}>
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

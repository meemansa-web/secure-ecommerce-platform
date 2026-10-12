import React from 'react'
import { X, Mail, CheckCircle2, Copy, Download } from 'lucide-react'
import './EmailPreviewModal.css'

export default function EmailPreviewModal({ email, isOpen, onClose }) {
  if (!isOpen || !email) return null

  const handleCopyHtml = () => {
    if (email.htmlBody) {
      navigator.clipboard.writeText(email.htmlBody)
      alert('Email HTML copied to clipboard!')
    }
  }

  return (
    <div className="email-modal-backdrop" onClick={onClose}>
      <div className="email-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="email-modal-header">
          <div className="email-header-meta">
            <div className="email-icon-chip">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="email-modal-title">Sent Email Delivery Preview</h3>
              <p className="email-modal-sub">
                Dispatched to customer's registered email address
              </p>
            </div>
          </div>

          <div className="email-modal-actions">
            <button
              type="button"
              className="email-action-btn"
              onClick={handleCopyHtml}
              title="Copy HTML Source"
            >
              <Copy size={15} />
              <span>Copy HTML</span>
            </button>
            <button
              type="button"
              className="email-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Envelope Metadata Bar */}
        <div className="email-envelope-info">
          <div className="envelope-row">
            <span className="envelope-key">To:</span>
            <span className="envelope-val to-val">{email.to}</span>
          </div>
          <div className="envelope-row">
            <span className="envelope-key">From:</span>
            <span className="envelope-val">{email.from || 'support@modimal.com'}</span>
          </div>
          <div className="envelope-row">
            <span className="envelope-key">Subject:</span>
            <span className="envelope-val subject-val">{email.subject}</span>
          </div>
          <div className="envelope-row">
            <span className="envelope-key">Date:</span>
            <span className="envelope-val">{email.date || 'Just now'}</span>
          </div>
        </div>

        {/* Rendered HTML Email Body */}
        <div className="email-body-viewport">
          <div
            className="email-html-render"
            dangerouslySetInnerHTML={{ __html: email.htmlBody }}
          />
        </div>

        {/* Footer */}
        <div className="email-modal-footer">
          <div className="email-status-badge">
            <CheckCircle2 size={15} color="#22c55e" />
            <span>Delivered to customer inbox registry</span>
          </div>
          <button type="button" className="email-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

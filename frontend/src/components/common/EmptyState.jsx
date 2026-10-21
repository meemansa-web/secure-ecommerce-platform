import React from 'react'
import { Inbox } from 'lucide-react'
import Button from './Button'
import './EmptyState.css'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no items to display at this moment.',
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`empty-state-card ${className}`}>
      <div className="empty-state-icon-wrapper">
        <Icon size={36} className="empty-state-icon" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <div className="empty-state-action">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

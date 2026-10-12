import React from 'react'
import { Loader2 } from 'lucide-react'
import './Loading.css'

export default function Loading({
  message = 'Loading content...',
  size = 'md',
  fullScreen = false,
}) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 36 : 28

  return (
    <div className={`loading-container ${fullScreen ? 'loading-fullscreen' : ''}`}>
      <div className="loading-spinner-wrapper">
        <Loader2 className="loading-spinner-icon" size={iconSize} />
      </div>
      {message && <p className={`loading-message loading-text-${size}`}>{message}</p>}
    </div>
  )
}

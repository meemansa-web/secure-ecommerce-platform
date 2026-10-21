import React from 'react'
import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'right',
  className = '',
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    disabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className="btn-icon btn-icon-left" size={size === 'sm' ? 14 : 16} />
      )}
      <span className="btn-label">{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className="btn-icon btn-icon-right" size={size === 'sm' ? 14 : 16} />
      )}
    </button>
  )
}

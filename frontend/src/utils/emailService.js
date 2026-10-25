/**
 * Email Service Utility
 * Dispatches authentic HTML emails for:
 * 1. User Registration & Welcome
 * 2. Order Confirmation & Itemized Tax Invoice
 * 3. One-Time Password (OTP) Login & Verification
 *
 * Saves dispatched emails to customer's in-app inbox (localStorage)
 * and fires custom events for real-time toast and preview modals.
 */

const STORAGE_PREFIX = 'customer_email_inbox_'

/**
 * Format currency in Indian Rupees
 */
const formatINR = (val) => {
  const num = Number(val) || 0
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Send Welcome Email on New User Registration
 */
export const sendRegistrationEmail = async ({
  email,
  name,
  role = 'CUSTOMER',
  username = '',
}) => {
  if (!email) return null

  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const emailId = `mail-reg-${Date.now()}`
  const subject = `Welcome to Nivora! Your ${role.toLowerCase()} account is ready 🎉`

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 24px; border-bottom: 2px solid #d4af37; text-align: center;">
        <h1 style="margin: 0; font-size: 26px; color: #d4af37; letter-spacing: 2px; text-transform: uppercase;">NIVORA</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 1px;">SHOP • DISCOVER • ENJOY</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #ffffff;">Namaste, ${name || 'Valued Member'}!</h2>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
          Thank you for creating an account with Nivora. Your <strong>${role}</strong> profile has been successfully registered and activated.
        </p>

        <div style="background: rgba(255, 255, 255, 0.04); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 20px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #d4af37;">Account Credentials & Overview</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #e2e8f0;">
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Registered Email:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #ffffff;">${email}</td>
            </tr>
            ${username ? `
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Username:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #ffffff;">${username}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Account Type:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #d4af37;">${role}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">Registration Date:</td>
              <td style="padding: 6px 0; text-align: right; color: #ffffff;">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
          You can now browse handcrafted Indian couture, fine jewelry, artisan home decor, and cutting-edge tech gadgets with exclusive member privileges.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="/products" style="display: inline-block; background: #d4af37; color: #0b0f19; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 6px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
            Start Shopping Now
          </a>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.4); padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        <p style="margin: 0 0 6px 0;">This email was sent to ${email} regarding your Nivora profile.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Nivora India E-Commerce Platform. All rights reserved.</p>
      </div>
    </div>
  `

  const emailObject = {
    id: emailId,
    type: 'REGISTRATION_WELCOME',
    to: email,
    from: 'support@nivora.com (Nivora Customer Concierge)',
    subject,
    date: formattedDate,
    timestamp: now.getTime(),
    htmlBody,
    previewSnippet: `Namaste, ${name || 'Valued Member'}! Welcome to Nivora. Your ${role} profile has been activated.`,
  }

  saveEmailToStorage(email, emailObject)
  notifyEmailDispatched(emailObject)

  return emailObject
}

/**
 * Send Tax Invoice & Order Confirmation Email
 */
export const sendOrderConfirmationEmail = async ({
  email,
  customerName = 'Valued Customer',
  orderId,
  orderDate,
  items = [],
  totalAmount = 0,
  shippingFee = 0,
  shippingAddress = {},
  paymentMethod = 'UPI',
}) => {
  if (!email) return null

  const now = new Date()
  const formattedDate =
    orderDate ||
    now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const emailId = `mail-ord-${orderId || Date.now()}`
  const subject = `Order Confirmed! Invoice for Order #${orderId || 'NEW'} — Nivora`

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <div style="font-weight: 600; color: #ffffff;">${item.name || item.productName || 'Curated Product'}</div>
          <div style="font-size: 12px; color: #94a3b8;">Qty: ${item.quantity || 1}</div>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; color: #ffffff; font-weight: 600;">
          ${formatINR(item.price || item.unitPrice || 0)}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); text-align: right; color: #d4af37; font-weight: 700;">
          ${formatINR((item.price || item.unitPrice || 0) * (item.quantity || 1))}
        </td>
      </tr>
    `
    )
    .join('')

  const addressText = typeof shippingAddress === 'string'
    ? shippingAddress
    : [
        shippingAddress.street || shippingAddress.addressLine,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postalCode || shippingAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ')

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px 24px; border-bottom: 2px solid #d4af37; text-align: center;">
        <h1 style="margin: 0; font-size: 26px; color: #d4af37; letter-spacing: 2px; text-transform: uppercase;">NIVORA</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 1px;">TAX INVOICE & ORDER CONFIRMATION</p>
      </div>

      <div style="padding: 32px 24px;">
        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <h2 style="margin: 0 0 4px 0; font-size: 18px; color: #4ade80;">✓ Order Placed Successfully</h2>
          <p style="margin: 0; font-size: 13px; color: #cbd5e1;">Order ID: <strong>#${orderId || 'ORD-9821'}</strong> • Placed on ${formattedDate}</p>
        </div>

        <p style="margin: 0 0 20px 0; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
          Dear <strong>${customerName}</strong>, thank you for your order. We are preparing your shipment with utmost care.
        </p>

        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #d4af37;">Order Summary & Purchased Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <thead>
            <tr style="background: rgba(255,255,255,0.04); color: #94a3b8; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: right;">Unit Price</th>
              <th style="padding: 8px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px 8px 4px; text-align: right; color: #94a3b8;">Delivery Fee:</td>
              <td style="padding: 10px 8px 4px; text-align: right; color: #4ade80; font-weight: 600;">
                ${shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 6px 8px; text-align: right; font-size: 16px; font-weight: 700; color: #ffffff;">Total Amount Paid:</td>
              <td style="padding: 6px 8px; text-align: right; font-size: 18px; font-weight: 800; color: #d4af37;">
                ${formatINR(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px;">Delivery Address</div>
            <div style="font-size: 13px; color: #ffffff; line-height: 1.5;">${addressText || 'Saved Customer Destination'}</div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px;">Payment Method</div>
            <div style="font-size: 13px; color: #ffffff; line-height: 1.5;">${paymentMethod} • <span style="color: #4ade80; font-weight: 600;">Verified</span></div>
          </div>
        </div>

        <div style="text-align: center; margin: 28px 0 10px 0;">
          <a href="/customer/orders" style="display: inline-block; background: #d4af37; color: #0b0f19; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">
            Track Order Details
          </a>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.4); padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        <p style="margin: 0 0 4px 0;">Sent to ${email} for Order #${orderId || 'ORD-9821'}.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Nivora India E-Commerce Platform. All rights reserved.</p>
      </div>
    </div>
  `

  const emailObject = {
    id: emailId,
    type: 'ORDER_CONFIRMATION',
    to: email,
    from: 'orders@nivora.com (Nivora Order Processing)',
    subject,
    date: formattedDate,
    timestamp: now.getTime(),
    htmlBody,
    previewSnippet: `Order #${orderId || 'ORD-9821'} confirmed! Total paid: ${formatINR(totalAmount)}. Preparing shipment for ${customerName}.`,
    orderDetails: {
      orderId,
      itemsCount: items.length,
      totalAmount,
      customerName,
      addressText,
    },
  }

  saveEmailToStorage(email, emailObject)
  notifyEmailDispatched(emailObject)

  return emailObject
}

/**
 * Send / Preview OTP Dispatch Notification (Email or SMS)
 */
export const sendOtpDispatchNotification = async ({
  identifier,
  otpCode,
  channel = 'EMAIL',
  maskedIdentifier = '',
}) => {
  if (!identifier || !otpCode) return null

  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const emailId = `mail-otp-${Date.now()}`
  const isEmail = channel === 'EMAIL'
  const subject = isEmail
    ? `Your Nivora Sign-In Verification Code: ${otpCode}`
    : `SMS OTP Alert for ${maskedIdentifier || identifier}`

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
      <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 26px 20px; border-bottom: 2px solid #d4af37; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #d4af37; letter-spacing: 2px; text-transform: uppercase;">NIVORA</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; letter-spacing: 1px;">AUTHENTICATION & SECURITY</p>
      </div>

      <div style="padding: 30px 24px; text-align: center;">
        <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #ffffff;">Your One-Time Password (OTP)</h2>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1; line-height: 1.5;">
          Use the secure 6-digit verification code below to complete your sign-in to Nivora.
        </p>

        <div style="background: rgba(212, 175, 55, 0.1); border: 2px dashed #d4af37; border-radius: 12px; padding: 20px; margin: 0 auto 24px auto; max-width: 320px;">
          <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #d4af37; font-family: monospace;">
            ${otpCode}
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">
            Valid for <strong>5 minutes</strong> only
          </p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.04); border-radius: 8px; padding: 14px; text-align: left; font-size: 13px; color: #94a3b8; line-height: 1.5;">
          <div style="color: #cbd5e1; font-weight: 600; margin-bottom: 4px;">Security Information:</div>
          <div>• Sent to: <strong style="color: #fff;">${maskedIdentifier || identifier}</strong> via <strong>${channel}</strong></div>
          <div>• If you did not initiate this request, please disregard this notification.</div>
        </div>
      </div>

      <div style="background: rgba(0, 0, 0, 0.4); padding: 16px 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        <p style="margin: 0;">© ${new Date().getFullYear()} Nivora India E-Commerce Platform. All rights reserved.</p>
      </div>
    </div>
  `

  const emailObject = {
    id: emailId,
    type: 'OTP_VERIFICATION',
    to: identifier,
    from: isEmail ? 'security@nivora.com (Nivora Security)' : 'NIVORA-SMS-GATEWAY',
    subject,
    date: formattedDate,
    timestamp: now.getTime(),
    htmlBody,
    previewSnippet: `Your Nivora verification code is ${otpCode}. Valid for 5 minutes.`,
    otpCode,
  }

  saveEmailToStorage(identifier, emailObject)
  notifyEmailDispatched(emailObject)

  return emailObject
}

/**
 * Storage Helpers
 */
const saveEmailToStorage = (email, emailObject) => {
  try {
    const key = `${STORAGE_PREFIX}${email.toLowerCase().trim()}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const updated = [emailObject, ...existing].slice(0, 50)
    localStorage.setItem(key, JSON.stringify(updated))
    localStorage.setItem('modimal_last_dispatched_email', JSON.stringify(emailObject))
  } catch (err) {
    console.warn('Failed to save email to local storage', err)
  }
}

/**
 * Retrieve inbox for given email
 */
export const getEmailInbox = (email) => {
  if (!email) return []
  try {
    const key = `${STORAGE_PREFIX}${email.toLowerCase().trim()}`
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

/**
 * Get latest dispatched email
 */
export const getLastDispatchedEmail = () => {
  try {
    const raw = localStorage.getItem('modimal_last_dispatched_email')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Trigger global window event so any UI component can display a toast or preview button
 */
const notifyEmailDispatched = (emailObject) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('modimal_email_dispatched', {
      detail: emailObject,
    })
    window.dispatchEvent(event)
  }
}

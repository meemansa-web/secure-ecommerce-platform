import axiosInstance from './axiosInstance'

/**
 * Register a new customer
 * @param {Object} customerData
 * @param {string} customerData.firstName
 * @param {string} customerData.lastName
 * @param {string} customerData.username
 * @param {string} customerData.email
 * @param {string} [customerData.phoneNumber]
 * @param {string} customerData.password
 * @returns {Promise<Object>} RegisterResponse
 */
export const registerCustomer = async (customerData) => {
  const payload = {
    ...customerData,
    email: (customerData.email || '').trim().toLowerCase(),
    username: (customerData.username || '').trim(),
    firstName: (customerData.firstName || '').trim(),
    lastName: (customerData.lastName || '').trim(),
  }
  const response = await axiosInstance.post('/api/auth/register', payload)
  return response.data
}

/**
 * Register a new vendor (requires business info, pending admin approval)
 * @param {Object} vendorData
 * @param {string} vendorData.firstName
 * @param {string} vendorData.lastName
 * @param {string} vendorData.username
 * @param {string} vendorData.email
 * @param {string} vendorData.password
 * @param {string} vendorData.businessName
 * @param {string} vendorData.businessEmail
 * @param {string} vendorData.businessPhone
 * @param {string} vendorData.businessAddress
 * @returns {Promise<Object>} VendorRegistrationResponse
 */
export const registerVendor = async (vendorData) => {
  const payload = {
    ...vendorData,
    email: (vendorData.email || '').trim().toLowerCase(),
    businessEmail: (vendorData.businessEmail || '').trim().toLowerCase(),
  }
  const response = await axiosInstance.post('/api/vendors/register', payload)
  return response.data
}

/**
 * Log in a customer or user using email and password
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{accessToken: string, tokenType: string, userId: number, name: string, email: string, role: string}>}
 */
export const loginCustomer = async ({ email, password }) => {
  const normalizedEmail = (email || '').trim().toLowerCase()
  const response = await axiosInstance.post('/api/auth/login', {
    email: normalizedEmail,
    password,
  })
  return response.data
}

/**
 * Send an OTP verification code to Email or Mobile Phone
 * @param {Object} payload
 * @param {string} payload.identifier - Email address or 10-digit mobile number
 * @param {string} [payload.purpose] - Defaults to 'LOGIN'
 * @returns {Promise<{success: boolean, message: string, maskedIdentifier: string, channel: string, expiresInSeconds: number}>}
 */
export const sendLoginOtp = async ({ identifier, purpose = 'LOGIN' }) => {
  const clean = (identifier || '').trim()
  const normalized = clean.includes('@') ? clean.toLowerCase() : clean
  const response = await axiosInstance.post('/api/auth/otp/send', {
    identifier: normalized,
    purpose,
  })
  return response.data
}

/**
 * Verify OTP code and authenticate the user
 * @param {Object} payload
 * @param {string} payload.identifier - Email address or 10-digit mobile number
 * @param {string} payload.otpCode - 6-digit OTP code
 * @returns {Promise<{accessToken: string, tokenType: string, userId: number, name: string, email: string, role: string}>}
 */
export const verifyOtpLogin = async ({ identifier, otpCode }) => {
  const clean = (identifier || '').trim()
  const normalized = clean.includes('@') ? clean.toLowerCase() : clean
  const cleanOtp = (otpCode || '').trim()
  const response = await axiosInstance.post('/api/auth/otp/verify-login', {
    identifier: normalized,
    otpCode: cleanOtp,
  })
  return response.data
}

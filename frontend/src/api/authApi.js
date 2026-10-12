import axiosInstance from './axiosInstance'

/**
 * Register a new customer
 * @param {Object} customerData
 * @param {string} customerData.firstName
 * @param {string} customerData.lastName
 * @param {string} customerData.username
 * @param {string} customerData.email
 * @param {string} customerData.password
 * @returns {Promise<Object>} RegisterResponse
 */
export const registerCustomer = async (customerData) => {
  const response = await axiosInstance.post('/api/auth/register', customerData)
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
  const response = await axiosInstance.post('/api/vendors/register', vendorData)
  return response.data
}

/**
 * Log in a customer or user
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{accessToken: string, tokenType: string, userId: number, name: string, email: string, role: string}>}
 */
export const loginCustomer = async (credentials) => {
  const response = await axiosInstance.post('/api/auth/login', credentials)
  return response.data
}




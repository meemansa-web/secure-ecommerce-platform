import axiosInstance from './axiosInstance'

/**
 * Customer Profile & Account Service
 * Provides access to customer-specific endpoints
 */

/**
 * Fetch the profile of the currently authenticated customer
 * GET /api/user/me
 */
export const getCustomerProfile = async () => {
  const response = await axiosInstance.get('/api/user/me')
  return response.data
}

export const getCurrentUserProfile = getCustomerProfile


import axiosInstance from './axiosInstance'

/* ==============================================================================
   ADMIN PROFILE & SECURITY APIS
   ============================================================================== */

/**
 * Fetch the authenticated administrator's profile
 * GET /api/admin/profile
 */
export const getAdminProfile = async () => {
  const response = await axiosInstance.get('/api/admin/profile')
  return response.data
}

/**
 * Update the administrator's profile
 * PUT /api/admin/profile
 * @param {{ firstName: string, lastName: string, username: string }} data
 */
export const updateAdminProfile = async (data) => {
  const response = await axiosInstance.put('/api/admin/profile', data)
  return response.data
}

/**
 * Change administrator password
 * PUT /api/admin/change-password
 * @param {{ currentPassword: string, newPassword: string, confirmPassword: string }} data
 */
export const adminChangePassword = async (data) => {
  const response = await axiosInstance.put('/api/admin/change-password', data)
  return response.data
}

/* ==============================================================================
   CUSTOMER MANAGEMENT APIS
   ============================================================================== */

/**
 * List all customers in the system
 * GET /api/admin/customers
 */
export const getAllCustomers = async () => {
  const response = await axiosInstance.get('/api/admin/customers')
  return response.data
}

/**
 * Get detailed customer profile by ID
 * GET /api/admin/customers/{customerId}
 * @param {number|string} customerId
 */
export const getCustomerById = async (customerId) => {
  const response = await axiosInstance.get(`/api/admin/customers/${customerId}`)
  return response.data
}

/**
 * Disable a customer account
 * PUT /api/admin/customers/{customerId}/disable
 * @param {number|string} customerId
 */
export const disableCustomer = async (customerId) => {
  const response = await axiosInstance.put(`/api/admin/customers/${customerId}/disable`)
  return response.data
}

/**
 * Enable a customer account
 * PUT /api/admin/customers/{customerId}/enable
 * @param {number|string} customerId
 */
export const enableCustomer = async (customerId) => {
  const response = await axiosInstance.put(`/api/admin/customers/${customerId}/enable`)
  return response.data
}

/* ==============================================================================
   VENDOR MANAGEMENT APIS
   ============================================================================== */

/**
 * List all vendors registered in the platform
 * GET /api/admin/vendors
 */
export const getAllVendors = async () => {
  const response = await axiosInstance.get('/api/admin/vendors')
  return response.data
}

/**
 * Get vendor details by vendor ID
 * GET /api/admin/vendors/{vendorId}
 * @param {number|string} vendorId
 */
export const getVendorById = async (vendorId) => {
  const response = await axiosInstance.get(`/api/admin/vendors/${vendorId}`)
  return response.data
}

/**
 * List all pending vendor applications awaiting approval
 * GET /api/admin/vendors/pending
 */
export const getPendingVendors = async () => {
  const response = await axiosInstance.get('/api/admin/vendors/pending')
  return response.data
}

/**
 * Approve a pending vendor application
 * PUT /api/admin/vendors/{vendorId}/approve
 * @param {number|string} vendorId
 */
export const approveVendor = async (vendorId) => {
  const response = await axiosInstance.put(`/api/admin/vendors/${vendorId}/approve`)
  return response.data
}

/**
 * Reject a pending vendor application
 * PUT /api/admin/vendors/{vendorId}/reject
 * @param {number|string} vendorId
 */
export const rejectVendor = async (vendorId) => {
  const response = await axiosInstance.put(`/api/admin/vendors/${vendorId}/reject`)
  return response.data
}

/* ==============================================================================
   CATEGORY MANAGEMENT APIS
   ============================================================================== */

/**
 * List all categories for administration (active & inactive)
 * GET /api/admin/categories
 */
export const getAllAdminCategories = async () => {
  const response = await axiosInstance.get('/api/admin/categories')
  return response.data
}

/**
 * Create a new product category
 * POST /api/admin/categories
 * @param {{ name: string, description: string }} data
 */
export const createCategory = async (data) => {
  const response = await axiosInstance.post('/api/admin/categories', data)
  return response.data
}

/**
 * Update an existing product category
 * PUT /api/admin/categories/{id}
 * @param {number|string} id
 * @param {{ name: string, description: string }} data
 */
export const updateCategory = async (id, data) => {
  const response = await axiosInstance.put(`/api/admin/categories/${id}`, data)
  return response.data
}

/**
 * Activate an inactive category
 * PUT /api/admin/categories/{id}/activate
 * @param {number|string} id
 */
export const activateCategory = async (id) => {
  const response = await axiosInstance.put(`/api/admin/categories/${id}/activate`)
  return response.data
}

/**
 * Deactivate an active category
 * PUT /api/admin/categories/{id}/deactivate
 * @param {number|string} id
 */
export const deactivateCategory = async (id) => {
  const response = await axiosInstance.put(`/api/admin/categories/${id}/deactivate`)
  return response.data
}

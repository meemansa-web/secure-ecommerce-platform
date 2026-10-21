import axiosInstance from './axiosInstance'

/**
 * ==============================================================================
 * MODIMAL VENDOR API CLIENT
 * Connects to Spring Boot Vendor endpoints:
 * - /api/vendor/profile
 * - /api/vendor/change-password
 * - /api/vendor/products
 * - /api/vendor/inventory
 * - /api/categories
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// Vendor Profile & Settings
// ------------------------------------------------------------------------------

export const getVendorProfile = async () => {
  const response = await axiosInstance.get('/api/vendor/profile')
  return response.data
}

export const updateVendorProfile = async (profileData) => {
  const response = await axiosInstance.put('/api/vendor/profile', profileData)
  return response.data
}

export const changeVendorPassword = async (passwordData) => {
  const response = await axiosInstance.put('/api/vendor/change-password', passwordData)
  return response.data
}

// ------------------------------------------------------------------------------
// Vendor Products
// ------------------------------------------------------------------------------

export const getVendorProducts = async () => {
  const response = await axiosInstance.get('/api/vendor/products')
  return response.data
}

export const getVendorProductById = async (productId) => {
  const response = await axiosInstance.get(`/api/vendor/products/${productId}`)
  return response.data
}

export const createVendorProduct = async (productData) => {
  const response = await axiosInstance.post('/api/vendor/products', productData)
  return response.data
}

export const updateVendorProduct = async (productId, productData) => {
  const response = await axiosInstance.put(`/api/vendor/products/${productId}`, productData)
  return response.data
}

export const deactivateVendorProduct = async (productId) => {
  const response = await axiosInstance.put(`/api/vendor/products/${productId}/deactivate`)
  return response.data
}

export const activateVendorProduct = async (productId) => {
  const response = await axiosInstance.put(`/api/vendor/products/${productId}/activate`)
  return response.data
}

// ------------------------------------------------------------------------------
// Vendor Inventory
// ------------------------------------------------------------------------------

export const getVendorInventory = async (productId) => {
  const response = await axiosInstance.get(`/api/vendor/inventory/${productId}`)
  return response.data
}

export const setVendorInventory = async (productId, inventoryData) => {
  const response = await axiosInstance.put(`/api/vendor/inventory/${productId}`, inventoryData)
  return response.data
}

export const increaseVendorStock = async (productId, quantity) => {
  const response = await axiosInstance.put(`/api/vendor/inventory/${productId}/increase`, {
    quantity: Number(quantity),
  })
  return response.data
}

export const decreaseVendorStock = async (productId, quantity) => {
  const response = await axiosInstance.put(`/api/vendor/inventory/${productId}/decrease`, {
    quantity: Number(quantity),
  })
  return response.data
}

export const getLowStockProducts = async () => {
  const response = await axiosInstance.get('/api/vendor/inventory/low-stock')
  return response.data
}

// ------------------------------------------------------------------------------
// Active Categories for Product Creation / Editing
// ------------------------------------------------------------------------------

export const getActiveCategories = async () => {
  const response = await axiosInstance.get('/api/categories')
  return response.data
}

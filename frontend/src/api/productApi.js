import axiosInstance from './axiosInstance'

/**
 * Fetch all active products
 * Backend endpoint: GET /api/products
 * @returns {Promise<Array>} List of ProductResponse
 */
export const getAllProducts = async () => {
  const response = await axiosInstance.get('/api/products')
  return response.data
}

/**
 * Fetch single active product by ID
 * Backend endpoint: GET /api/products/{productId}
 * @param {number|string} productId
 * @returns {Promise<Object>} ProductResponse
 */
export const getProductById = async (productId) => {
  const response = await axiosInstance.get(`/api/products/${productId}`)
  return response.data
}

/**
 * Fetch active products by category ID
 * Backend endpoint: GET /api/products/category/{categoryId}
 * @param {number|string} categoryId
 * @returns {Promise<Array>} List of ProductResponse
 */
export const getProductsByCategory = async (categoryId) => {
  const response = await axiosInstance.get(`/api/products/category/${categoryId}`)
  return response.data
}

/**
 * Fetch product inventory and stock availability
 * Backend endpoint: GET /api/inventory/product/{productId}
 * @param {number|string} productId
 * @returns {Promise<Object>} InventoryResponse
 */
export const getProductInventory = async (productId) => {
  const response = await axiosInstance.get(`/api/inventory/product/${productId}`)
  return response.data
}

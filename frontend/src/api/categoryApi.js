import axiosInstance from './axiosInstance'

/**
 * Fetch all active categories
 * Backend endpoint: GET /api/categories
 * @returns {Promise<Array>} List of CategoryResponse
 */
export const getAllCategories = async () => {
  const response = await axiosInstance.get('/api/categories')
  return response.data
}

/**
 * Fetch single category by ID
 * Backend endpoint: GET /api/categories/{id}
 * @param {number|string} id
 * @returns {Promise<Object>} CategoryResponse
 */
export const getCategoryById = async (id) => {
  const response = await axiosInstance.get(`/api/categories/${id}`)
  return response.data
}

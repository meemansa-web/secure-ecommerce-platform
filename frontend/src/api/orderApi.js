import axiosInstance from './axiosInstance'

/**
 * Customer Order & Payment Service
 * Interacts with /api/customer/orders endpoints
 */

/**
 * Place a new order with payment
 * POST /api/customer/orders
 * @param {Object} orderData { items: [{ productId, quantity }], shippingAddress, paymentMethod }
 */
export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/api/customer/orders', orderData)
  return response.data
}

/**
 * Get all orders placed by the authenticated customer
 * GET /api/customer/orders
 */
export const getCustomerOrders = async () => {
  const response = await axiosInstance.get('/api/customer/orders')
  return response.data
}

/**
 * Get details of a specific order by ID
 * GET /api/customer/orders/:orderId
 * @param {number|string} orderId
 */
export const getCustomerOrderById = async (orderId) => {
  const response = await axiosInstance.get(`/api/customer/orders/${orderId}`)
  return response.data
}

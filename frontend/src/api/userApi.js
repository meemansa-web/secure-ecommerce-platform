import axiosInstance from './axiosInstance'

/**
 * Fetch the profile of the currently authenticated user
 * Backend endpoint: GET /api/user/me
 * @returns {Promise<{id: number, username: string, email: string, firstName: string, lastName: string, role: string}>}
 */
export const getCurrentUserProfile = async () => {
  const response = await axiosInstance.get('/api/user/me')
  return response.data
}

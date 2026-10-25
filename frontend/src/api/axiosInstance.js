import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor to automatically attach JWT Bearer token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      if (token.startsWith('google_jwt_') || token.startsWith('otp_jwt_')) {
        // Purge legacy mock token from browser storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized and not an auth attempt, session may be expired
    if (error.response?.status === 401) {
      const isAuthUrl = error.config?.url?.includes('/api/auth/')
      if (!isAuthUrl) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance


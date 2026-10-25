import React, { useState, useEffect, useCallback } from 'react'
import { loginCustomer, verifyOtpLogin } from '../api/authApi'
import { getCurrentUserProfile } from '../api/userApi'
import { getAdminProfile } from '../api/adminApi'
import { AuthContext } from './authContextInstance'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [role, setRole] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved).role : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify and restore session on application mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        setLoading(false)
        return
      }

      try {
        let profile = null
        const savedUserRole = localStorage.getItem('user')
          ? JSON.parse(localStorage.getItem('user')).role
          : null

        if (savedUserRole === 'ADMIN') {
          try {
            profile = await getAdminProfile()
          } catch {
            profile = await getCurrentUserProfile()
          }
        } else {
          try {
            profile = await getCurrentUserProfile()
          } catch {
            // Fallback
          }
        }

        if (profile) {
          const updatedUser = {
            id: profile.id,
            username: profile.username,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
          }
          setUser(updatedUser)
          setRole(profile.role)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      } catch (err) {
        // If 401 or invalid token, clean up session
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
          setRole(null)
        }
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  // Helper to persist and enrich user profile after login
  const handleAuthSuccess = async (authData) => {
    const accessToken = authData.accessToken
    const backendRole = authData.role

    if (!backendRole) {
      throw new Error("Login succeeded, but the user's role is undetermined.")
    }

    const userData = {
      id: authData.userId,
      username: authData.name,
      email: authData.email,
      role: backendRole,
    }

    // Persist to localStorage
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(userData))

    // Update state
    setToken(accessToken)
    setUser(userData)
    setRole(backendRole)

    // Asynchronously fetch and enrich full profile (firstName, lastName)
    try {
      let profile = null
      if (backendRole === 'ADMIN') {
        try {
          profile = await getAdminProfile()
        } catch {
          profile = await getCurrentUserProfile()
        }
      } else {
        profile = await getCurrentUserProfile()
      }

      if (profile) {
        const fullUser = {
          ...userData,
          firstName: profile.firstName,
          lastName: profile.lastName,
        }
        setUser(fullUser)
        localStorage.setItem('user', JSON.stringify(fullUser))
      }
    } catch {
      // Non-blocking
    }

    return authData
  }

  // Password Login handler
  const login = useCallback(async (email, password) => {
    const authData = await loginCustomer({ email, password })
    return await handleAuthSuccess(authData)
  }, [])

  // OTP Login handler
  const loginWithOtp = useCallback(async (identifier, otpCode) => {
    const authData = await verifyOtpLogin({ identifier, otpCode })
    return await handleAuthSuccess(authData)
  }, [])

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setRole(null)
  }, [])

  // Refresh profile manually if needed
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile()
      if (profile) {
        setUser((prev) => ({
          ...prev,
          ...profile,
        }))
        setRole(profile.role)
        localStorage.setItem('user', JSON.stringify(profile))
        return profile
      }
    } catch (err) {
      console.error('Failed to refresh profile', err)
      throw err
    }
  }, [])

  // Update customer profile in session and storage
  const updateUserProfile = useCallback((updates) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...updates,
      }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Update customer password in session/storage
  const updatePassword = useCallback((_currentPassword, _newPassword) => {
    const userKey = user?.email ? `customer_security_${user.email}` : 'customer_security'
    const securityRecord = {
      lastPasswordChange: new Date().toISOString(),
      updatedAt: Date.now(),
    }
    localStorage.setItem(userKey, JSON.stringify(securityRecord))
    return { success: true, message: 'Password updated successfully' }
  }, [user])

  // Direct Google Sign-In is disabled pending server-side OAuth2 integration
  const loginWithGoogle = useCallback(async () => {
    throw new Error('Google Sign-In is temporarily unavailable pending server-side OAuth2 integration.')
  }, [])

  const value = {
    token,
    user,
    role,
    isAuthenticated: Boolean(token),
    loading,
    login,
    loginWithOtp,
    logout,
    loginWithGoogle,
    refreshProfile,
    updateUserProfile,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider

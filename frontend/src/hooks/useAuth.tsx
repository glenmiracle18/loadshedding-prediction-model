import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, setToken, removeToken, getToken, setSessionExpiredCallback } from '../lib/api'
import type { User, LoginRequest, RegisterRequest } from '../lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiredNotification, setSessionExpiredNotification] = useState(false)

  // Handle session expiry
  const handleSessionExpiry = useCallback(() => {
    console.log('Session expired, logging out user')
    removeToken()
    setUser(null)
    setSessionExpiredNotification(true)
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setSessionExpiredNotification(false)
    }, 5000)
  }, [])

  // Initialize auth state
  useEffect(() => {
    // Set up session expiry callback
    setSessionExpiredCallback(handleSessionExpiry)
    
    const token = getToken()
    if (token) {
      validateToken()
    } else {
      setLoading(false)
    }
  }, [handleSessionExpiry])

  const validateToken = async () => {
    try {
      const response = await authApi.getCurrentUser()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        // Token is invalid, remove it
        removeToken()
        setUser(null)
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      removeToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    setLoading(true)
    try {
      const response = await authApi.login(credentials)
      
      if (response.success && response.data) {
        setToken(response.data.access_token)
        // Get user info after successful login
        const userResponse = await authApi.getCurrentUser()
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data)
          return { success: true }
        }
      }
      
      return { 
        success: false, 
        error: response.error || 'Login failed' 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error during login' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setLoading(true)
    try {
      const response = await authApi.register(data)
      
      if (response.success) {
        return { success: true }
      }
      
      return { 
        success: false, 
        error: response.error || 'Registration failed' 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error during registration' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    // Call logout endpoint for logging purposes
    authApi.logout().catch(console.error)
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session Expired Notification */}
      {sessionExpiredNotification && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xs">
              !
            </div>
            <div>
              <p className="font-medium">Session Expired</p>
              <p className="text-sm opacity-90">Please sign in again to continue</p>
            </div>
            <button
              onClick={() => setSessionExpiredNotification(false)}
              className="ml-2 text-white hover:text-gray-200 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
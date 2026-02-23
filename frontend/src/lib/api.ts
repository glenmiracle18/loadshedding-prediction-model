export const API_BASE_URL = 'http://localhost:8000/api/v1'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface PredictionRequest {
  location: string
  datetime: string
  temperature?: number
  humidity?: number
  wind_speed?: number
  demand_forecast?: number
  generation_capacity?: number
  historical_avg?: number
}

export interface PredictionResponse {
  id: number
  predicted_stage: number
  confidence_score: number
  model_used: string
  location: string
  datetime: string
  created_at: string
}

export interface CostCalculationRequest {
  location: string
  household_size: number
  monthly_consumption: number
  backup_solution?: string
}

export interface CostCalculationResponse {
  id: number
  location: string
  household_size: number
  monthly_consumption: number
  backup_solution?: string
  backup_cost: number
  fuel_cost_monthly?: number
  equipment_cost?: number
  maintenance_cost_yearly?: number
  total_yearly_cost: number
  potential_savings?: number
  payback_period_months?: number
  created_at: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  database: string
  cache: string
  ml_models: Record<string, string>
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token)
}

export const removeToken = (): void => {
  localStorage.removeItem('auth_token')
}

export const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Session expiry callback - will be set by AuthProvider
let onSessionExpired: (() => void) | null = null

export function setSessionExpiredCallback(callback: () => void) {
  onSessionExpired = callback
}

// Generic API request handler
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      ...options,
    })

    if (!response.ok) {
      // Handle session expiry (401 Unauthorized)
      if (response.status === 401) {
        // Trigger logout for expired sessions
        if (onSessionExpired) {
          onSessionExpired()
        }
        return {
          success: false,
          error: 'Session expired. Please sign in again.',
        }
      }

      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// Authentication API
export const authApi = {
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return apiRequest<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiRequest<User>('/auth/me')
  },

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return apiRequest('/auth/logout', { method: 'POST' })
  },
}

// Predictions API
export const predictionsApi = {
  async createPrediction(data: PredictionRequest): Promise<ApiResponse<PredictionResponse>> {
    return apiRequest<PredictionResponse>('/predictions/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getUserPredictions(limit = 10, offset = 0): Promise<ApiResponse<PredictionResponse[]>> {
    return apiRequest<PredictionResponse[]>(`/predictions/?limit=${limit}&offset=${offset}`)
  },

  async getPrediction(id: number): Promise<ApiResponse<PredictionResponse>> {
    return apiRequest<PredictionResponse>(`/predictions/${id}`)
  },

  async deletePrediction(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/predictions/${id}`, { method: 'DELETE' })
  },

  async createBatchPredictions(
    predictions: PredictionRequest[]
  ): Promise<ApiResponse<PredictionResponse[]>> {
    return apiRequest<PredictionResponse[]>('/predictions/batch', {
      method: 'POST',
      body: JSON.stringify(predictions),
    })
  },
}

// Cost Calculator API
export const costsApi = {
  async calculateCost(data: CostCalculationRequest): Promise<ApiResponse<CostCalculationResponse>> {
    return apiRequest<CostCalculationResponse>('/costs/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Health API
export const healthApi = {
  async checkHealth(): Promise<ApiResponse<HealthResponse>> {
    return apiRequest<HealthResponse>('/health')
  },
}
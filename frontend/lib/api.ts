import axios, { AxiosResponse } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken })
          const { token } = response.data.data
          localStorage.setItem('token', token)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post('/auth/register', data),
  login: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post('/auth/login', data),
  logout: (): Promise<AxiosResponse> => api.post('/auth/logout'),
  getMe: (): Promise<AxiosResponse> => api.get('/auth/me'),
  refreshToken: (refreshToken: string): Promise<AxiosResponse> => api.post('/auth/refresh-token', { refreshToken })
}

// Stores API
export const storeApi = {
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get('/stores', { params }),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/stores/${id}`),
  create: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post('/stores', data),
  update: (id: string, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/stores/${id}`, data),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/stores/${id}`)
}

// Products API
export const productApi = {
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get('/products', { params }),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/products/${id}`),
  create: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post('/products', data),
  update: (id: string, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/products/${id}`, data),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/products/${id}`)
}

// Orders API
export const orderApi = {
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get('/orders', { params }),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post('/orders', data),
  updateStatus: (id: string, status: string): Promise<AxiosResponse> => api.put(`/orders/${id}/status`, { orderStatus: status })
}

// Categories API
export const categoryApi = {
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get('/categories', { params }),
  create: (data: Record<string, unknown>): Promise<AxiosResponse> => api.post('/categories', data),
  update: (id: string, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/categories/${id}`, data),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/categories/${id}`)
}

// Users API
export const userApi = {
  getAll: (params?: Record<string, unknown>): Promise<AxiosResponse> => api.get('/users', { params }),
  getById: (id: string): Promise<AxiosResponse> => api.get(`/users/${id}`),
  updateProfile: (data: Record<string, unknown>): Promise<AxiosResponse> => api.put('/users/profile', data),
  update: (id: string, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/users/${id}`, data),
  delete: (id: string): Promise<AxiosResponse> => api.delete(`/users/${id}`)
}

export default api

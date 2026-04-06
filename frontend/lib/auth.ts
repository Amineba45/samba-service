import { authApi } from './api'

export const getCurrentUser = async () => {
  try {
    const response = await authApi.getMe()
    return response.data.data
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

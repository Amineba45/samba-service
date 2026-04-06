import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from './useStore'
import { loginSuccess, logout } from '@/lib/store/slices/authSlice'
import { authApi } from '@/lib/api'

export function useAuth() {
  const { user, token, isAuthenticated } = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    if (token && !isAuthenticated) {
      authApi.getMe()
        .then(response => {
          dispatch(loginSuccess({ ...response.data.data, token }))
        })
        .catch(() => {
          dispatch(logout())
        })
    }
  }, [token, isAuthenticated, dispatch])

  const signOut = async () => {
    try {
      await authApi.logout()
    } catch {
      // Continue even if API call fails
    } finally {
      dispatch(logout())
      router.push('/login')
    }
  }

  return { user, token, isAuthenticated, signOut }
}

export function useRequireAuth(requiredRole?: string) {
  const { isAuthenticated, user } = useAppSelector(state => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, requiredRole, router])

  return { user, isAuthenticated }
}

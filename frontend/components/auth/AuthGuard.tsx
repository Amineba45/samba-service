'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/hooks/useStore'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'customer' | 'store_admin' | 'super_admin'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

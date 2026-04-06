'use client'

import Link from 'next/link'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useStore'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const { totalItems } = useCart()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            🛒 Samba Service
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/stores" className="text-gray-600 hover:text-primary-600 transition-colors">
              Magasins
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/cart" className="relative text-gray-600 hover:text-primary-600">
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.firstName}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-100">
            <Link href="/stores" className="block text-gray-600 hover:text-primary-600 py-2">
              Magasins
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="block text-gray-600 hover:text-primary-600 py-2">
                  Panier ({totalItems})
                </Link>
                <button onClick={signOut} className="block text-red-600 py-2">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-600 py-2">Connexion</Link>
                <Link href="/register" className="block text-primary-600 font-medium py-2">S&apos;inscrire</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

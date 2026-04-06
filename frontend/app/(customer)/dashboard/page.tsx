'use client'

import { useAppSelector } from '@/hooks/useStore'
import { ShoppingCart, Package, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export default function CustomerDashboard() {
  const { user } = useAppSelector(state => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600 mt-1">Que souhaitez-vous commander aujourd&apos;hui ?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: ShoppingCart, label: 'Commander', href: '/stores', color: 'bg-primary-100 text-primary-600' },
            { icon: Package, label: 'Mes commandes', href: '/orders', color: 'bg-blue-100 text-blue-600' },
            { icon: MapPin, label: 'Magasins proches', href: '/stores', color: 'bg-green-100 text-green-600' },
            { icon: Clock, label: 'En cours', href: '/orders?status=active', color: 'bg-orange-100 text-orange-600' }
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center gap-3"
            >
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-gray-900">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

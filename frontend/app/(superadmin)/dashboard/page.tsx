'use client'

import { useEffect, useState } from 'react'
import { Store, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import { storeApi, userApi } from '@/lib/api'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ stores: 0, users: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [storesRes, usersRes] = await Promise.all([
          storeApi.getAll({}),
          userApi.getAll({})
        ])
        setStats(prev => ({
          ...prev,
          stores: storesRes.data.count,
          users: usersRes.data.total
        }))
      } catch {
        // Handle error silently
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { title: 'Magasins actifs', value: stats.stores, icon: Store, color: 'text-primary-600 bg-primary-100' },
    { title: 'Utilisateurs', value: stats.users, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { title: 'Commandes totales', value: stats.orders, icon: ShoppingBag, color: 'text-green-600 bg-green-100' },
    { title: 'Chiffre d\'affaires', value: `${stats.revenue.toLocaleString()} FCFA`, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">SuperAdmin - Vue globale</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-600 mt-1">{card.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

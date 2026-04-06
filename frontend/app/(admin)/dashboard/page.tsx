'use client'

import { useEffect, useState } from 'react'
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { orderApi } from '@/lib/api'
import { useAppSelector } from '@/hooks/useStore'

interface Stats {
  totalOrders: number
  pendingOrders: number
  revenue: number
  totalProducts: number
}

export default function AdminDashboard() {
  const { user } = useAppSelector(state => state.auth)
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    totalProducts: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await orderApi.getAll({ storeId: user?.storeId })
        const orders = response.data.data
        setStats({
          totalOrders: response.data.total,
          pendingOrders: orders.filter((o: { orderStatus: string }) => o.orderStatus === 'pending').length,
          revenue: orders
            .filter((o: { paymentStatus: string }) => o.paymentStatus === 'completed')
            .reduce((sum: number, o: { finalAmount: number }) => sum + o.finalAmount, 0),
          totalProducts: 0
        })
      } catch {
        // Handle error silently
      }
    }
    fetchStats()
  }, [user])

  const statCards = [
    { title: 'Total Commandes', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' },
    { title: 'En attente', value: stats.pendingOrders, icon: Package, color: 'text-orange-600 bg-orange-100' },
    { title: 'Chiffre d\'affaires', value: `${stats.revenue.toLocaleString()} FCFA`, icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { title: 'Produits', value: stats.totalProducts, icon: Users, color: 'text-purple-600 bg-purple-100' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Tableau de bord - Administration</h1>

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

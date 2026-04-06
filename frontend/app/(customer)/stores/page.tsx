'use client'

import { useEffect, useState } from 'react'
import { storeApi } from '@/lib/api'
import { MapPin, Clock, Truck } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Store {
  _id: string
  name: string
  address: string
  description?: string
  logo?: string
  deliveryFee: number
  deliveryRadius: number
  minOrderAmount: number
  status: string
  distance?: number
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          fetchStores()
        }
      )
    } else {
      fetchStores()
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      fetchStores(userLocation.lat, userLocation.lng)
    }
  }, [userLocation])

  const fetchStores = async (lat?: number, lng?: number) => {
    try {
      const params: Record<string, string | number> = {}
      if (lat && lng) {
        params.lat = lat
        params.lng = lng
        params.radius = 20
      }
      const response = await storeApi.getAll(params)
      setStores(response.data.data)
    } catch {
      toast.error('Erreur lors du chargement des magasins')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Nos magasins</h1>
          {userLocation && (
            <p className="text-gray-600 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-green-500" />
              Magasins triés par distance
            </p>
          )}
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Aucun magasin disponible dans votre zone</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <Link
                key={store._id}
                href={`/stores/${store._id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
              >
                <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-primary-400">
                      {store.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {store.address}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {store.deliveryFee === 0 ? 'Livraison gratuite' : `${store.deliveryFee} FCFA`}
                    </span>
                    {store.distance !== undefined && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {store.distance} km
                      </span>
                    )}
                  </div>
                  {store.minOrderAmount > 0 && (
                    <p className="text-xs text-gray-400 mt-2">Min. {store.minOrderAmount} FCFA</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

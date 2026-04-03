'use client'

import { useEffect, useState } from 'react'
import { Clock, MapPin } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface QuickTrip {
  id: string
  origin: string
  destination: string
  departureTime: string
  pricePerSeat: number
  remainingSeats: number
  driver: { name: string }
}

export default function PassengerDashboard() {
  const { user, setView, setSelectedTrip, logout } = useAppStore()
  const [recentTrips, setRecentTrips] = useState<QuickTrip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips')
      const data = await res.json()
      setRecentTrips(data.trips.slice(0, 3))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (d.toDateString() === tomorrow.toDateString()) return 'Demain'
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const openTrip = (trip: any) => {
    setSelectedTrip(trip)
    setView('passenger-trip-detail')
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-5">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#006233] to-[#008040] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <div>
              <p className="text-white/70 text-sm">Bienvenue</p>
              <h2 className="text-2xl font-bold mt-0.5">{user?.name}</h2>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-lg">🚪</span>
          </button>
        </div>
      </div>

      {/* 3 Action Cards */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setView('passenger-search')}
          className="min-h-[100px] rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:border-[#006233] hover:shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl">🔍</span>
          <span className="text-xs font-bold text-gray-700">Rechercher</span>
        </button>

        <button
          onClick={() => setView('passenger-reservations')}
          className="min-h-[100px] rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:border-[#FFD700] hover:shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl">🎫</span>
          <span className="text-xs font-bold text-gray-700">Réservations</span>
        </button>

        <button
          onClick={() => setView('passenger-packages')}
          className="min-h-[100px] rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:border-blue-400 hover:shadow-md active:scale-95 transition-all flex flex-col items-center justify-center gap-2"
        >
          <span className="text-3xl">📦</span>
          <span className="text-xs font-bold text-gray-700">Colis</span>
        </button>
      </div>

      {/* Quick search */}
      <button
        onClick={() => {
          useAppStore.getState().setSearchFilters({ origin: 'Thiès', destination: 'Dakar Plateau', date: '' })
          setView('passenger-search')
        }}
        className="w-full bg-[#006233]/5 hover:bg-[#006233]/10 rounded-2xl p-4 flex items-center justify-between transition-colors active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div className="text-left">
            <p className="text-sm font-bold text-[#006233]">Thiès → Dakar</p>
            <p className="text-xs text-gray-500">Recherche rapide</p>
          </div>
        </div>
        <span className="text-gray-400">›</span>
      </button>

      {/* Available trips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Trajets disponibles</h3>
          <button
            onClick={() => setView('passenger-search')}
            className="text-xs text-[#006233] font-bold"
          >
            Voir tout →
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : recentTrips.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <span className="text-4xl">🚗</span>
              <p className="text-sm text-gray-500 mt-3">Aucun trajet disponible</p>
              <p className="text-xs text-gray-400 mt-1">Revenez plus tard</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentTrips.map((trip) => (
              <Card
                key={trip.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.99] rounded-2xl"
                onClick={() => openTrip(trip)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">{trip.origin}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-sm font-bold text-gray-900">{trip.destination}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>🕐 {formatTime(trip.departureTime)}</span>
                        <span>📅 {formatDate(trip.departureTime)}</span>
                        <span>🚗 {trip.driver.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#006233]">{trip.pricePerSeat.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span></p>
                      <Badge variant="secondary" className="text-[10px] mt-1 rounded-lg">
                        {trip.remainingSeats} place{trip.remainingSeats > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

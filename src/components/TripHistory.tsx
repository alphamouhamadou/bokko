'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Car, Star, Wallet, TrendingUp } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type TabKey = 'active' | 'completed' | 'all'

interface HistoryReservation {
  id: string
  tripId: string
  status: string
  seatsBooked: number
  paymentStatus: string
  paymentMethod?: string | null
  exactDestination?: string | null
  cancelReason?: string | null
  createdAt: string
  totalPrice: number
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    pricePerSeat: number
    status: string
    driver: {
      id: string
      name: string
      phone: string
      averageRating: number
      totalRatings: number
      vehicle: { brand: string; model: string; color: string } | null
    }
  }
  payment: {
    id: string
    amount: number
    method: string
    status: string
    confirmedAt: string | null
  } | null
}

interface Stats {
  totalTrips: number
  totalSpent: number
  averageRatingGiven: number
  totalRatingsGiven: number
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'En attente', color: 'text-amber-700', bg: 'bg-amber-100' },
  CONFIRMED: { label: 'Confirmé', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Annulé', color: 'text-red-700', bg: 'bg-red-100' },
  COMPLETED: { label: 'Terminé', color: 'text-blue-700', bg: 'bg-blue-100' },
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  PENDING: { label: 'En attente', icon: '⏳', color: 'text-amber-600' },
  PAID: { label: 'Payé', icon: '✅', color: 'text-green-600' },
  REFUNDED: { label: 'Remboursé', icon: '💸', color: 'text-blue-600' },
}

export default function TripHistory() {
  const { user } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [reservations, setReservations] = useState<HistoryReservation[]>([])
  const [stats, setStats] = useState<Stats>({ totalTrips: 0, totalSpent: 0, averageRatingGiven: 0, totalRatingsGiven: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) fetchHistory()
  }, [user, activeTab])

  const fetchHistory = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('passengerId', user.id)
      params.set('limit', '50')

      if (activeTab === 'active') {
        params.set('status', 'PENDING')
        // Also fetch confirmed
      }

      const res = await fetch(`/api/passengers/history?${params}`)
      const data = await res.json()

      let filtered = data.reservations || []

      if (activeTab === 'active') {
        // Fetch confirmed too
        const res2 = await fetch(`/api/passengers/history?passengerId=${user.id}&limit=50&status=CONFIRMED`)
        const data2 = await res2.json()
        filtered = [...filtered, ...(data2.reservations || [])]
      } else if (activeTab === 'completed') {
        // Past trips: completed, cancelled, or trip departure time in the past
        filtered = filtered.filter((r: HistoryReservation) => {
          const tripTime = new Date(r.trip.departureTime)
          const now = new Date()
          return tripTime < now || r.status === 'CANCELLED' || r.status === 'COMPLETED'
        })
      }

      setReservations(filtered)
      if (data.stats) setStats(data.stats)
    } catch {
      toast.error('Erreur lors du chargement de l\'historique')
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
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (d.toDateString() === yesterday.toDateString()) return 'Hier'
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getPaymentStatus = (paymentStatus: string, paymentMethod?: string | null) => {
    const config = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.PENDING
    const methodLabel = paymentMethod === 'CASH' ? ' espèces' : paymentMethod === 'WAVE' ? ' Wave' : ''
    return (
      <span className={`text-xs font-medium flex items-center gap-1 ${config.color}`}>
        {config.icon} {config.label}{methodLabel}
      </span>
    )
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'active', label: 'En cours' },
    { key: 'completed', label: 'Terminés' },
    { key: 'all', label: 'Tous' },
  ]

  return (
    <div className="flex-1 px-4 py-4 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">📜 Mon historique</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tous vos trajets réservés</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 bg-[#006233]/10 rounded-lg flex items-center justify-center mx-auto mb-1.5">
              <TrendingUp className="w-4 h-4 text-[#006233]" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.totalTrips}</p>
            <p className="text-[10px] text-gray-500">Trajets</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 bg-[#FFD700]/20 rounded-lg flex items-center justify-center mx-auto mb-1.5">
              <Wallet className="w-4 h-4 text-[#B8860B]" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.totalSpent > 0 ? `${(stats.totalSpent / 1000).toFixed(0)}k` : '0'}</p>
            <p className="text-[10px] text-gray-500">FCFA dépensés</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.averageRatingGiven > 0 ? stats.averageRatingGiven.toFixed(1) : '—'}</p>
            <p className="text-[10px] text-gray-500">Note moy.</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#006233] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reservation List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <span className="text-4xl">📜</span>
            <p className="text-sm text-gray-500 font-medium mt-3">Aucun trajet trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'active' ? 'Vous n\'avez pas de réservation en cours' : 'Votre historique est vide'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => (
            <Card key={res.id} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-4 space-y-3">
                {/* Route + Status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#CE1126]" />
                      <span className="text-sm font-bold text-gray-900 ml-1.5">{res.trip.origin}</span>
                    </div>
                    <span className="text-gray-300 mx-1">→</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-[#006233]" />
                      <span className="text-sm font-bold text-gray-900 ml-1.5">
                        {res.trip.destination}
                        {res.exactDestination && (
                          <span className="text-xs text-[#006233] font-medium"> ({res.exactDestination})</span>
                        )}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(res.status)}
                </div>

                {/* Time + Date */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(res.trip.departureTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    📅 {formatDate(res.trip.departureTime)}
                  </span>
                </div>

                {/* Driver + Price */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">🚗</span>
                    <span className="text-xs font-semibold text-gray-700">{res.trip.driver.name}</span>
                    {res.trip.driver.averageRating > 0 && (
                      <span className="text-[10px] text-amber-600">⭐ {res.trip.driver.averageRating.toFixed(1)}</span>
                    )}
                    {res.trip.driver.vehicle && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span className={`w-2 h-2 rounded-full ${
                          res.trip.driver.vehicle.color === 'Blanc' ? 'bg-white border border-gray-300' :
                          res.trip.driver.vehicle.color === 'Noir' ? 'bg-gray-800' :
                          res.trip.driver.vehicle.color === 'Rouge' ? 'bg-red-500' :
                          res.trip.driver.vehicle.color === 'Bleu' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        {res.trip.driver.vehicle.brand} {res.trip.driver.vehicle.model}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#006233]">{res.totalPrice.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">FCFA</span></p>
                    {res.seatsBooked > 1 && (
                      <p className="text-[10px] text-gray-400">{res.seatsBooked} places</p>
                    )}
                  </div>
                </div>

                {/* Payment status */}
                <div className="flex items-center justify-between">
                  {getPaymentStatus(res.paymentStatus, res.paymentMethod)}
                  <span className="text-[10px] text-gray-400">
                    Réservé le {new Date(res.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

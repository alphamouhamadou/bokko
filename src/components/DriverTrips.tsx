'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Car, Eye, Trash2, Loader2, BarChart3 } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface TripData {
  id: string
  origin: string
  destination: string
  departureTime: string
  pricePerSeat: number
  availableSeats: number
  tripType: string
  status: string
  description?: string
  createdAt: string
  totalBooked: number
  remainingSeats: number
  reservationCount: number
  activeReservations: number
  pendingReservations: number
}

export default function DriverTrips() {
  const { user, setSelectedTrip, setView } = useAppStore()
  const [trips, setTrips] = useState<TripData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) fetchTrips()
  }, [user])

  const fetchTrips = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/trips?driverId=${user.id}`)
      const data = await res.json()
      setTrips(data.trips)
    } catch {
      toast.error('Erreur lors du chargement des trajets')
    } finally {
      setLoading(false)
    }
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

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getTripTypeLabel = (type: string) => {
    switch (type) {
      case 'ALLER_SIMPLE': return 'Aller simple'
      case 'RETOUR_SIMPLE': return 'Retour simple'
      case 'ALLER_RETOUR': return 'Aller-retour'
      default: return type
    }
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Mes trajets</h2>
        <p className="text-sm text-gray-500">{trips.length} trajet{trips.length > 1 ? 's' : ''} publié{trips.length > 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Aucun trajet publié</p>
            <p className="text-xs text-gray-400 mt-1">Commencez par publier votre premier trajet</p>
            <Button
              onClick={() => setView('driver-publish')}
              className="mt-4 bg-[#006233] hover:bg-[#006233]/90 text-white rounded-xl"
            >
              Publier un trajet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#CE1126]" />
                      <span className="text-sm font-semibold">{trip.origin}</span>
                      <span className="text-gray-300 mx-1">→</span>
                      <MapPin className="w-3.5 h-3.5 text-[#006233]" />
                      <span className="text-sm font-semibold">{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(trip.departureTime)} à {formatTime(trip.departureTime)}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-[#006233] text-white text-[10px]">
                    {getTripTypeLabel(trip.tripType)}
                  </Badge>
                </div>

                {trip.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{trip.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-sm font-bold text-[#006233]">{trip.pricePerSeat.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">FCFA/place</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">{trip.remainingSeats}/{trip.availableSeats}</p>
                      <p className="text-[10px] text-gray-400">places</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-700">{trip.totalBooked}</p>
                      <p className="text-[10px] text-gray-400">réservé{trip.totalBooked > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {trip.pendingReservations > 0 && (
                      <Badge className="bg-[#FFD700] text-[#006233] text-[10px] mr-1">
                        {trip.pendingReservations} en attente
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

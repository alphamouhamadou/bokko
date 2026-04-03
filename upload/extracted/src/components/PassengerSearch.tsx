'use client'

import { useState } from 'react'
import { Search, Loader2, Package } from 'lucide-react'
import { useAppStore, type TripData } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const LOCATIONS = ['Thiènaba', 'Thiès', 'Dakar']

export default function PassengerSearch() {
  const { searchFilters, setSearchFilters, setSelectedTrip, setView } = useAppStore()
  const [origin, setOrigin] = useState(searchFilters.origin)
  const [destination, setDestination] = useState(searchFilters.destination)
  const [dateType, setDateType] = useState<'today' | 'tomorrow' | 'dayafter' | ''>((searchFilters.date as 'today' | 'tomorrow' | 'dayafter' | '') || '')
  const [trips, setTrips] = useState<TripData[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSwap = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  const getDateStr = (type: string) => {
    const today = new Date()
    if (type === 'today') return today.toISOString().split('T')[0]
    if (type === 'tomorrow') {
      const d = new Date(today)
      d.setDate(d.getDate() + 1)
      return d.toISOString().split('T')[0]
    }
    if (type === 'dayafter') {
      const d = new Date(today)
      d.setDate(d.getDate() + 2)
      return d.toISOString().split('T')[0]
    }
    return ''
  }

  const handleSearch = async () => {
    if (!origin || !destination) {
      toast.error('Choisissez le départ et la destination')
      return
    }
    if (origin === destination) {
      toast.error('Choisissez des lieux différents')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (origin) params.set('origin', origin)
      if (destination) params.set('destination', destination)
      if (dateType) params.set('date', getDateStr(dateType))
      const res = await fetch(`/api/trips?${params}`)
      const data = await res.json()
      setTrips(data.trips)
      setSearchFilters({ origin, destination, date: dateType })
    } catch {
      toast.error('Erreur lors de la recherche')
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

  return (
    <div className="flex-1 px-4 py-4 space-y-5">
      {/* Departure */}
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">📍 Départ</p>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setOrigin(loc === origin ? '' : loc)}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                origin === loc
                  ? 'bg-[#006233] text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#006233]/50 active:scale-95'
              }`}
            >
              {origin === loc && '✓ '}{loc}
            </button>
          ))}
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm active:scale-90 transition-all"
        >
          <span className="text-xl">⇄</span>
        </button>
      </div>

      {/* Destination */}
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">📍 Destination</p>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => setDestination(loc === destination ? '' : loc)}
              className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                destination === loc
                  ? 'bg-[#006233] text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#006233]/50 active:scale-95'
              }`}
            >
              {destination === loc && '✓ '}{loc}
            </button>
          ))}
        </div>
      </div>

      {/* Date buttons */}
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">📅 Date</p>
        <div className="flex gap-2">
          {[
            { key: 'today', label: 'Aujourd\'hui' },
            { key: 'tomorrow', label: 'Demain' },
            { key: 'dayafter', label: 'Après-demain' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDateType(dateType === key ? '' : key as any)}
              className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                dateType === key
                  ? 'bg-[#FFD700] text-[#006233] shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#FFD700]/50 active:scale-95'
              }`}
            >
              📅 {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search button */}
      <Button
        onClick={handleSearch}
        disabled={loading}
        className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <><Search className="w-5 h-5 mr-2" /> RECHERCHER</>
        )}
      </Button>

      {/* Results */}
      {searched && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            {loading ? 'Recherche...' : `${trips.length} trajet${trips.length > 1 ? 's' : ''} trouvé${trips.length > 1 ? 's' : ''}`}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : trips.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <span className="text-4xl">🚗</span>
                <p className="text-sm text-gray-500 font-medium mt-3">Aucun trajet disponible</p>
                <p className="text-xs text-gray-400 mt-1">Essayez une autre date</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <Card
                  key={trip.id}
                  className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                  onClick={() => {
                    setSelectedTrip(trip)
                    setView('passenger-trip-detail')
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">{trip.origin}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-base font-bold text-gray-900">{trip.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      <span>🕐 {formatTime(trip.departureTime)}</span>
                      <span>📅 {formatDate(trip.departureTime)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {trip.acceptsPackages && (
                          <span className="text-xs bg-[#FFD700]/20 text-[#B8860B] px-2 py-1 rounded-lg font-medium">
                            📦 Colis
                          </span>
                        )}
                        <span className="text-xs text-gray-500">🚗 {trip.driver?.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#006233]">{trip.pricePerSeat.toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span></p>
                        <p className="text-xs text-gray-400">
                          {(trip.remainingSeats ?? trip.availableSeats)} place{(trip.remainingSeats ?? trip.availableSeats) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

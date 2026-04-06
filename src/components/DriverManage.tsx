'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Clock, User, Phone, Check, X, Loader2, ListChecks, CreditCard, ShieldCheck, Banknote, Navigation, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ContactButtons from '@/components/ContactButtons'

/* ─── Passenger Live Location Component ─── */
function PassengerLocationView({ reservationId }: { reservationId: string }) {
  const [location, setLocation] = useState<{ lat: number; lon: number; address: string; updatedAt: string } | null>(null)
  const [sharing, setSharing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const fetchLocation = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/reservations/${reservationId}/location`)
      const data = await res.json()
      setSharing(data.sharing)
      setLocation(data.location)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [reservationId])

  useEffect(() => {
    fetchLocation()
    const interval = setInterval(fetchLocation, 30000)
    return () => clearInterval(interval)
  }, [fetchLocation])

  const timeAgo = location?.updatedAt
    ? Math.floor((Date.now() - new Date(location.updatedAt).getTime()) / 1000)
    : null

  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `il y a ${seconds}s`
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}min`
    return `il y a ${Math.floor(seconds / 3600)}h`
  }

  const openInMaps = () => {
    if (!location) return
    window.open(`https://www.google.com/maps?q=${location.lat},${location.lon}`, '_blank')
  }

  return (
    <div className="bg-gradient-to-br from-[#006233]/5 to-[#FFD700]/5 rounded-2xl p-3 border border-[#006233]/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className={`w-4 h-4 ${sharing ? 'text-[#006233] animate-pulse' : 'text-gray-400'}`} />
          <span className="text-xs font-semibold text-gray-700">
            {sharing ? 'Position en direct' : 'Position non partagée'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {timeAgo !== null && (
            <span className="text-[10px] text-gray-400">
              {formatTimeAgo(timeAgo)}
            </span>
          )}
          <button onClick={fetchLocation} disabled={loading} className="text-gray-400 hover:text-[#006233] transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !location && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
        </div>
      )}

      {error && <p className="text-xs text-red-500">Erreur de chargement</p>}

      {!loading && !sharing && (
        <p className="text-[11px] text-gray-400">Le passager n&apos;a pas encore activé le partage de position</p>
      )}

      {location && (
        <>
          <p className="text-xs text-gray-600 flex items-center gap-1 mb-2">
            <Navigation className="w-3 h-3 text-[#006233]" />
            {location.address || `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`}
          </p>
          <button
            onClick={openInMaps}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-[#006233] text-white hover:bg-[#006233]/90 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5" />
            Voir position passager
          </button>
        </>
      )}
    </div>
  )
}

/* ─── Navigate to Destination Button ─── */
function NavigateToDestination({ address, lat, lon }: { address?: string | null; lat?: number | null; lon?: number | null }) {
  if (!address && lat === null) return null

  const navigate = () => {
    if (lat && lon) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank')
    } else if (address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank')
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={navigate}
        className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#FFD700] text-[#006233] hover:bg-[#FFD700]/90 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
      >
        <Navigation className="w-4 h-4" />
        Naviguer vers la destination
      </button>
      {address && (
        <p className="text-[10px] text-gray-400 text-center mt-1 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" /> {address}
        </p>
      )}
    </div>
  )
}

interface ReservationData {
  id: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  paidAt: string | null
  seatsBooked: number
  createdAt: string
  exactDestination?: string | null
  exactDestinationLat?: number | null
  exactDestinationLon?: number | null
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    pricePerSeat: number
    availableSeats: number
    status: string
    driver: { id: string; name: string; phone: string; waveBusinessLink?: string | null }
  }
  passenger: { id: string; name: string; phone: string }
}

export default function DriverManage() {
  const { user } = useAppStore()
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) fetchReservations()
  }, [user])

  const fetchReservations = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations?driverId=${user.id}`)
      const data = await res.json()
      setReservations(data.reservations)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (reservationId: string, status: string) => {
    setUpdating(reservationId)
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success(status === 'CONFIRMED' ? '✅ Confirmé !' : '❌ Refusé')
      fetchReservations()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpdating(null)
    }
  }

  const handleConfirmPayment = async (reservationId: string) => {
    setUpdating(reservationId)
    try {
      const res = await fetch(`/api/reservations/${reservationId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'CONFIRMED_BY_DRIVER' }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success('Paiement confirmé ! ✅')
      fetchReservations()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpdating(null)
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return { icon: '🟢', text: 'Confirmé' }
      case 'PENDING': return { icon: '🟡', text: 'En attente' }
      case 'CANCELLED': return { icon: '🔴', text: 'Refusé' }
      default: return { icon: '⚪', text: status }
    }
  }

  const getPaymentStatusDisplay = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PENDING': return { icon: '🟡', text: 'En attente' }
      case 'PAID': return { icon: '💙', text: 'Envoyé' }
      case 'CONFIRMED_BY_DRIVER': return { icon: '🟢', text: 'Confirmé' }
      default: return null
    }
  }

  const pendingReservations = reservations.filter((r) => r.status === 'PENDING')
  const otherReservations = reservations.filter((r) => r.status !== 'PENDING')

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Réservations</h2>
        <p className="text-sm text-gray-500">Gérez les demandes</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <span className="text-4xl">📋</span>
            <p className="text-sm text-gray-500 font-medium mt-3">Aucune réservation</p>
            <p className="text-xs text-gray-400 mt-1">Publiez un trajet pour recevoir des demandes</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending */}
          {pendingReservations.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-[#CE1126] mb-2 flex items-center gap-2">
                <span>🚨</span>
                {pendingReservations.length} demande{pendingReservations.length > 1 ? 's' : ''} en attente
              </h3>
              <div className="space-y-3">
                {pendingReservations.map((res) => {
                  const statusInfo = getStatusDisplay(res.status)
                  const paymentInfo = getPaymentStatusDisplay(res.paymentStatus)
                  return (
                    <Card key={res.id} className="border-0 shadow-sm border-l-4 border-l-[#FFD700] rounded-2xl">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{statusInfo.icon} {statusInfo.text}</span>
                          {paymentInfo && (
                            <span className="text-xs bg-gray-50 px-2 py-1 rounded-lg">
                              💳 {paymentInfo.icon} {paymentInfo.text}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#006233]/10 rounded-2xl flex items-center justify-center">
                            <span className="text-xl">👤</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900">{res.passenger.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {res.passenger.phone}
                            </p>
                          </div>
                          <ContactButtons phone={res.passenger.phone} variant="compact" context="driver-to-passenger" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{res.trip.origin} → {res.trip.destination}</span>
                            {res.exactDestination && (
                              <span className="text-[#006233] font-semibold ml-1">({res.exactDestination})</span>
                            )}
                            <span className="text-gray-400 ml-2 text-xs">🕐 {formatDate(res.trip.departureTime)} {formatTime(res.trip.departureTime)}</span>
                          </div>
                          <p className="text-xl font-bold text-[#006233]">
                            {(res.trip.pricePerSeat * res.seatsBooked).toLocaleString()} <span className="text-xs font-normal text-gray-500">FCFA</span>
                          </p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(res.id, 'CONFIRMED')}
                            disabled={updating === res.id}
                            className="flex-1 min-h-[48px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-sm"
                          >
                            {updating === res.id ? <Loader2 className="w-5 h-5 animate-spin" /> : '✅ CONFIRMER'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdate(res.id, 'CANCELLED')}
                            disabled={updating === res.id}
                            className="flex-1 min-h-[48px] rounded-2xl text-sm font-bold text-[#CE1126] border-2 border-[#CE1126]/30 hover:bg-[#CE1126]/10"
                          >
                            {updating === res.id ? <Loader2 className="w-5 h-5 animate-spin" /> : '❌ REFUSER'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Other */}
          {otherReservations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Historique ({otherReservations.length})
              </h3>
              <div className="space-y-3">
                {otherReservations.map((res) => {
                  const statusInfo = getStatusDisplay(res.status)
                  const paymentInfo = getPaymentStatusDisplay(res.paymentStatus)
                  return (
                    <Card key={res.id} className="border-0 shadow-sm rounded-2xl">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                              <span className="text-lg">👤</span>
                            </div>
                            <div>
                              <p className="text-base font-bold">{res.passenger.name}</p>
                              <p className="text-xs text-gray-500">{res.seatsBooked} place{res.seatsBooked > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{statusInfo.icon} {statusInfo.text}</span>
                            <ContactButtons phone={res.passenger.phone} variant="compact" context="driver-to-passenger" />
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-semibold">{res.trip.origin} → {res.trip.destination}</span>
                          {res.exactDestination && (
                            <span className="text-[#006233] font-semibold ml-1">({res.exactDestination})</span>
                          )}
                          <span className="text-gray-400 ml-2 text-xs">🕐 {formatDate(res.trip.departureTime)}</span>
                          <span className="text-[#006233] font-bold ml-3">{(res.trip.pricePerSeat * res.seatsBooked).toLocaleString()} FCFA</span>
                        </div>

                        {res.paymentStatus === 'PAID' && res.status === 'CONFIRMED' && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <p className={`text-xs font-semibold flex items-center gap-1 ${res.paymentMethod === 'CASH' ? 'text-[#B8960F]' : 'text-[#1DC3E3]'}`}>
                              {res.paymentMethod === 'CASH' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                              {res.paymentMethod === 'CASH' ? '💵' : '💙'} {(res.trip.pricePerSeat * res.seatsBooked).toLocaleString()} FCFA reçus {res.paymentMethod === 'CASH' ? 'en espèces' : 'via Wave'}
                            </p>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(res.id)}
                              disabled={updating === res.id}
                              className="h-10 rounded-xl bg-[#006233] hover:bg-[#006233]/90 text-white text-xs font-bold gap-1"
                            >
                              {updating === res.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              Confirmer
                            </Button>
                          </div>
                        )}

                        {res.paymentStatus === 'CONFIRMED_BY_DRIVER' && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <span>🟢</span>
                            <p className="text-xs text-[#006233] font-medium">
                              Paiement de {(res.trip.pricePerSeat * res.seatsBooked).toLocaleString()} FCFA confirmé
                            </p>
                          </div>
                        )}

                        {/* Navigate to destination */}
                        {res.status === 'CONFIRMED' && (
                          <NavigateToDestination
                            address={res.exactDestination}
                            lat={res.exactDestinationLat}
                            lon={res.exactDestinationLon}
                          />
                        )}

                        {/* Live location for confirmed reservations */}
                        {res.status === 'CONFIRMED' && (
                          <div className="mt-2">
                            <PassengerLocationView reservationId={res.id} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
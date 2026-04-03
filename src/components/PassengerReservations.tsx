'use client'

import { useState, useEffect } from 'react'
import { Ticket, MapPin, Clock, Car, X, Check, Loader2, AlertCircle, Share2, CreditCard, Banknote } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ContactButtons from '@/components/ContactButtons'
import PaymentModal from '@/components/PaymentModal'
import LocationShare from '@/components/LocationShare'

interface ReservationData {
  id: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  paidAt: string | null
  seatsBooked: number
  createdAt: string
  exactDestination?: string | null
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    pricePerSeat: number
    status: string
    driver: { id: string; name: string; phone: string; waveBusinessLink?: string | null }
  }
  passenger?: { id: string; name: string; phone: string }
}

export default function PassengerReservations() {
  const { user, setSelectedTrip, setView } = useAppStore()
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<ReservationData | null>(null)

  useEffect(() => {
    if (user?.id) fetchReservations()
  }, [user])

  const fetchReservations = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations?passengerId=${user.id}`)
      const data = await res.json()
      setReservations(data.reservations)
    } catch {
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservationId: string) => {
    setCancelling(reservationId)
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success('Réservation annulée')
      fetchReservations()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setCancelling(null)
    }
  }

  const handleShare = (res: ReservationData) => {
    setSelectedTrip(res.trip as any)
    setView('trip-share')
  }

  const handleOpenPayment = (res: ReservationData) => {
    setSelectedReservation(res)
    setPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    setPaymentModalOpen(false)
    setSelectedReservation(null)
    fetchReservations()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-[#006233] text-white text-xs">Confirmée</Badge>
      case 'PENDING':
        return <Badge className="bg-[#FFD700] text-[#006233] text-xs">En attente</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="text-xs text-gray-500">Annulée</Badge>
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-[10px]">En attente de paiement</Badge>
      case 'PAID':
        return <Badge className="bg-[#1DC3E3]/10 text-[#1DC3E3] border-[#1DC3E3]/20 text-[10px]">Payé - En attente de confirmation</Badge>
      case 'CONFIRMED_BY_DRIVER':
        return <Badge className="bg-[#006233] text-white text-[10px]">Confirmé</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Check className="w-5 h-5 text-[#006233]" />
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-[#FFD700]" />
      case 'CANCELLED':
        return <X className="w-5 h-5 text-gray-400" />
      default:
        return null
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
    <>
      <div className="flex-1 px-4 py-4 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mes réservations</h2>
          <p className="text-sm text-gray-500">Suivez l&apos;état de vos réservations</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Aucune réservation</p>
              <p className="text-xs text-gray-400 mt-1">Recherchez un trajet pour commencer</p>
              <Button
                onClick={() => setView('passenger-search')}
                className="mt-4 bg-[#006233] hover:bg-[#006233]/90 text-white rounded-xl"
              >
                Rechercher un trajet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reservations.map((res) => (
              <Card key={res.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(res.status)}
                      {getStatusBadge(res.status)}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(res.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Payment Status Badge */}
                  {res.status !== 'CANCELLED' && getPaymentStatusBadge(res.paymentStatus) && (
                    <div className="mb-2">
                      {getPaymentStatusBadge(res.paymentStatus)}
                    </div>
                  )}

                  {/* Payment Status Info Messages */}
                  {res.paymentStatus === 'PAID' && res.status !== 'CANCELLED' && (
                    <div className={`rounded-lg p-2 mb-2 flex items-center gap-2 ${res.paymentMethod === 'CASH' ? 'bg-[#FFD700]/10 border border-[#FFD700]/30' : 'bg-[#1DC3E3]/5 border border-[#1DC3E3]/20'}`}>
                      {res.paymentMethod === 'CASH' ? (
                        <Banknote className="w-4 h-4 text-[#FFD700] flex-shrink-0" />
                      ) : (
                        <svg className="w-4 h-4 text-[#1DC3E3] flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 17c1-1 2-2 3-1s2 3 3 2 2-3 3-2 2 1 3 2-1 2-2 3-1 2 3 3 2 2-3 3-2 2 1 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      <p className={`text-[11px] ${res.paymentMethod === 'CASH' ? 'text-[#B8960F]' : 'text-[#1DC3E3]'}`}>
                        Paiement {res.paymentMethod === 'CASH' ? 'en espèces' : 'Wave'} envoyé — En attente de confirmation du chauffeur
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedTrip(res.trip)
                      setView('passenger-trip-detail')
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#CE1126]" />
                      <span className="text-sm font-semibold">{res.trip.origin}</span>
                      <span className="text-gray-300 mx-1">→</span>
                      <MapPin className="w-3.5 h-3.5 text-[#006233]" />
                      <span className="text-sm font-semibold">{res.trip.destination}</span>
                      {res.exactDestination && (
                        <span className="text-xs text-[#006233] font-medium ml-1">({res.exactDestination})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(res.trip.departureTime)} à {formatTime(res.trip.departureTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {res.trip.driver.name}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#006233]">
                        {(res.trip.pricePerSeat * res.seatsBooked).toLocaleString()} FCFA
                      </span>
                      <span className="text-xs text-gray-400">
                        {res.seatsBooked} place{res.seatsBooked > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <ContactButtons phone={res.trip.driver.phone} name={res.trip.driver.name} variant="compact" context="passenger-to-driver" origin={res.trip.origin} destination={res.trip.destination} date={formatDate(res.trip.departureTime)} />
                      {res.status === 'CONFIRMED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#006233] hover:text-[#006233] hover:bg-[#006233]/10 text-xs h-8 gap-1"
                          onClick={() => handleShare(res)}
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Partager
                        </Button>
                      )}
                      {/* Pay Now button for pending payment - always available (Wave or Cash) */}
                      {res.paymentStatus === 'PENDING' && res.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#006233] hover:text-[#006233] hover:bg-[#006233]/10 text-xs h-8 gap-1 font-semibold"
                          onClick={() => handleOpenPayment(res)}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Payer 💳
                        </Button>
                      )}
                      {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#CE1126] hover:text-[#CE1126] hover:bg-[#CE1126]/10 text-xs h-8"
                          onClick={() => handleCancel(res.id)}
                          disabled={cancelling === res.id}
                        >
                          {cancelling === res.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Location sharing for confirmed reservations */}
                  {res.status === 'CONFIRMED' && (
                    <div className="mt-3">
                      <LocationShare
                        reservationId={res.id}
                        passengerId={res.passenger?.id || ''}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal - always available (Wave or Cash) */}
      {selectedReservation && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => { setPaymentModalOpen(false); setSelectedReservation(null) }}
          trip={selectedReservation.trip}
          driver={{ name: selectedReservation.trip.driver.name, waveBusinessLink: selectedReservation.trip.driver.waveBusinessLink }}
          seats={selectedReservation.seatsBooked}
          reservationId={selectedReservation.id}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  )
}

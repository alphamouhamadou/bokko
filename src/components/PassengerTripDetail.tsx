'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Car, User, Star, Check, Loader2, Package, Minus, Plus } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import ContactButtons from '@/components/ContactButtons'
import PaymentModal from '@/components/PaymentModal'
import LocationPicker from '@/components/LocationPicker'

interface FullTripData {
  id: string
  driverId: string
  origin: string
  destination: string
  departureTime: string
  pricePerSeat: number
  availableSeats: number
  tripType: string
  status: string
  description?: string
  driver: { id: string; name: string; phone: string; role: string; waveBusinessLink?: string | null; averageRating?: number; totalRatings?: number }
  vehicle?: { id: string; brand: string; model: string; color: string; plateNumber: string; capacity: number } | null
  totalBooked: number
  remainingSeats: number
  reservationCount: number
  activeReservations: number
  pendingReservations: number
  acceptsPackages?: boolean
  packagePricePerKg?: number
}

const EXACT_DESTINATIONS: Record<string, string[]> = {
  'Dakar': ['Dakar Plateau', 'Dakar Liberté', 'Dakar Médina', 'Dakar Almadies', 'Dakar Ouakam', 'Dakar Parcelles', 'Autre'],
  'Thiès': ['Thiès Kaur', 'Thiès Sindia', 'Thiès Centre', 'Thiès Ndioloff', 'Autre'],
  'Thiènaba': ['Thiènaba Village', 'Thiènaba Marché', 'Autre'],
}

export default function PassengerTripDetail() {
  const { selectedTrip, user, setView, setSelectedDriver, setSelectedTrip } = useAppStore()
  const [trip, setTrip] = useState<FullTripData | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [seats, setSeats] = useState(1)
  const [hasReservation, setHasReservation] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null)
  const [exactDestination, setExactDestination] = useState('')
  const [customDestination, setCustomDestination] = useState('')
  const [gpsAddress, setGpsAddress] = useState('')
  const [gpsLat, setGpsLat] = useState<number | null>(null)
  const [gpsLon, setGpsLon] = useState<number | null>(null)
  const [destGpsAddress, setDestGpsAddress] = useState('')
  const [destLat, setDestLat] = useState<number | null>(null)
  const [destLon, setDestLon] = useState<number | null>(null)

  useEffect(() => {
    if (selectedTrip?.id) {
      fetchTrip()
      checkReservation()
    }
  }, [selectedTrip])

  const fetchTrip = async () => {
    if (!selectedTrip?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/trips/${selectedTrip.id}`)
      const data = await res.json()
      setTrip(data.trip)
    } catch {
      toast.error('Erreur lors du chargement du trajet')
    } finally {
      setLoading(false)
    }
  }

  const checkReservation = async () => {
    if (!user?.id || !selectedTrip?.id) return
    try {
      const res = await fetch(`/api/reservations?passengerId=${user.id}`)
      const data = await res.json()
      const existing = data.reservations?.find(
        (r: any) => r.tripId === selectedTrip.id && (r.status === 'CONFIRMED' || r.status === 'PENDING')
      )
      setHasReservation(!!existing)
    } catch {
      // silent
    }
  }

  const getExactDestinations = () => {
    if (!trip) return []
    const destinationCity = trip.destination
    return EXACT_DESTINATIONS[destinationCity] || []
  }

  // GPS destination overrides preset/custom selection
  const finalExactDestination = destGpsAddress || (exactDestination === 'Autre' ? customDestination.trim() : (exactDestination || gpsAddress))
  const finalDestLat = destLat || null
  const finalDestLon = destLon || null

  const handleBook = async () => {
    if (!user || !trip) return
    const destinations = getExactDestinations()
    if (destinations.length > 0 && !finalExactDestination) {
      toast.error('Choisissez votre destination exacte')
      return
    }
    setBooking(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: trip.id,
          passengerId: user.id,
          seatsBooked: seats,
          exactDestination: finalExactDestination || null,
          exactDestinationLat: finalDestLat,
          exactDestinationLon: finalDestLon,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la réservation')
        return
      }
      toast.success('Réservation envoyée ! En attente de confirmation du chauffeur. 🚗')
      setHasReservation(true)
      setView('passenger-reservations')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setBooking(false)
    }
  }

  const handlePaymentComplete = () => {
    setPaymentModalOpen(false)
    setCreatedReservationId(null)
    setView('passenger-reservations')
  }

  const handleViewDriver = () => {
    if (!trip) return
    setSelectedDriver({
      id: trip.driver.id,
      name: trip.driver.name,
      phone: trip.driver.phone,
    })
    setView('driver-profile')
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

  const getColorDot = (color: string) => {
    const map: Record<string, string> = {
      'Blanc': 'bg-white border-2 border-gray-300',
      'Noir': 'bg-gray-800',
      'Gris': 'bg-gray-400',
      'Rouge': 'bg-red-500',
      'Bleu': 'bg-blue-500',
      'Vert': 'bg-green-500',
      'Argent': 'bg-gray-300',
      'Marron': 'bg-amber-700',
    }
    return map[color] || 'bg-gray-400'
  }

  if (loading) {
    return (
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="h-32 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-24 rounded-2xl bg-gray-200 animate-pulse" />
        <div className="h-40 rounded-2xl bg-gray-200 animate-pulse" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex-1 px-4 py-4 text-center">
        <p className="text-gray-500">Trajet non trouvé</p>
      </div>
    )
  }

  const isOwnTrip = user?.id === trip.driverId
  const totalPrice = trip.pricePerSeat * seats

  return (
    <>
      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Route Visual */}
        <div className="bg-gradient-to-br from-[#006233]/5 to-[#FFD700]/5 rounded-2xl p-6 border border-[#006233]/10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#CE1126] rounded-full flex items-center justify-center shadow-lg mb-2">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold text-[#CE1126]">{trip.origin}</p>
            </div>

            <div className="flex flex-col items-center flex-1 px-4">
              <span className="text-2xl">🚗</span>
              <div className="w-full h-0.5 bg-gradient-to-r from-[#CE1126] via-[#006233] to-[#006233] mt-1" />
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#006233] rounded-full flex items-center justify-center shadow-lg mb-2">
                <MapPin className="w-6 h-6 text-[#FFD700]" />
              </div>
              <p className="text-sm font-bold text-[#006233]">{trip.destination}</p>
            </div>
          </div>
        </div>

        {/* 3 Key Info Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xl">🕐</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{formatTime(trip.departureTime)}</p>
              <p className="text-[10px] text-gray-500">{formatDate(trip.departureTime)}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-b from-[#006233] to-[#004d28]">
            <CardContent className="p-3 text-center">
              <span className="text-xl">💰</span>
              <p className="text-lg font-bold text-white mt-1">{trip.pricePerSeat.toLocaleString()}</p>
              <p className="text-[10px] text-white/70">FCFA/place</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xl">💺</span>
              <p className="text-lg font-bold text-gray-900 mt-1">{trip.remainingSeats}</p>
              <p className="text-[10px] text-gray-500">places</p>
            </CardContent>
          </Card>
        </div>

        {/* Driver Card */}
        <button onClick={handleViewDriver} className="w-full text-left">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#006233]/10 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">👨‍✈️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">{trip.driver.name}</p>
                    <Check className="w-4 h-4 text-[#006233]" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {trip.driver.averageRating && (
                      <span className="text-sm">
                        {'⭐'.repeat(Math.round(trip.driver.averageRating))} {trip.driver.averageRating.toFixed(1)}
                      </span>
                    )}
                    {trip.vehicle && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className={`w-3 h-3 rounded-full ${getColorDot(trip.vehicle.color)}`} />
                        {trip.vehicle.color}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isOwnTrip && (
                <div className="mt-3">
                  <ContactButtons
                    phone={trip.driver.phone}
                    name={trip.driver.name}
                    variant="full"
                    context="passenger-to-driver"
                    origin={trip.origin}
                    destination={trip.destination}
                    date={formatDate(trip.departureTime)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </button>

        {/* Seat Selector + Book Button */}
        {!isOwnTrip && trip.remainingSeats > 0 && !hasReservation && (
          <div className="space-y-4 pb-4">
            {/* Seat selector */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💺</span>
                    <span className="text-sm font-semibold text-gray-700">Nombre de places</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSeats(Math.max(1, seats - 1))}
                      className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 hover:bg-gray-200 active:scale-90 transition-all"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-2xl font-bold text-[#006233] w-8 text-center">{seats}</span>
                    <button
                      onClick={() => setSeats(Math.min(trip.remainingSeats, seats + 1))}
                      className="w-12 h-12 rounded-2xl bg-[#006233] flex items-center justify-center text-xl font-bold text-white hover:bg-[#006233]/90 active:scale-90 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-right text-lg font-bold text-[#006233] mt-2">
                  {totalPrice.toLocaleString()} FCFA
                </p>
              </CardContent>
            </Card>

            {/* GPS Location picker - Departure */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <LocationPicker
                  label="📍 Votre point de départ (GPS)"
                  placeholder="Ex: Marché Sandaga, Dakar..."
                  onSelect={(data) => { setGpsAddress(data.address); setGpsLat(data.lat); setGpsLon(data.lon) }}
                  currentAddress={gpsAddress}
                />
              </CardContent>
            </Card>

            {/* GPS Location picker - Destination */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <LocationPicker
                  label="📍 Votre destination exacte (GPS)"
                  placeholder="Ex: Dakar Plateau, arrêt bus..."
                  onSelect={(data) => { setDestGpsAddress(data.address); setDestLat(data.lat); setDestLon(data.lon); setExactDestination(''); setCustomDestination('') }}
                  currentAddress={destGpsAddress}
                />
              </CardContent>
            </Card>

            {/* Exact destination presets */}
            {getExactDestinations().length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className="text-sm font-semibold text-gray-700">Ou choisissez un quartier :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getExactDestinations().map((dest) => (
                      <button
                        key={dest}
                        onClick={() => { setExactDestination(dest === exactDestination ? '' : dest); if (dest !== 'Autre') setCustomDestination(''); setDestGpsAddress(''); setDestLat(null); setDestLon(null) }}
                        className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                          (exactDestination && !destGpsAddress) === (exactDestination === dest)
                            ? exactDestination === dest
                              ? 'bg-[#006233] text-white shadow-lg'
                              : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#006233]/50 active:scale-95'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#006233]/50 active:scale-95'
                        }`}
                      >
                        {exactDestination === dest && !destGpsAddress && '✓ '}{dest}
                      </button>
                    ))}
                  </div>
                  {exactDestination === 'Autre' && (
                    <Input
                      type="text"
                      placeholder="Saisissez votre destination..."
                      className="h-12 rounded-2xl border-2 border-gray-200 focus:border-[#006233]"
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Package button */}
            {trip.acceptsPackages && (
              <Button
                onClick={() => setView('passenger-package-form')}
                className="w-full min-h-[56px] rounded-2xl bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#006233] font-bold text-base gap-2"
              >
                <Package className="w-5 h-5" />
                ENVOYER COLIS — {(trip.packagePricePerKg || 0).toLocaleString()} FCFA/kg
              </Button>
            )}

            {/* Book button */}
            <Button
              onClick={handleBook}
              disabled={booking}
              className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
            >
              {booking ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>✅ RÉSERVER — {totalPrice.toLocaleString()} FCFA</>
              )}
            </Button>
            <p className="text-xs text-center text-gray-400">
              💡 Le paiement se fait en cours de route ou à l&apos;arrivée
            </p>
          </div>
        )}

        {hasReservation && !isOwnTrip && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <span className="text-4xl">✅</span>
              <p className="text-sm text-gray-500 font-medium mt-3">Vous avez déjà une réservation pour ce trajet</p>
              <p className="text-xs text-gray-400 mt-1">Consultez vos réservations pour suivre l'état</p>
              <Button
                onClick={() => setView('passenger-reservations')}
                className="mt-4 bg-[#006233] hover:bg-[#006233]/90 text-white rounded-xl"
              >
                Voir mes réservations
              </Button>
            </CardContent>
          </Card>
        )}

        {trip.remainingSeats === 0 && !hasReservation && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <span className="text-4xl">🚫</span>
              <p className="text-sm text-gray-500 font-medium mt-3">Trajet complet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setCreatedReservationId(null) }}
        trip={trip}
        driver={{ name: trip.driver.name, waveBusinessLink: trip.driver.waveBusinessLink ?? null }}
        vehicle={trip.vehicle ? { brand: trip.vehicle.brand, model: trip.vehicle.model, color: trip.vehicle.color } : null}
        seats={seats}
        reservationId={createdReservationId || undefined}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  )
}
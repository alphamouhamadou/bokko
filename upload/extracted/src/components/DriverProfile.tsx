'use client'

import { useState, useEffect } from 'react'
import { Star, Car, Phone, MapPin, Clock, Award, Calendar, ChevronRight, Edit3 } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import ContactButtons from '@/components/ContactButtons'

interface DriverInfo {
  id: string
  name: string
  phone: string
  photoUrl: string | null
  bio: string | null
  experience: number | null
  totalTrips: number
  averageRating: number
  totalRatings: number
  waveBusinessLink?: string | null
  vehicle: {
    id: string
    brand: string
    model: string
    color: string
    plateNumber: string
    capacity: number
  } | null
}

interface RatingInfo {
  id: string
  score: number
  comment: string | null
  createdAt: string
  fromUser: { id: string; name: string }
  trip: { id: string; origin: string; destination: string }
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${starSize} ${i <= Math.round(rating) ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

export default function DriverProfile() {
  const { selectedDriver, user, setView, setRatingTripId } = useAppStore()
  const [driver, setDriver] = useState<DriverInfo | null>(null)
  const [ratings, setRatings] = useState<RatingInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedDriver?.id) fetchDriver()
  }, [selectedDriver])

  const fetchDriver = async () => {
    if (!selectedDriver?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/drivers/${selectedDriver.id}/profile`)
      const data = await res.json()
      setDriver(data.driver)
      setRatings(data.ratings || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 px-4 py-4 space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="flex-1 px-4 py-4 text-center">
        <p className="text-gray-500">Profil non trouvé</p>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#006233] to-[#008040] p-6 pb-8">
          <div className="flex items-center gap-4">
            {driver.photoUrl ? (
              <img
                src={driver.photoUrl}
                alt={driver.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {driver.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{driver.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StarDisplay rating={driver.averageRating} size="sm" />
                <span className="text-white/80 text-sm">
                  {driver.averageRating.toFixed(1)} ({driver.totalRatings})
                </span>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="pt-6 p-4 space-y-4">
          {/* Contact */}
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{driver.phone}</span>
          </div>

          {/* Wave Payment Badge */}
          {driver.waveBusinessLink && (
            <div className="flex items-center gap-2 bg-[#1DC3E3]/5 border border-[#1DC3E3]/20 rounded-xl p-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#1DC3E3] to-[#0EA5C9] rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17c1-1 2-2 3-1s2 3 3 2 2-3 3-2 2 1 3 2-1 2-2 3-1 2 3 3 2 2-3 3-2 2 1 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1DC3E3]">Paiement Wave accepté</p>
                <p className="text-[10px] text-gray-500">Ce chauffeur accepte les paiements Wave Business</p>
              </div>
            </div>
          )}

          {user?.id !== selectedDriver?.id && (
            <ContactButtons
              phone={driver.phone}
              name={driver.name}
              variant="full"
              context="profile"
            />
          )}

          {driver.bio && (
            <p className="text-sm text-gray-600 leading-relaxed">{driver.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Car className="w-5 h-5 text-[#006233] mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{driver.totalTrips}</p>
              <p className="text-[10px] text-gray-500">Trajets</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Award className="w-5 h-5 text-[#FFD700] mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{driver.averageRating.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">Note</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-[#CE1126] mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{driver.experience || 0}</p>
              <p className="text-[10px] text-gray-500">Ans exp.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle */}
      {driver.vehicle && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Véhicule</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FFD700]/10 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-[#FFD700]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{driver.vehicle.brand} {driver.vehicle.model}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{driver.vehicle.color}</span>
                  <span>•</span>
                  <span>{driver.vehicle.plateNumber}</span>
                  <span>•</span>
                  <span>{driver.vehicle.capacity} places</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ratings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Avis des passagers</h3>
          <Badge variant="secondary">{ratings.length} avis</Badge>
        </div>

        {ratings.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun avis pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {ratings.map((rating) => (
                <Card key={rating.id} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#006233]/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-[#006233]">
                            {rating.fromUser.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{rating.fromUser.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rating.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <StarDisplay rating={rating.score} />
                    {rating.comment && (
                      <p className="text-xs text-gray-600 mt-1">{rating.comment}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{rating.trip?.origin || ''} {rating.trip?.destination ? `→ ${rating.trip.destination}` : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Rate driver button (for passengers) */}
      {user?.role === 'PASSENGER' && driver.totalTrips > 0 && (
        <Button
          onClick={() => {
            setRatingTripId(null)
            setView('driver-rating')
          }}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#FFC107] hover:from-[#FFC107] hover:to-[#FFB000] text-[#006233] font-semibold shadow-lg"
        >
          <Star className="w-5 h-5 mr-2" />
          Noter ce chauffeur
        </Button>
      )}

      {/* Edit profile button (for drivers viewing own profile) */}
      {user?.role === 'DRIVER' && user?.id === selectedDriver?.id && (
        <Button
          onClick={() => setView('driver-profile-edit')}
          className="w-full h-12 rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold shadow-lg gap-2"
        >
          <Edit3 className="w-5 h-5" />
          Modifier mon profil
        </Button>
      )}
    </div>
  )
}

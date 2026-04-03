'use client'

import { useState, useEffect } from 'react'
import { Car, Phone, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface SharedTripData {
  id: string
  shareCode: string
  isActive: boolean
  createdAt: string
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    status: string
    driver: { id: string; name: string; phone: string; photoUrl?: string }
  }
  passenger: { id: string; name: string }
}

export default function SharedTripView() {
  const [shareData, setShareData] = useState<SharedTripData | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('share')
    if (code) {
      fetchSharedTrip(code)
    } else {
      setLoading(false)
      setError(true)
    }
  }, [])

  useEffect(() => {
    if (shareData?.isActive) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 2
        })
      }, 600)
      return () => clearInterval(interval)
    }
  }, [shareData])

  const fetchSharedTrip = async (code: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/trip-shares?code=${code}`)
      const data = await res.json()
      if (data.share) {
        setShareData(data.share)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
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
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#006233] mx-auto" />
          <p className="text-sm text-gray-500">Chargement du trajet partagé...</p>
        </div>
      </div>
    )
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="border-0 shadow-lg max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-[#CE1126]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Trajet introuvable</h3>
            <p className="text-sm text-gray-500">
              Ce partage a expiré, a été désactivé ou le code est invalide.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006233] to-[#004d28] p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Car className="w-7 h-7 text-[#FFD700]" />
          </div>
          <h1 className="text-xl font-bold text-white">BOKKO</h1>
          <p className="text-sm text-white/60">Suivi de trajet en direct</p>
        </div>

        {/* Trip Card */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-5 space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <Badge className={progress >= 100 ? 'bg-[#006233] text-white' : 'bg-[#FFD700] text-[#006233]'}>
                {progress >= 100 ? '✓ Arrivé à destination' : '🚗 En cours'}
              </Badge>
              <span className="text-xs text-gray-400">
                Code: {shareData.shareCode}
              </span>
            </div>

            {/* Route */}
            <div className="bg-gradient-to-br from-[#006233]/5 to-[#FFD700]/5 rounded-xl p-4 border border-[#006233]/10">
              <div className="flex items-center justify-between relative mb-3">
                <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2" />
                <div
                  className="absolute left-4 top-1/2 h-0.5 bg-[#006233] -translate-y-1/2 transition-all duration-700"
                  style={{ width: `${(progress / 100) * (100 - 32)}%` }}
                />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#CE1126] rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 ${
                    progress >= 100 ? 'bg-[#006233]' : 'bg-[#FFD700] shadow-lg animate-pulse'
                  }`}>
                    <Car className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-8 h-8 bg-[#006233] rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#FFD700]" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">{shareData.trip.origin}</span>
                <span>{progress}%</span>
                <span className="font-medium">{shareData.trip.destination}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Progression</span>
                <span className="font-bold text-[#006233]">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Trip Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatDate(shareData.trip.departureTime)} à {formatTime(shareData.trip.departureTime)}</span>
              </div>
            </div>

            {/* Driver Info */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Chauffeur</h4>
              <div className="flex items-center gap-3">
                {shareData.trip.driver.photoUrl ? (
                  <img
                    src={shareData.trip.driver.photoUrl}
                    alt={shareData.trip.driver.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#006233]/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#006233]">
                      {shareData.trip.driver.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">{shareData.trip.driver.name}</p>
                  <a
                    href={`tel:${shareData.trip.driver.phone}`}
                    className="text-sm text-[#006233] flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {shareData.trip.driver.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Passenger info */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400">
                Partagé par <span className="font-semibold text-gray-600">{shareData.passenger.name}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <p className="text-center text-white/40 text-xs pb-6">
          Ce trajet est partagé via <span className="font-semibold text-white/60">BOKKO</span> — Covoiturage au Sénégal
        </p>
      </div>
    </div>
  )
}

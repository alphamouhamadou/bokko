'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, CheckCircle, Phone, Car, MapPin, Clock, Loader2, StopCircle, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ReservationInfo {
  id: string
  tripId: string
  status: string
  seatsBooked: number
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    pricePerSeat: number
    status: string
    driver: { id: string; name: string; phone: string }
  }
}

interface ShareInfo {
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

interface TripShareProps {
  reservation?: ReservationInfo | null
  onBack?: () => void
}

export default function TripShare({ reservation, onBack }: TripShareProps) {
  const { user, selectedTrip, setView, shareCode: storeCode, setShareCode } = useAppStore()
  const [shareCode, setLocalShareCode] = useState<string | null>(storeCode || null)
  const [share, setShare] = useState<ShareInfo | null>(null)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)
  const [arrived, setArrived] = useState(false)

  const tripId = reservation?.tripId || selectedTrip?.id
  const trip = reservation?.trip || selectedTrip

  useEffect(() => {
    if (shareCode) {
      fetchShare()
      startSimulation()
    }
  }, [shareCode])

  const fetchShare = async () => {
    if (!shareCode) return
    try {
      const res = await fetch(`/api/trip-shares?code=${shareCode}`)
      const data = await res.json()
      if (data.share) {
        setShare(data.share)
      }
    } catch {
      // silent
    }
  }

  const createShare = async () => {
    if (!user?.id || !tripId) return
    setCreating(true)
    try {
      const res = await fetch('/api/trip-shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, passengerId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      setLocalShareCode(data.share.shareCode)
      setShareCode(data.share.shareCode)
      setShare(data.share)
      toast.success('Partage créé avec succès !')
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setCreating(false)
    }
  }

  const copyLink = () => {
    if (!shareCode) return
    const url = `${window.location.origin}?share=${shareCode}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 3000)
    }).catch(() => {
      toast.error('Impossible de copier le lien')
    })
  }

  const shareWhatsApp = () => {
    if (!shareCode || !trip) return
    const url = `${window.location.origin}?share=${shareCode}`
    const message = `🚗 Je suis en route ! Suivez mon trajet BOKKO : ${trip.origin} → ${trip.destination}\n\n🔗 ${url}\n\nPartagé via BOKKO`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareSMS = () => {
    if (!shareCode || !trip) return
    const url = `${window.location.origin}?share=${shareCode}`
    const message = `Je suis en route ! Suivez mon trajet BOKKO : ${trip.origin} → ${trip.destination}. Lien: ${url}`
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank')
  }

  const startSimulation = () => {
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 10
      setProgress(currentProgress)
      if (currentProgress >= 100) {
        setArrived(true)
        clearInterval(interval)
      }
    }, 3000)
    return () => clearInterval(interval)
  }

  const stopSharing = async () => {
    if (!share?.id) return
    try {
      await fetch(`/api/trip-shares/${share.id}/deactivate`, { method: 'PATCH' })
      toast.success('Partage arrêté')
      setLocalShareCode(null)
      setShareCode(null)
      if (onBack) onBack()
      else setView('passenger-reservations')
    } catch {
      toast.error('Erreur')
    }
  }

  if (arrived) {
    return (
      <div className="flex-1 px-4 py-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-[#006233]/10 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10 text-[#006233]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Arrivé à destination !</h3>
            <p className="text-sm text-gray-500">
              {trip?.origin} → {trip?.destination}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={stopSharing}
                className="flex-1 rounded-2xl h-12"
              >
                Arrêter le partage
              </Button>
              <Button
                onClick={() => {
                  setArrived(false)
                  setProgress(0)
                  startSimulation()
                }}
                className="flex-1 rounded-2xl h-12 bg-[#006233] text-white"
              >
                Redémarrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Partager mon trajet</h2>
        <p className="text-sm text-gray-500">Permettez à vos proches de suivre votre voyage</p>
      </div>

      {!shareCode ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#006233]/10 rounded-full flex items-center justify-center mx-auto">
              <Share2 className="w-8 h-8 text-[#006233]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Activer le partage</h3>
              <p className="text-sm text-gray-500 mt-1">
                Un code unique sera généré pour suivre votre trajet en temps réel.
              </p>
            </div>
            {trip && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-medium">
                  {trip.origin} → {trip.destination}
                </p>
              </div>
            )}
            <Button
              onClick={createShare}
              disabled={creating}
              className="w-full h-12 rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold shadow-lg"
            >
              {creating ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Share2 className="w-5 h-5 mr-2" />
              )}
              Générer le code de partage
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Share Code */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-[#006233] to-[#008040]">
            <CardContent className="p-4 text-center text-white">
              <p className="text-xs text-white/70 mb-1">Code de partage</p>
              <p className="text-3xl font-bold font-mono tracking-widest">{shareCode}</p>
              <p className="text-xs text-white/60 mt-1">Partagez ce code avec vos proches</p>
            </CardContent>
          </Card>

          {/* Share Options */}
          <div className="space-y-2">
            <Button
              onClick={copyLink}
              className="w-full h-12 rounded-2xl bg-white border border-gray-200 shadow-sm justify-start px-4 gap-3"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-[#006233]" />
              ) : (
                <Copy className="w-5 h-5 text-gray-500" />
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {copied ? 'Lien copié !' : 'Copier le lien'}
                </p>
                <p className="text-xs text-gray-400">Copier le lien de suivi</p>
              </div>
            </Button>

            <Button
              onClick={shareWhatsApp}
              className="w-full h-12 rounded-2xl bg-white border border-gray-200 shadow-sm justify-start px-4 gap-3"
            >
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                <p className="text-xs text-gray-400">Envoyer via WhatsApp</p>
              </div>
            </Button>

            <Button
              onClick={shareSMS}
              className="w-full h-12 rounded-2xl bg-white border border-gray-200 shadow-sm justify-start px-4 gap-3"
            >
              <Phone className="w-5 h-5 text-gray-500" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">SMS</p>
                <p className="text-xs text-gray-400">Envoyer par SMS</p>
              </div>
            </Button>
          </div>

          {/* Simulated Map / Progress */}
          {trip && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Suivi en direct</h4>

                {/* Route visualization */}
                <div className="bg-gradient-to-br from-[#006233]/5 to-[#FFD700]/5 rounded-xl p-4 border border-[#006233]/10">
                  <div className="flex items-center justify-between relative mb-3">
                    <div className="absolute left-4 right-4 top-1/2 h-1 bg-gray-200 rounded-full -translate-y-1/2" />
                    <div
                      className="absolute left-4 top-1/2 h-1 bg-[#006233] rounded-full -translate-y-1/2 transition-all duration-1000"
                      style={{ width: `${(progress / 100) * (100 - 16)}%` }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#CE1126] rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-1000 ${
                        progress >= 100
                          ? 'bg-[#006233] animate-bounce'
                          : 'bg-[#FFD700] shadow-lg'
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
                    <span className="font-medium">{trip.origin}</span>
                    <span>{progress}%</span>
                    <span className="font-medium">{trip.destination}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Progression</span>
                    <Badge variant="outline" className="text-[10px]">
                      {progress < 100 ? 'En cours' : 'Arrivé'}
                    </Badge>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#006233] to-[#FFD700] rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {share && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    <Car className="w-3.5 h-3.5" />
                    <span>Chauffeur : {share.trip.driver.name}</span>
                    <span>•</span>
                    <Phone className="w-3 h-3" />
                    <span>{share.trip.driver.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stop sharing */}
          <Button
            onClick={stopSharing}
            variant="outline"
            className="w-full h-12 rounded-2xl border-[#CE1126]/30 text-[#CE1126] hover:bg-[#CE1126]/10 gap-2"
          >
            <StopCircle className="w-5 h-5" />
            Arrêter le partage
          </Button>
        </>
      )}
    </div>
  )
}

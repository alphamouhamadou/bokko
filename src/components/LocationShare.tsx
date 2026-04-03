'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Navigation, Loader2, Pause, Play, X } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { useGeolocation } from '@/hooks/use-geolocation'
import { reverseGeocode } from '@/lib/geocoding'
import { toast } from 'sonner'

interface LocationShareProps {
  reservationId: string
  passengerId: string
}

export default function LocationShare({ reservationId, passengerId }: LocationShareProps) {
  const [sharing, setSharing] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { location, loading: geoLoading, refresh: geoRefresh } = useGeolocation(sharing)
  const goBack = useAppStore((s) => s.goBack)

  const sendLocation = useCallback(async () => {
    if (!location) return
    try {
      let addr = address
      if (!addr) {
        const reverseAddr = await reverseGeocode(location.latitude, location.longitude)
        if (reverseAddr) {
          setAddress(reverseAddr)
          addr = reverseAddr
        }
      }

      await fetch(`/api/reservations/${reservationId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passengerId,
          lat: location.latitude,
          lon: location.longitude,
          address: addr || '',
        }),
      })
      setLastUpdate(new Date())
    } catch {
      // silent — will retry on next interval
    }
  }, [location, address, reservationId, passengerId])

  // Send location periodically when sharing
  useEffect(() => {
    if (sharing && location) {
      sendLocation()
      intervalRef.current = setInterval(sendLocation, 30000) // every 30 seconds
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sharing, location, sendLocation])

  const toggleSharing = () => {
    if (!sharing) {
      setSharing(true)
      geoRefresh()
      toast.success('Partage de position activé 📍')
    } else {
      setSharing(false)
      if (intervalRef.current) clearInterval(intervalRef.current)
      toast.info('Partage de position désactivé')
    }
  }

  const timeAgo = lastUpdate
    ? Math.floor((Date.now() - lastUpdate.getTime()) / 1000)
    : null

  const formatTimeAgo = (seconds: number) => {
    if (seconds < 60) return `il y a ${seconds}s`
    return `il y a ${Math.floor(seconds / 60)}min`
  }

  return (
    <div className="bg-gradient-to-br from-[#006233]/5 to-[#FFD700]/5 rounded-2xl p-4 border border-[#006233]/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className={`w-5 h-5 ${sharing ? 'text-[#006233] animate-pulse' : 'text-gray-400'}`} />
          <span className="text-sm font-semibold text-gray-700">
            {sharing ? 'Position partagée' : 'Partager ma position'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {timeAgo !== null && (
            <span className="text-[10px] text-gray-400">
              {formatTimeAgo(timeAgo)}
            </span>
          )}
          <button
            onClick={toggleSharing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              sharing
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-[#006233] text-white hover:bg-[#006233]/90'
            }`}
          >
            {geoLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : sharing ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            {sharing ? 'Arrêter' : 'Partager'}
          </button>
        </div>
      </div>

      {address && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {address}
        </p>
      )}

      {sharing && !geoLoading && !location && (
        <p className="text-xs text-amber-600 mt-1">En attente du signal GPS...</p>
      )}
    </div>
  )
}

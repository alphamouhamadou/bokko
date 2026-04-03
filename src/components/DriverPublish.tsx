'use client'

import { useState } from 'react'
import { Loader2, Package } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const LOCATIONS = ['Thiènaba', 'Thiès', 'Dakar']

const TIME_SLOTS = [
  { key: '7', label: 'Matin', icon: '🌅', hour: '7h' },
  { key: '12', label: 'Midi', icon: '☀️', hour: '12h' },
  { key: '17', label: 'Soir', icon: '🌆', hour: '17h' },
]

const PRICE_PRESETS = [2000, 2500, 3000]
const PACKAGE_PRICE_PRESETS = [2000, 3000, 5000]

export default function DriverPublish() {
  const { user, setView } = useAppStore()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [dateType, setDateType] = useState<'today' | 'tomorrow' | 'dayafter' | ''>('tomorrow')
  const [timeSlot, setTimeSlot] = useState('')
  const [customHour, setCustomHour] = useState('')
  const [pricePerSeat, setPricePerSeat] = useState<number | null>(null)
  const [customPrice, setCustomPrice] = useState('')
  const [availableSeats, setAvailableSeats] = useState(4)
  const [acceptsPackages, setAcceptsPackages] = useState(false)
  const [packagePrice, setPackagePrice] = useState<number | null>(null)
  const [customPackagePrice, setCustomPackagePrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSwap = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  const getDepartureTime = () => {
    const hour = customHour || timeSlot || '7'
    const h = parseInt(hour)
    const d = new Date()
    if (dateType === 'tomorrow') d.setDate(d.getDate() + 1)
    if (dateType === 'dayafter') d.setDate(d.getDate() + 2)
    d.setHours(h, 0, 0, 0)
    return d
  }

  const finalPrice = pricePerSeat || parseInt(customPrice) || 0
  const finalPackagePrice = packagePrice || parseInt(customPackagePrice) || 0

  const handleSubmit = async () => {
    if (!origin || !destination) {
      toast.error('Choisissez le trajet')
      return
    }
    if (origin === destination) {
      toast.error('Choisissez des lieux différents')
      return
    }
    if (!finalPrice || finalPrice <= 0) {
      toast.error('Choisissez un prix')
      return
    }
    setLoading(true)
    try {
      const departureTime = getDepartureTime()
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: user?.id,
          origin,
          destination,
          departureTime: departureTime.toISOString(),
          pricePerSeat: finalPrice,
          availableSeats,
          tripType: 'ALLER_SIMPLE',
          description: null,
          acceptsPackages,
          packagePricePerKg: acceptsPackages ? finalPackagePrice : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la publication')
        return
      }
      toast.success('Trajet publié ! ✅')
      setView('driver-dashboard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Publier un trajet</h2>
        <p className="text-sm text-gray-500">Remplissez les infos rapidement</p>
      </div>

      {/* Section 1: Route */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            📍 Trajet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Départ</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={`origin-${loc}`}
                  onClick={() => setOrigin(loc === origin ? '' : loc)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                    origin === loc
                      ? 'bg-[#006233] text-white shadow-lg'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#006233]/50 active:scale-95'
                  }`}
                >
                  {origin === loc && '✓ '}{loc}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 active:scale-90 transition-all"
            >
              <span className="text-lg">⇄</span>
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Destination</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={`dest-${loc}`}
                  onClick={() => setDestination(loc === destination ? '' : loc)}
                  className={`px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                    destination === loc
                      ? 'bg-[#006233] text-white shadow-lg'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#006233]/50 active:scale-95'
                  }`}
                >
                  {destination === loc && '✓ '}{loc}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: When */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            🕐 Quand partir ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Date */}
          <div className="flex gap-2">
            {[
              { key: 'today', label: "Aujourd'hui" },
              { key: 'tomorrow', label: 'Demain' },
              { key: 'dayafter', label: 'Après-demain' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateType(dateType === key ? '' : key as any)}
                className={`flex-1 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                  dateType === key
                    ? 'bg-[#FFD700] text-[#006233] shadow-lg'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#FFD700]/50 active:scale-95'
                }`}
              >
                📅 {label}
              </button>
            ))}
          </div>

          {/* Time slots */}
          <div className="flex gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.key}
                onClick={() => { setTimeSlot(slot.key); setCustomHour('') }}
                className={`flex-1 py-3 rounded-2xl text-xs font-semibold transition-all min-h-[44px] ${
                  timeSlot === slot.key && !customHour
                    ? 'bg-[#006233] text-white shadow-lg'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#006233]/50 active:scale-95'
                }`}
              >
                {slot.icon} {slot.label} ({slot.hour})
              </button>
            ))}
          </div>

          {/* Custom hour */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Autre heure (ex: 8)"
              min="5"
              max="22"
              className="h-12 rounded-2xl text-center text-lg font-semibold border-2 border-gray-200 focus:border-[#006233]"
              value={customHour}
              onChange={(e) => { setCustomHour(e.target.value); setTimeSlot('') }}
            />
            <span className="text-sm text-gray-500 font-medium">heures</span>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Price */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            💰 Prix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            {PRICE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => { setPricePerSeat(p); setCustomPrice('') }}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all min-h-[44px] ${
                  pricePerSeat === p && !customPrice
                    ? 'bg-[#006233] text-white shadow-lg'
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#006233]/50 active:scale-95'
                }`}
              >
                {p.toLocaleString()} FCFA
              </button>
            ))}
          </div>
          <Input
            type="number"
            placeholder="Autre prix (FCFA)"
            className="h-12 rounded-2xl text-center text-lg font-semibold border-2 border-gray-200 focus:border-[#006233]"
            value={customPrice}
            onChange={(e) => { setCustomPrice(e.target.value); setPricePerSeat(null) }}
          />
        </CardContent>
      </Card>

      {/* Section 4: Seats */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            💺 Places
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setAvailableSeats(Math.max(1, availableSeats - 1))}
              className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600 hover:bg-gray-200 active:scale-90 transition-all"
            >
              −
            </button>
            <span className="text-3xl font-bold text-[#006233] w-10 text-center">{availableSeats}</span>
            <button
              onClick={() => setAvailableSeats(Math.min(7, availableSeats + 1))}
              className="w-14 h-14 rounded-2xl bg-[#006233] flex items-center justify-center text-2xl font-bold text-white hover:bg-[#006233]/90 active:scale-90 transition-all"
            >
              +
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Packages */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <span className="text-base font-bold text-gray-900">Accepter colis ?</span>
            </div>
            <button
              type="button"
              onClick={() => setAcceptsPackages(!acceptsPackages)}
              className={`relative w-14 h-8 rounded-full transition-colors ${acceptsPackages ? 'bg-[#006233]' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${acceptsPackages ? 'left-7' : 'left-1'}`}
              />
            </button>
          </div>

          {acceptsPackages && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Prix par colis</p>
              <div className="flex gap-2">
                {PACKAGE_PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPackagePrice(p); setCustomPackagePrice('') }}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all min-h-[40px] ${
                      packagePrice === p && !customPackagePrice
                        ? 'bg-[#FFD700] text-[#006233] shadow-lg'
                        : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#FFD700]/50 active:scale-95'
                    }`}
                  >
                    {p} FCFA
                  </button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Autre prix (FCFA)"
                className="h-11 rounded-2xl text-center text-sm font-semibold border-2 border-gray-200 focus:border-[#FFD700]"
                value={customPackagePrice}
                onChange={(e) => { setCustomPackagePrice(e.target.value); setPackagePrice(null) }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          '🚀 PUBLIER'
        )}
      </Button>
    </div>
  )
}

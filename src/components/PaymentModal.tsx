'use client'

import { useState } from 'react'
import { MapPin, Clock, Car, User, CheckCircle2, X, ExternalLink, Loader2, Banknote } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    pricePerSeat: number
  }
  driver: {
    name: string
    waveBusinessLink: string | null
  }
  vehicle?: {
    brand: string
    model: string
    color: string
  } | null
  seats: number
  reservationId?: string
  onPaymentComplete?: () => void
}

export default function PaymentModal({
  isOpen,
  onClose,
  trip,
  driver,
  vehicle,
  seats,
  reservationId,
  onPaymentComplete,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'WAVE' | 'CASH' | null>(null)
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const totalAmount = trip.pricePerSeat * seats

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui"
    if (d.toDateString() === tomorrow.toDateString()) return 'Demain'
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const handleWavePay = () => {
    window.open(driver.waveBusinessLink, '_blank', 'noopener,noreferrer')
    setPaymentInitiated(true)
  }

  const handleCashPay = () => {
    setPaymentInitiated(true)
  }

  const handleConfirmPayment = async () => {
    if (!reservationId) {
      toast.error('Réservation non trouvée')
      return
    }
    setConfirming(true)
    try {
      const res = await fetch(`/api/reservations/${reservationId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus: 'PAID',
          paymentMethod: selectedMethod,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la confirmation')
        return
      }
      const methodLabel = selectedMethod === 'CASH' ? 'en espèces' : 'via Wave'
      toast.success(`Paiement ${methodLabel} confirmé ! En attente de validation du chauffeur.`)
      onPaymentComplete?.()
      onClose()
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setConfirming(false)
    }
  }

  const handleClose = () => {
    setSelectedMethod(null)
    setPaymentInitiated(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006233] to-[#004d28] p-5">
          <DialogHeader>
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              <span className="text-xl">💳</span>
              Paiement de la réservation
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-1">
            Choisissez votre méthode de paiement
          </p>
        </div>

        {!selectedMethod ? (
          /* Step 1: Choose payment method */
          <div className="p-5 space-y-4">
            {/* Trip Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Résumé du trajet</h4>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#CE1126] flex-shrink-0" />
                <span className="text-sm font-semibold">{trip.origin}</span>
                <span className="text-gray-300">→</span>
                <MapPin className="w-4 h-4 text-[#006233] flex-shrink-0" />
                <span className="text-sm font-semibold">{trip.destination}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(trip.departureTime)} à {formatTime(trip.departureTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>{driver.name}</span>
              </div>
              {vehicle && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Car className="w-3 h-3" />
                  <span>{vehicle.brand} {vehicle.model} ({vehicle.color})</span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Détail du prix</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Prix par place × {seats} place{seats > 1 ? 's' : ''}
                </span>
                <span className="font-medium">{trip.pricePerSeat.toLocaleString()} × {seats}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold text-[#006233]">{totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Choisissez la méthode</h4>

              {/* Wave Option */}
              {driver.waveBusinessLink && (
                <button
                  onClick={() => setSelectedMethod('WAVE')}
                  className="w-full flex items-center gap-3 bg-[#1DC3E3]/5 border-2 border-transparent hover:border-[#1DC3E3]/40 rounded-2xl p-4 transition-all active:scale-[0.98]"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-[#1DC3E3] to-[#0EA5C9] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17c1-1 2-2 3-1s2 3 3 2 2-3 3-2 2 1 3 2-1 2-2 3-1 2 3 3 2 2-3 3-2 2 1 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base font-bold text-gray-900">Payer par Wave 💳</p>
                    <p className="text-xs text-gray-500 mt-0.5">Paiement mobile instantané</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-[#1DC3E3]/10 text-[#1DC3E3] border-[#1DC3E3]/20 text-[10px]">
                      Rapide
                    </Badge>
                  </div>
                </button>
              )}

              {/* Cash Option */}
              <button
                onClick={() => setSelectedMethod('CASH')}
                className="w-full flex items-center gap-3 bg-[#FFD700]/5 border-2 border-transparent hover:border-[#FFD700]/40 rounded-2xl p-4 transition-all active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-[#FFD700] to-[#F5C200] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-7 h-7 text-[#006233]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-base font-bold text-gray-900">Payer en espèces 💵</p>
                  <p className="text-xs text-gray-500 mt-0.5">Donnez l&apos;argent au chauffeur</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="bg-[#FFD700]/10 text-[#B8960F] border-[#FFD700]/20 text-[10px]">
                    Simple
                  </Badge>
                </div>
              </button>
            </div>
          </div>
        ) : !paymentInitiated ? (
          /* Step 2: Confirm payment (Wave opens link, Cash just confirms) */
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setSelectedMethod(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <span className="text-sm">←</span>
              </button>
              <span className="text-sm font-semibold text-gray-700">
                {selectedMethod === 'WAVE' ? '💳 Paiement Wave' : '💵 Paiement en espèces'}
              </span>
            </div>

            {/* Trip summary compact */}
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-[#CE1126]" />
                  <span className="font-semibold">{trip.origin}</span>
                  <span className="text-gray-300">→</span>
                  <MapPin className="w-4 h-4 text-[#006233]" />
                  <span className="font-semibold">{trip.destination}</span>
                </div>
                <span className="text-lg font-bold text-[#006233]">{totalAmount.toLocaleString()} FCFA</span>
              </div>
            </div>

            {selectedMethod === 'WAVE' ? (
              <>
                {/* Wave instructions */}
                <div className="bg-[#1DC3E3]/5 border border-[#1DC3E3]/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#1DC3E3] to-[#0EA5C9] rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17c1-1 2-2 3-1s2 3 3 2 2-3 3-2 2 1 3 2-1 2-2 3-1 2 3 3 2 2-3 3-2 2 1 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Transférez sur Wave</p>
                      <p className="text-xs text-gray-500">{totalAmount.toLocaleString()} FCFA à {driver.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={handleWavePay}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1DC3E3] to-[#0EA5C9] hover:from-[#1AB8D6] hover:to-[#0D9ABD] text-white font-semibold gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir Wave pour payer
                    </Button>
                    <p className="text-[11px] text-center text-gray-400">
                      💡 Effectuez le transfert sur Wave, puis revenez confirmer
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Cash instructions */}
                <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#FFD700] to-[#F5C200] rounded-xl flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-[#006233]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Payez en espèces</p>
                      <p className="text-xs text-gray-500">{totalAmount.toLocaleString()} FCFA au chauffeur</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-xl p-3 space-y-1">
                      <p className="text-xs text-gray-500">📞 Donnez l&apos;argent directement au chauffeur :</p>
                      <p className="text-sm font-semibold text-gray-900">{driver.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(trip.departureTime)} à {formatTime(trip.departureTime)}
                      </p>
                    </div>
                    <p className="text-[11px] text-center text-gray-400">
                      💡 Cliquez sur confirmer une fois le paiement fait
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <Button
                onClick={selectedMethod === 'WAVE' ? handleWavePay : handleCashPay}
                className="w-full h-12 rounded-xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                J&apos;ai effectué le paiement
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full h-10 rounded-xl text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          /* Step 3: Payment confirmation screen */
          <div className="p-5 space-y-5">
            <div className="text-center space-y-4 py-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                selectedMethod === 'WAVE' ? 'bg-[#1DC3E3]/10' : 'bg-[#FFD700]/10'
              }`}>
                <CheckCircle2 className={`w-8 h-8 ${selectedMethod === 'WAVE' ? 'text-[#1DC3E3]' : 'text-[#FFD700]'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-base">
                  {selectedMethod === 'WAVE'
                    ? 'Effectuez votre paiement sur Wave'
                    : 'Confirmez votre paiement en espèces'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedMethod === 'WAVE' ? (
                    <>La page de paiement Wave est ouverte dans un nouvel onglet. Effectuez le transfert de <span className="font-bold text-[#1DC3E3]">{totalAmount.toLocaleString()} FCFA</span> puis revenez confirmer.</>
                  ) : (
                    <>Donnez <span className="font-bold text-[#FFD700]">{totalAmount.toLocaleString()} FCFA</span> au chauffeur puis confirmez.</>
                  )}
                </p>
              </div>
            </div>

            {selectedMethod === 'WAVE' && (
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl p-3">
                <p className="text-xs text-[#006233] text-center">
                  💡 Si la page ne s&apos;est pas ouverte,{' '}
                  <button
                    onClick={() => window.open(driver.waveBusinessLink, '_blank', 'noopener,noreferrer')}
                    className="text-[#1DC3E3] font-semibold underline"
                  >
                    cliquez ici
                  </button>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full h-12 rounded-xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold"
              >
                {confirming ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                {selectedMethod === 'WAVE'
                  ? "J'ai effectué le paiement Wave"
                  : "J'ai payé en espèces"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full h-10 rounded-xl text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

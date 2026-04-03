'use client'

import { useState, useEffect } from 'react'
import { Package, MapPin, User, Phone, ArrowRight, Truck, HandCoins, CheckCircle2, ExternalLink, Loader2, Check } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import ContactButtons from '@/components/ContactButtons'

interface PackageData {
  id: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  paidAt: string | null
  description: string
  weight: number
  size: string
  senderName: string
  senderPhone: string
  recipientName: string
  recipientPhone: string
  recipientAddress: string
  amount: number
  notes: string | null
  createdAt: string
  trip: {
    id: string
    origin: string
    destination: string
    departureTime: string
    status: string
    driver: { id: string; name: string; phone: string; waveBusinessLink?: string | null }
  }
  sender: { id: string; name: string; phone: string }
}

export default function PassengerPackages() {
  const { user } = useAppStore()
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [paidPkgs, setPaidPkgs] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) fetchPackages()
  }, [user])

  const fetchPackages = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/packages?senderId=${user.id}`)
      const data = await res.json()
      setPackages(data.packages)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'En attente', color: 'bg-[#FFD700] text-[#006233]' },
      ACCEPTED: { label: 'Accepté', color: 'bg-blue-100 text-blue-700' },
      PICKED_UP: { label: 'Récupéré', color: 'bg-purple-100 text-purple-700' },
      IN_TRANSIT: { label: 'En transit', color: 'bg-orange-100 text-orange-700' },
      DELIVERED: { label: 'Livré ✅', color: 'bg-[#006233] text-white' },
      CANCELLED: { label: 'Annulé', color: 'bg-gray-100 text-gray-500' },
    }
    const cfg = config[status] || { label: status, color: 'bg-gray-100 text-gray-500' }
    return <Badge className={`${cfg.color} text-xs border-0`}>{cfg.label}</Badge>
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const config: Record<string, { label: string; color: string }> = {
      PENDING: { label: 'Paiement en attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      PAID: { label: 'Paiement envoyé', color: 'bg-[#1DC3E3]/10 text-[#1DC3E3] border-[#1DC3E3]/20' },
      CONFIRMED_BY_DRIVER: { label: 'Paiement confirmé', color: 'bg-[#006233] text-white' },
    }
    const cfg = config[paymentStatus] || { label: '', color: '' }
    return cfg.label ? <Badge className={`${cfg.color} text-[10px] border`}>{cfg.label}</Badge> : null
  }

  const getStatusProgress = (status: string) => {
    const steps = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']
    const idx = steps.indexOf(status)
    return idx >= 0 ? idx : -1
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const activePackages = packages.filter(p => !['DELIVERED', 'CANCELLED'].includes(p.status))
  const pastPackages = packages.filter(p => ['DELIVERED', 'CANCELLED'].includes(p.status))

  const PackageCard = ({ pkg }: { pkg: PackageData }) => {
    const progress = getStatusProgress(pkg.status)
    const isActive = pkg.status === 'PICKED_UP' || pkg.status === 'IN_TRANSIT'
    const isNotPaid = pkg.paymentStatus !== 'PAID' && pkg.paymentStatus !== 'CONFIRMED_BY_DRIVER'
    const canPay = isNotPaid && pkg.status !== 'CANCELLED'
    const hasWaveLink = !!pkg.trip.driver.waveBusinessLink

    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 space-y-3">
          {/* Status + Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(pkg.status)}
              {getPaymentStatusBadge(pkg.paymentStatus)}
            </div>
            <span className="text-base font-bold text-[#006233]">
              {pkg.amount.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">FCFA</span>
            </span>
          </div>

          {/* Package Description */}
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-[#FFD700] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{pkg.description}</p>
              <p className="text-xs text-gray-500">
                {pkg.weight}kg &bull; Taille {pkg.size} &bull; {formatDate(pkg.createdAt)}
              </p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3 text-[#CE1126]" />
            <span>{pkg.trip.origin}</span>
            <ArrowRight className="w-3 h-3" />
            <MapPin className="w-3 h-3 text-[#006233]" />
            <span>{pkg.trip.destination}</span>
          </div>

          {/* Recipient */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600"><span className="font-medium">Destinataire:</span> {pkg.recipientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">{pkg.recipientPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">{pkg.recipientAddress}</span>
            </div>
          </div>

          {/* Progress Tracker */}
          {progress >= 0 && (
            <div className="flex items-center gap-1">
              {['PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all ${
                      i <= progress ? 'bg-[#006233]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Payment buttons - when not paid and not cancelled/delivered */}
          {canPay && (
            <>
              {/* Wave Pay Button - only if driver has wave link */}
              {hasWaveLink && (
                <>
                  <Button
                    onClick={() => {
                      window.open(pkg.trip.driver.waveBusinessLink!, '_blank', 'noopener,noreferrer')
                      setPaidPkgs(prev => [...prev, pkg.id])
                    }}
                    className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#1DC3E3] to-[#0EA5C9] hover:from-[#1AB8D6] hover:to-[#0D9ABD] text-white font-semibold text-sm shadow-lg gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    PAYER PAR WAVE 💳 &mdash; {pkg.amount.toLocaleString()} FCFA
                  </Button>

                  {paidPkgs.includes(pkg.id) && (
                    <Button
                      onClick={async () => {
                        setPaying(pkg.id)
                        try {
                          const res = await fetch(`/api/packages/${pkg.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paymentStatus: 'PAID', paymentMethod: 'WAVE' }),
                          })
                          if (!res.ok) {
                            const data = await res.json()
                            toast.error(data.error || 'Erreur')
                            return
                          }
                          toast.success('✅ Paiement Wave signalé ! En attente de confirmation du chauffeur.')
                          fetchPackages()
                        } catch {
                          toast.error('Erreur de connexion')
                        } finally {
                          setPaying(null)
                        }
                      }}
                      disabled={paying === pkg.id}
                      className="w-full min-h-[48px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-semibold text-sm gap-2"
                    >
                      {paying === pkg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      J&apos;AI EFFECTUÉ LE PAIEMENT WAVE
                    </Button>
                  )}

                  {!paidPkgs.includes(pkg.id) && (
                    <p className="text-xs text-center text-gray-400 mt-1">
                      💡 Cliquez sur le bouton, payez sur Wave, puis revenez confirmer
                    </p>
                  )}
                </>
              )}

              {/* Cash Pay Button - always available */}
              <Button
                onClick={async () => {
                  setPaying(pkg.id)
                  try {
                    const res = await fetch(`/api/packages/${pkg.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ paymentStatus: 'PAID', paymentMethod: 'CASH' }),
                    })
                    if (!res.ok) {
                      const data = await res.json()
                      toast.error(data.error || 'Erreur')
                      return
                    }
                    toast.success('✅ Paiement en espèces signalé ! En attente de confirmation du chauffeur.')
                    fetchPackages()
                  } catch {
                    toast.error('Erreur de connexion')
                  } finally {
                    setPaying(null)
                  }
                }}
                disabled={paying === pkg.id}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-[#FFD700] to-[#F5C200] hover:from-[#F0C800] hover:to-[#E0B500] text-[#006233] font-semibold text-sm shadow-lg gap-2"
              >
                {paying === pkg.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HandCoins className="w-4 h-4" />
                )}
                J&apos;AI PAYÉ EN ESPÈCES 💵 &mdash; {pkg.amount.toLocaleString()} FCFA
              </Button>
            </>
          )}

          {/* Payment confirmed by driver */}
          {pkg.paymentStatus === 'CONFIRMED_BY_DRIVER' && (
            <div className="flex items-center gap-2 bg-[#006233]/5 rounded-xl p-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#006233]" />
              <span className="text-xs text-[#006233] font-medium">
                Paiement {pkg.paymentMethod === 'CASH' ? 'en espèces' : 'via Wave'} confirmé par le chauffeur ✅
              </span>
            </div>
          )}

          {/* Driver info + contact */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#006233]/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#006233]" />
              </div>
              <div>
                <p className="text-xs font-medium">{pkg.trip.driver.name}</p>
                <p className="text-[10px] text-gray-400">Chauffeur</p>
              </div>
            </div>
            <ContactButtons phone={pkg.trip.driver.phone} variant="compact" context="driver-to-passenger" />
          </div>

          {/* Notes */}
          {pkg.notes && (
            <div className="text-xs text-gray-500 bg-yellow-50 rounded-lg p-2 border border-yellow-100">
              📝 {pkg.notes}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#FFD700]" />
          Mes colis
        </h2>
        <p className="text-sm text-gray-500">Suivez vos envois en temps réel</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Aucun colis envoyé</p>
            <p className="text-xs text-gray-400 mt-1">
              Envoyez un colis lors de la réservation d&apos;un trajet
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Packages */}
          {activePackages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#CE1126] mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                {activePackages.length} colis en cours
              </h3>
              <div className="space-y-3">
                {activePackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}

          {/* Past Packages */}
          {pastPackages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Historique ({pastPackages.length})
              </h3>
              <div className="space-y-3">
                {pastPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Package, MapPin, User, Phone, Check, X, Loader2, ArrowRight, Truck, CheckCircle2, AlertCircle, ShieldCheck, CreditCard, HandCoins, Banknote } from 'lucide-react'
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
    pricePerSeat: number
    driver: { id: string; name: string; phone: string; waveBusinessLink?: string | null }
  }
  sender: { id: string; name: string; phone: string }
}

export default function DriverPackages() {
  const { user } = useAppStore()
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) fetchPackages()
  }, [user])

  const fetchPackages = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/packages?driverId=${user.id}`)
      const data = await res.json()
      setPackages(data.packages)
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (packageId: string, newStatus: string) => {
    setUpdating(packageId)
    try {
      const res = await fetch(`/api/packages/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }
      const statusLabels: Record<string, string> = {
        ACCEPTED: 'Colis accepté',
        PICKED_UP: 'Colis récupéré',
        IN_TRANSIT: 'Colis en transit',
        DELIVERED: 'Colis livré !',
        CANCELLED: 'Livraison annulée',
      }
      toast.success(statusLabels[newStatus] || 'Statut mis à jour')
      fetchPackages()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpdating(null)
    }
  }

  const handleConfirmPayment = async (packageId: string) => {
    setUpdating(packageId)
    try {
      const res = await fetch(`/api/packages/${packageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'CONFIRMED_BY_DRIVER' }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success('Paiement colis confirmé !')
      fetchPackages()
    } catch {
      toast.error('Erreur de connexion')
    } finally {
      setUpdating(null)
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

  const getNextActions = (status: string) => {
    switch (status) {
      case 'PENDING':
        return [
          { action: 'ACCEPTED', label: 'Accepter', icon: <Check className="w-4 h-4" />, color: 'bg-[#006233] hover:bg-[#006233]/90 text-white' },
          { action: 'CANCELLED', label: 'Refuser', icon: <X className="w-4 h-4" />, color: 'border-[#CE1126]/30 text-[#CE1126] hover:bg-[#CE1126]/10' },
        ]
      case 'ACCEPTED':
        return [
          { action: 'PICKED_UP', label: 'Récupéré', icon: <Truck className="w-4 h-4" />, color: 'bg-purple-600 hover:bg-purple-700 text-white' },
        ]
      case 'PICKED_UP':
        return [
          { action: 'IN_TRANSIT', label: 'En transit', icon: <Truck className="w-4 h-4" />, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
        ]
      case 'IN_TRANSIT':
        return [
          { action: 'DELIVERED', label: 'Livré ✅', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-[#006233] hover:bg-[#006233]/90 text-white' },
        ]
      default:
        return []
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const pendingPackages = packages.filter(p => p.status === 'PENDING')
  const activePackages = packages.filter(p => !['DELIVERED', 'CANCELLED', 'PENDING'].includes(p.status))
  const pastPackages = packages.filter(p => ['DELIVERED', 'CANCELLED'].includes(p.status))

  const PackageCard = ({ pkg }: { pkg: PackageData }) => {
    const actions = getNextActions(pkg.status)
    return (
      <Card className={`border-0 shadow-sm ${pkg.status === 'PENDING' ? 'border-l-4 border-l-[#FFD700]' : ''}`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusBadge(pkg.status)}
              <Badge className="bg-[#FFD700]/20 text-[#B8860B] border-[#FFD700]/30 text-[10px]">📦 Colis</Badge>
            </div>
            <span className="text-base font-bold text-[#006233]">
              {pkg.amount.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">FCFA</span>
            </span>
          </div>

          {/* Package Details */}
          <div className="flex items-start gap-2">
            <Package className="w-4 h-4 text-[#FFD700] mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{pkg.description}</p>
              <p className="text-xs text-gray-500">{pkg.weight}kg • Taille {pkg.size}</p>
            </div>
          </div>

          {/* Sender Info */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#006233]/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-[#006233]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{pkg.senderName}</p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />{pkg.senderPhone}
              </p>
            </div>
            <ContactButtons phone={pkg.senderPhone} variant="compact" context="driver-to-passenger" />
          </div>

          {/* Recipient */}
          <div className="bg-gray-50 rounded-xl p-2.5 text-xs space-y-1">
            <p className="text-gray-600"><span className="font-medium">Destinataire:</span> {pkg.recipientName} — {pkg.recipientPhone}</p>
            <p className="text-gray-500"><MapPin className="w-3 h-3 inline mr-1" />{pkg.recipientAddress}</p>
          </div>

          {/* Route */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="w-3 h-3 text-[#CE1126]" />
            <span>{pkg.trip.origin}</span>
            <ArrowRight className="w-3 h-3" />
            <MapPin className="w-3 h-3 text-[#006233]" />
            <span>{pkg.trip.destination}</span>
            <span className="text-gray-300 mx-1">•</span>
            <span>{formatDate(pkg.trip.departureTime)}</span>
          </div>

          {pkg.notes && (
            <div className="text-xs text-gray-500 bg-yellow-50 rounded-lg p-2 border border-yellow-100">
              📝 {pkg.notes}
            </div>
          )}

          {/* Action Buttons */}
          {actions.length > 0 && (
            <div className="flex gap-2 pt-1">
              {actions.map((a) => (
                <Button
                  key={a.action}
                  size="sm"
                  variant={a.color.includes('border') ? 'outline' : 'default'}
                  onClick={() => handleStatusUpdate(pkg.id, a.action)}
                  disabled={updating === pkg.id}
                  className={`flex-1 h-10 rounded-xl text-xs gap-1 ${a.color}`}
                >
                  {updating === pkg.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : a.icon}
                  {a.label}
                </Button>
              ))}
            </div>
          )}

          {/* Payment confirmation */}
          {pkg.paymentStatus === 'PAID' && pkg.status !== 'CANCELLED' && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <div className="flex-1">
                <p className={`text-xs font-semibold flex items-center gap-1 ${pkg.paymentMethod === 'CASH' ? 'text-[#B8960F]' : 'text-[#1DC3E3]'}`}>
                  {pkg.paymentMethod === 'CASH' ? (
                    <Banknote className="w-3 h-3" />
                  ) : (
                    <CreditCard className="w-3 h-3" />
                  )}
                  {pkg.paymentMethod === 'CASH' ? '💵' : '💙'} {pkg.amount.toLocaleString()} FCFA reçus {pkg.paymentMethod === 'CASH' ? 'en espèces' : 'via Wave'} (colis)
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleConfirmPayment(pkg.id)}
                disabled={updating === pkg.id}
                className="h-9 rounded-xl bg-[#006233] hover:bg-[#006233]/90 text-white text-xs gap-1"
              >
                {updating === pkg.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                Confirmer
              </Button>
            </div>
          )}

          {pkg.paymentStatus === 'CONFIRMED_BY_DRIVER' && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Check className="w-4 h-4 text-[#006233]" />
              <p className="text-xs text-[#006233] font-medium">
                {pkg.amount.toLocaleString()} FCFA confirmé
              </p>
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
          Gérer les colis
        </h2>
        <p className="text-sm text-gray-500">Acceptez et suivez les livraisons</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Aucun colis à livrer</p>
            <p className="text-xs text-gray-400 mt-1">
              Activez &quot;J&apos;accepte les colis&quot; lors de la publication d&apos;un trajet
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Packages */}
          {pendingPackages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#CE1126] mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {pendingPackages.length} colis en attente
              </h3>
              <div className="space-y-3">
                {pendingPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </div>
          )}

          {/* Active Packages */}
          {activePackages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#FFD700] mb-2 flex items-center gap-2">
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

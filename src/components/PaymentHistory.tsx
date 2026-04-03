'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Banknote, Wallet, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface PaymentRecord {
  id: string
  amount: number
  method: string
  status: string
  confirmedAt: string | null
  createdAt: string
  relatedType: string
  relatedInfo: string
}

interface PaymentSummary {
  totalPaid: number
  totalWave: number
  totalCash: number
  count: number
}

type FilterTab = 'ALL' | 'WAVE' | 'CASH'

export default function PaymentHistory() {
  const { user } = useAppStore()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [summary, setSummary] = useState<PaymentSummary>({ totalPaid: 0, totalWave: 0, totalCash: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL')

  useEffect(() => {
    if (user?.id) fetchPayments()
  }, [user, activeFilter])

  const fetchPayments = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ userId: user.id })
      if (activeFilter !== 'ALL') {
        params.set('method', activeFilter)
      }
      const res = await fetch(`/api/payments/history?${params}`)
      const data = await res.json()
      setPayments(data.payments || [])
      setSummary(data.summary || { totalPaid: 0, totalWave: 0, totalCash: 0, count: 0 })
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const getMethodBadge = (method: string) => {
    if (method === 'WAVE') {
      return (
        <Badge className="bg-[#1DC3E3]/10 text-[#1DC3E3] border-[#1DC3E3]/20 text-[10px] gap-1">
          💙 Wave
        </Badge>
      )
    }
    return (
      <Badge className="bg-[#FFD700]/20 text-[#B8960F] border-[#FFD700]/30 text-[10px] gap-1">
        💵 Espèces
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    if (status === 'CONFIRMED') {
      return (
        <Badge className="bg-[#006233] text-white text-[10px] border-0">
          Confirmé
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 text-[10px] border-yellow-300">
        En attente
      </Badge>
    )
  }

  const filteredPayments = payments

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#FFD700]" />
          Historique des paiements
        </h2>
        <p className="text-sm text-gray-500">Suivez tous vos paiements</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#006233] to-[#008040]">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-white/70 font-medium">Total payé</p>
            <p className="text-base font-black text-white">{summary.totalPaid.toLocaleString()}</p>
            <p className="text-[9px] text-white/60">FCFA ({summary.count})</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#1DC3E3] to-[#0EA5C9]">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-white/70 font-medium">Wave</p>
            <p className="text-base font-black text-white">{summary.totalWave.toLocaleString()}</p>
            <p className="text-[9px] text-white/60">FCFA</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#FFD700] to-[#F5C200]">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-[#006233]/70 font-medium">Espèces</p>
            <p className="text-base font-black text-[#006233]">{summary.totalCash.toLocaleString()}</p>
            <p className="text-[9px] text-[#006233]/60">FCFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
        {([
          { key: 'ALL', label: 'Tous', icon: <Filter className="w-3 h-3" /> },
          { key: 'WAVE', label: 'Wave', icon: <CreditCard className="w-3 h-3" /> },
          { key: 'CASH', label: 'Espèces', icon: <Banknote className="w-3 h-3" /> },
        ] as { key: FilterTab; label: string; icon: React.ReactNode }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeFilter === tab.key
                ? 'bg-white shadow-sm text-[#006233]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Aucun paiement trouvé</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilter !== 'ALL'
                ? `Aucun paiement ${activeFilter === 'WAVE' ? 'Wave' : 'en espèces'} pour le moment`
                : 'Vos paiements confirmés apparaîtront ici'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {payment.relatedType === 'RESERVATION' ? (
                        <span className="text-sm">🚗</span>
                      ) : (
                        <span className="text-sm">📦</span>
                      )}
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {payment.relatedInfo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {getMethodBadge(payment.method)}
                      {getStatusBadge(payment.status)}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {formatDateTime(payment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-base font-bold text-[#006233]">
                      {payment.amount.toLocaleString()} <span className="text-[9px] font-normal text-gray-400">FCFA</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

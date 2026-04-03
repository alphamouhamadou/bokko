'use client'

import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Stats {
  totalTrips: number
  todayTrips: number
  activeTrips: number
  totalReservations: number
  todayReservations: number
  totalEarnings: number
  todayEarnings: number
  pendingReservations: number
  confirmedPayments: number
  pendingPackages: number
  activePackages: number
  packageEarnings: number
}

export default function DriverDashboard() {
  const { user, vehicle, setView, logout, setSelectedDriver } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) fetchStats()
  }, [user])

  const fetchStats = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/stats?driverId=${user.id}`)
      const data = await res.json()
      setStats(data.stats)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = () => {
    setSelectedDriver({
      id: user?.id,
      name: user?.name,
      phone: user?.phone,
      photoUrl: user?.photoUrl,
      bio: user?.bio,
      experience: user?.experience,
      totalTrips: user?.totalTrips || 0,
      averageRating: user?.averageRating || 0,
      totalRatings: user?.totalRatings || 0,
    })
    setView('driver-profile')
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-5">
      {/* Welcome bar */}
      <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#006233]/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👨‍✈️</span>
            </div>
            <div>
              <p className="text-sm text-[#006233]/60">Bonjour 👋</p>
              <h2 className="text-xl font-bold text-[#006233]">{user?.name}</h2>
              {vehicle && (
                <p className="text-xs text-[#006233]/50 flex items-center gap-1 mt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full bg-gray-400`} />
                  {vehicle.color} {vehicle.brand}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-[#006233]/60 hover:text-[#006233] hover:bg-[#006233]/10"
          >
            🚪
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {loading ? (
        <Skeleton className="h-10 rounded-2xl" />
      ) : (
        <div className="bg-gray-50 rounded-2xl p-3 text-center">
          <p className="text-sm text-gray-600">
            Aujourd&apos;hui : <span className="font-bold text-[#006233]">{stats?.todayTrips ?? 0} trajets</span>
            {' | '}
            <span className="font-bold text-[#006233]">{(stats?.todayEarnings ?? 0).toLocaleString()} FCFA</span>
          </p>
        </div>
      )}

      {/* 2x3 Action Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setView('driver-publish')}
          className="min-h-[100px] rounded-2xl bg-[#006233] flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <span className="text-3xl">➕</span>
          <span className="text-white font-bold text-xs">Publier trajet</span>
        </button>

        <button
          onClick={() => setView('driver-trips')}
          className="min-h-[100px] rounded-2xl bg-[#008040] flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all"
        >
          <span className="text-3xl">🛣️</span>
          <span className="text-white font-bold text-xs">Mes trajets</span>
        </button>

        <button
          onClick={() => setView('driver-manage')}
          className="min-h-[100px] rounded-2xl bg-[#FFD700] flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all relative"
        >
          {stats && stats.pendingReservations > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-[#CE1126] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {stats.pendingReservations}
            </span>
          )}
          <span className="text-3xl">✓</span>
          <span className="text-[#006233] font-bold text-xs">Réservations</span>
        </button>

        <button
          onClick={() => setView('driver-packages')}
          className="min-h-[100px] rounded-2xl bg-blue-500 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all relative"
        >
          {stats && stats.pendingPackages > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-[#CE1126] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {stats.pendingPackages}
            </span>
          )}
          <span className="text-3xl">📦</span>
          <span className="text-white font-bold text-xs">Colis</span>
        </button>

        <button
          onClick={handleViewProfile}
          className="min-h-[100px] rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-200 active:scale-95 transition-all"
        >
          <span className="text-3xl">👤</span>
          <span className="text-gray-700 font-bold text-xs">Mon profil</span>
        </button>
      </div>
    </div>
  )
}

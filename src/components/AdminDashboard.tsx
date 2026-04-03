'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, Users, AlertTriangle, Star, MapPin, LogOut, Search,
  ChevronLeft, ChevronRight, Ban, Trash2, CheckCircle, Clock,
  TrendingUp, Activity, DollarSign, Car, Package, Eye,
  UserCheck, UserX, X
} from 'lucide-react'
import { useAppStore } from '@/store/store'
import { toast } from 'sonner'

type AdminTab = 'dashboard' | 'users' | 'reports' | 'ratings' | 'trips'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const setView = useAppStore((s) => s.setView)

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Tableau de bord', icon: <Activity className="w-4 h-4" /> },
    { key: 'users', label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
    { key: 'reports', label: 'Signalements', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'ratings', label: 'Avis', icon: <Star className="w-4 h-4" /> },
    { key: 'trips', label: 'Trajets', icon: <MapPin className="w-4 h-4" /> },
  ]

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header admin */}
      <div className="bg-[#006233] dark:bg-[#004d28] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#FFD700]" />
          <div>
            <h1 className="text-white font-bold text-lg">BOKKO Admin</h1>
          </div>
        </div>
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 text-white/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="flex min-w-max px-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-[#006233] text-[#006233] dark:text-[#4ade80]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'ratings' && <RatingsTab />}
        {activeTab === 'trips' && <TripsTab />}
      </div>
    </div>
  )
}

// ==================== DASHBOARD TAB ====================
function DashboardTab() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!cancelled) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#006233]/30 border-t-[#006233] rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return <p className="text-center text-gray-500 py-10">Erreur de chargement</p>

  const kpis = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
    { label: 'Trajets actifs', value: stats.activeTrips, icon: <Car className="w-5 h-5" />, color: 'bg-[#006233]' },
    { label: 'Revenus (FCFA)', value: stats.totalRevenue?.toLocaleString() || '0', icon: <DollarSign className="w-5 h-5" />, color: 'bg-[#FFD700] text-[#006233]' },
    { label: 'Note moyenne', value: stats.averageRating || '-', icon: <Star className="w-5 h-5" />, color: 'bg-amber-500' },
  ]

  const secondaryKpis = [
    { label: 'Réservations en attente', value: stats.pendingReservations },
    { label: 'Colis en attente', value: stats.pendingPackages },
    { label: 'Comptes bloqués', value: stats.blockedUsers },
    { label: 'Signalements en attente', value: stats.pendingReports },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* KPI principaux */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className={`w-10 h-10 ${kpi.color} text-white rounded-xl flex items-center justify-center mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* KPI secondaires */}
      <div className="grid grid-cols-2 gap-3">
        {secondaryKpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Aujourd'hui / Cette semaine */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 flex justify-around">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.todayUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Inscrits aujourd&apos;hui</p>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.weekUsers}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cette semaine</p>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stats.weekTrips}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trajets / sem</p>
        </div>
      </div>

      {/* Croissance 6 mois */}
      {stats.monthlyGrowth && stats.monthlyGrowth.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#006233]" />
            Croissance sur 6 mois
          </h3>
          <div className="flex items-end gap-2 h-24">
            {stats.monthlyGrowth.map((m: any, i: number) => {
              const maxUsers = Math.max(...stats.monthlyGrowth.map((x: any) => x.users), 1)
              const height = Math.max((m.users / maxUsers) * 100, 4)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{m.users}</span>
                  <div
                    className="w-full bg-[#006233]/80 rounded-t-md transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{m.month}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#006233]/80 rounded-sm" /><span className="text-[10px] text-gray-400">Nouveaux utilisateurs</span></div>
          </div>
        </div>
      )}

      {/* Utilisateurs récents */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Utilisateurs récents</h3>
        <div className="space-y-2">
          {stats.recentUsers?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#006233]/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-[#006233]">{u.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{u.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  u.role === 'DRIVER' ? 'bg-blue-100 text-blue-700' : u.role === 'PASSENGER' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{u.role}</span>
                {u.isBlocked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Bloqué</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== USERS TAB ====================
function UsersTab() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [blockModal, setBlockModal] = useState<{ userId: string; userName: string; isBlocked: boolean } | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ userId: string; userName: string } | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { setLoading(true); fetchUsers() }, [fetchUsers])

  const handleBlock = async () => {
    if (!blockModal) return
    try {
      const res = await fetch(`/api/admin/users/${blockModal.userId}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !blockModal.isBlocked, blockedReason: blockReason }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      toast.success(blockModal.isBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué')
      setBlockModal(null)
      setBlockReason('')
      fetchUsers()
    } catch { toast.error('Erreur') }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    try {
      const res = await fetch(`/api/admin/users/${deleteModal.userId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      toast.success('Utilisateur supprimé')
      setDeleteModal(null)
      fetchUsers()
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search + Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-[#006233]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <div className="flex gap-2">
        {['', 'DRIVER', 'PASSENGER'].map((r) => (
          <button key={r || 'all'} onClick={() => { setRoleFilter(r); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              roleFilter === r ? 'bg-[#006233] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
            {r === '' ? 'Tous' : r === 'DRIVER' ? 'Chauffeurs' : 'Passagers'}
          </button>
        ))}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 focus:outline-none"
        >
          <option value="">Statut</option>
          <option value="active">Actifs</option>
          <option value="blocked">Bloqués</option>
        </select>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#006233]/30 border-t-[#006233] rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucun utilisateur trouvé</p>
      ) : (
        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    u.role === 'DRIVER' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <span className="text-sm font-bold text-[#006233] dark:text-[#4ade80]">{u.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'DRIVER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>{u.role}</span>
                      {u.isBlocked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Bloqué</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.phone}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {u.averageRating > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" /> {u.averageRating}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{u._count.trips} trajets</span>
                      <span className="text-xs text-gray-400">{u._count.reservations} réservations</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setBlockModal({ userId: u.id, userName: u.name, isBlocked: u.isBlocked })}
                    className={`p-2 rounded-lg ${u.isBlocked ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                    title={u.isBlocked ? 'Débloquer' : 'Bloquer'}
                  >
                    {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteModal({ userId: u.id, userName: u.name })}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Block Modal */}
      {blockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {blockModal.isBlocked ? 'Débloquer' : 'Bloquer'} {blockModal.userName} ?
              </h3>
              <button onClick={() => setBlockModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            {!blockModal.isBlocked && (
              <textarea
                placeholder="Raison du blocage..."
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 mb-4 resize-none h-20"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <button onClick={() => setBlockModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Annuler</button>
              <button onClick={handleBlock} className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white ${blockModal.isBlocked ? 'bg-green-600' : 'bg-red-600'}`}>
                {blockModal.isBlocked ? 'Débloquer' : 'Bloquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Supprimer {deleteModal.userName} ?</h3>
              <button onClick={() => setDeleteModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Cette action est irréversible. Toutes les données associées seront supprimées.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Annuler</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== REPORTS TAB ====================
function ReportsTab() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchReports = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const res = await fetch(`/api/admin/reports${params}`)
      const data = await res.json()
      setReports(data.reports)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [statusFilter])

  useEffect(() => { setLoading(true); fetchReports() }, [fetchReports])

  const handleUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      toast.success('Statut mis à jour')
      fetchReports()
    } catch { toast.error('Erreur') }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">En attente</span>
      case 'REVIEWED': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Traité</span>
      case 'RESOLVED': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Résolu</span>
      default: return null
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {['', 'PENDING', 'REVIEWED', 'RESOLVED'].map((s) => (
          <button key={s || 'all'} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-[#006233] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
            {s === '' ? 'Tous' : s === 'PENDING' ? 'En attente' : s === 'REVIEWED' ? 'Traité' : 'Résolu'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#006233]/30 border-t-[#006233] rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucun signalement</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.reason}</span>
                </div>
                {statusBadge(r.status)}
              </div>
              {r.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 ml-6">{r.description}</p>}
              <div className="flex items-center gap-4 ml-6 text-xs text-gray-400">
                <span>Par <strong className="text-gray-600 dark:text-gray-300">{r.reporter?.name}</strong></span>
                <span>Contre <strong className="text-gray-600 dark:text-gray-300">{r.reported?.name}</strong></span>
                {r.reported?.isBlocked && <span className="text-red-500 font-medium">Utilisateur bloqué</span>}
              </div>
              <div className="flex gap-2 mt-2 ml-6">
                {r.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleUpdate(r.id, 'REVIEWED')} className="text-xs px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">
                      <CheckCircle className="w-3 h-3 inline mr-1" />Marquer traité
                    </button>
                    <button onClick={() => handleUpdate(r.id, 'RESOLVED')} className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                      Résoudre
                    </button>
                  </>
                )}
                {r.status === 'REVIEWED' && (
                  <button onClick={() => handleUpdate(r.id, 'RESOLVED')} className="text-xs px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                    Résoudre
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== RATINGS TAB ====================
function RatingsTab() {
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ id: string; info: string } | null>(null)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch('/api/admin/ratings')
        const data = await res.json()
        setRatings(data.ratings)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchRatings()
  }, [])

  const handleDelete = async () => {
    if (!deleteModal) return
    try {
      const res = await fetch(`/api/admin/ratings/${deleteModal.id}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return }
      toast.success('Avis supprimé')
      setDeleteModal(null)
      setRatings(ratings.filter(r => r.id !== deleteModal.id))
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#006233]/30 border-t-[#006233] rounded-full animate-spin" />
        </div>
      ) : ratings.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucun avis</p>
      ) : (
        <div className="space-y-2">
          {ratings.map((r: any) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.score ? 'text-[#FFD700] fill-[#FFD700]' : 'text-gray-200 dark:text-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">{r.comment || 'Pas de commentaire'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Par <strong className="text-gray-600 dark:text-gray-300">{r.fromUser?.name}</strong></span>
                    <span>Pour <strong className="text-gray-600 dark:text-gray-300">{r.toUser?.name}</strong></span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.trip?.origin} → {r.trip?.destination}</span>
                  </div>
                </div>
                <button onClick={() => setDeleteModal({ id: r.id, info: `${r.fromUser?.name} → ${r.toUser?.name} (${r.score}★)` })}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Supprimer cet avis ?</h3>
              <button onClick={() => setDeleteModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{deleteModal.info}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Annuler</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-sm font-medium text-white">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== TRIPS TAB ====================
function TripsTab() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTrips = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '10' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/trips?${params}`)
      const data = await res.json()
      setTrips(data.trips)
      setTotalPages(data.totalPages || 1)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { setLoading(true); fetchTrips() }, [fetchTrips])

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Actif</span>
      case 'COMPLETED': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Terminé</span>
      case 'CANCELLED': return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Annulé</span>
      default: return <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{status}</span>
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        {['', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-[#006233] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
            {s === '' ? 'Tous' : s === 'ACTIVE' ? 'Actifs' : s === 'COMPLETED' ? 'Terminés' : 'Annulés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#006233]/30 border-t-[#006233] rounded-full animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Aucun trajet</p>
      ) : (
        <div className="space-y-2">
          {trips.map((t: any) => (
            <div key={t.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-[#006233]" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t.origin} → {t.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 ml-6">
                    <span>{formatDate(t.departureTime)}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{t.pricePerSeat} FCFA</span>
                    <span>{t.availableSeats} places</span>
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>
              <div className="flex items-center justify-between ml-6 mt-1">
                <span className="text-xs text-gray-400">
                  🚗 {t.driver?.name} ({t.driver?.phone})
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{t._count.reservations} rés.</span>
                  <span>{t._count.packages} colis</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

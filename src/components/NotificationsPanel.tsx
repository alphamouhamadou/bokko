'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, CheckCircle, XCircle, UserPlus, Flag, CheckCheck, Bell } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  data: string | null
  createdAt: string
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'TRIP_AVAILABLE':
      return <MapPin className="w-5 h-5 text-[#006233]" />
    case 'RESERVATION_CONFIRMED':
      return <CheckCircle className="w-5 h-5 text-[#006233]" />
    case 'RESERVATION_REFUSED':
      return <XCircle className="w-5 h-5 text-[#CE1126]" />
    case 'NEW_RESERVATION':
      return <UserPlus className="w-5 h-5 text-[#FFD700]" />
    case 'TRIP_COMPLETED':
      return <Flag className="w-5 h-5 text-blue-500" />
    default:
      return <Bell className="w-5 h-5 text-gray-400" />
  }
}

function getNotificationBg(type: string, read: boolean) {
  if (read) return 'bg-white'
  switch (type) {
    case 'TRIP_AVAILABLE':
      return 'bg-[#006233]/5'
    case 'RESERVATION_CONFIRMED':
      return 'bg-[#006233]/5'
    case 'RESERVATION_REFUSED':
      return 'bg-[#CE1126]/5'
    case 'NEW_RESERVATION':
      return 'bg-[#FFD700]/10'
    case 'TRIP_COMPLETED':
      return 'bg-blue-50'
    default:
      return 'bg-gray-50'
  }
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "À l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `Il y a ${days}j`
}

export default function NotificationsPanel() {
  const { user, notifications, setNotifications, setUnreadCount, setSelectedTrip, setView } = useAppStore()
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`)
      const data = await res.json()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [user?.id, setNotifications, setUnreadCount])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
      fetchNotifications()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleMarkAllRead = async () => {
    if (!user?.id) return
    try {
      await fetch(`/api/notifications/read-all?userId=${user.id}`, { method: 'PATCH' })
      toast.success('Toutes les notifications marquées comme lues')
      fetchNotifications()
    } catch {
      toast.error('Erreur')
    }
  }

  const handleClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await handleMarkRead(notif.id)
    }

    const isDriver = user?.role === 'DRIVER'

    try {
      const data = notif.data ? JSON.parse(notif.data) : null
      const isPackageNotif = !!(data?.packageId)
      const hasTripId = !!(data?.tripId)

      // Déterminer la bonne destination selon le type de notification et le rôle
      if (isDriver) {
        // === CHAUFFEUR ===
        if (notif.type === 'NEW_RESERVATION' && !isPackageNotif) {
          // Nouvelle réservation de trajet
          setView('driver-manage')
        } else if (isPackageNotif) {
          // Notification liée à un colis → espace colis du chauffeur
          setView('driver-packages')
        } else if (notif.type === 'TRIP_COMPLETED') {
          setView('driver-trips')
        } else {
          // Toute autre notification avec tripId → réservations
          if (hasTripId) {
            setView('driver-manage')
          }
        }
      } else {
        // === PASSAGER ===
        if (isPackageNotif && hasTripId) {
          // Notification colis → espace colis du passager
          setView('passenger-packages')
        } else if (notif.type === 'RESERVATION_CONFIRMED' || notif.type === 'RESERVATION_REFUSED') {
          setView('passenger-reservations')
        } else if (notif.type === 'TRIP_COMPLETED') {
          setView('passenger-reservations')
        } else if (hasTripId) {
          // Notification avec tripId → détails du trajet
          const res = await fetch(`/api/trips/${data.tripId}`)
          const tripData = await res.json()
          if (tripData.trip) {
            setSelectedTrip(tripData.trip)
            setView('passenger-trip-detail')
          }
        }
      }
    } catch {
      // stay on notifications view
    }
  }

  const hasUnread = notifications.some((n) => !n.read)

  return (
    <div className="flex-1 px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">
            {notifications.length > 0 ? `${notifications.length} notification${notifications.length > 1 ? 's' : ''}` : 'Aucune notification'}
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-[#006233] hover:bg-[#006233]/10 text-xs gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Tout lire
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Aucune notification</p>
            <p className="text-xs text-gray-400 mt-1">Vos alertes apparaîtront ici</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left rounded-2xl transition-all ${getNotificationBg(notif.type, notif.read)} ${!notif.read ? 'ring-1 ring-[#006233]/20' : ''}`}
              >
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-[#006233] rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 line-clamp-2 ${notif.read ? 'text-gray-400' : 'text-gray-600'}`}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

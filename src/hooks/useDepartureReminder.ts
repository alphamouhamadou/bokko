'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/store'
import { toast } from 'sonner'

interface ReminderResponse {
  id: string
  title: string
  message: string
  tripId: string
  reservationId: string
  origin: string
  destination: string
  departureTime: string
}

/**
 * Hook that polls every 60 seconds to check for upcoming departures.
 * Only active for PASSENGER role users.
 * Creates DEPARTURE_REMINDER notifications server-side and shows toasts client-side.
 */
export function useDepartureReminder() {
  const { user, setUnreadCount } = useAppStore()
  const remindedIds = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkReminders = useCallback(async () => {
    if (!user?.id || user.role !== 'PASSENGER') return

    try {
      const res = await fetch('/api/reminders/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerId: user.id }),
      })

      if (!res.ok) return

      const data = await res.json()
      const reminders: ReminderResponse[] = data.reminders || []

      for (const reminder of reminders) {
        // Only show toast if we haven't already notified in this session
        if (!remindedIds.current.has(reminder.id)) {
          remindedIds.current.add(reminder.id)
          toast.warning(reminder.title, {
            description: reminder.message,
            duration: 8000,
          })
        }
      }

      // If there are new reminders, update the unread count
      if (reminders.length > 0) {
        const currentUnread = useAppStore.getState().unreadCount
        setUnreadCount(currentUnread + reminders.length)
      }
    } catch {
      // Silent fail to avoid disrupting UX
    }
  }, [user?.id, user?.role, setUnreadCount])

  useEffect(() => {
    // Only run for passenger users
    if (!user?.id || user.role !== 'PASSENGER') return

    // Check immediately on mount
    checkReminders()

    // Poll every 60 seconds
    intervalRef.current = setInterval(checkReminders, 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [user?.id, user?.role, checkReminders])
}

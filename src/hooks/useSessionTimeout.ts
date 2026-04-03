'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/store'
import { toast } from 'sonner'

const SESSION_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000 // 7 days
const CHECK_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

export function useSessionTimeout() {
  const user = useAppStore((s) => s.user)
  const logout = useAppStore((s) => s.logout)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkSession = useCallback(async () => {
    if (!user?.id) return

    try {
      const res = await fetch('/api/auth/update-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.deleted) {
          toast.error('Ce compte a été supprimé.')
          logout()
          return
        }
        return
      }

      // Check if lastActivity indicates session expiry
      if (data.lastActivity) {
        const lastActivity = new Date(data.lastActivity)
        const now = new Date()
        const diffMs = now.getTime() - lastActivity.getTime()

        // If this is the first activity update (just set now), skip expiry check
        if (diffMs < CHECK_INTERVAL_MS) {
          return
        }

        if (diffMs > SESSION_TIMEOUT_MS) {
          toast.error('Votre session a expiré. Veuillez vous reconnecter.')
          logout()
        }
      }
    } catch {
      // Silent fail - don't disrupt user experience for network issues
    }
  }, [user?.id, logout])

  useEffect(() => {
    if (!user?.id) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Check immediately on mount
    checkSession()

    // Then check every 5 minutes
    intervalRef.current = setInterval(checkSession, CHECK_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [user?.id, checkSession])
}

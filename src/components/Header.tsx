'use client'

import Image from 'next/image'
import { MapPin, Bell } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { useEffect } from 'react'

export default function Header() {
  const { user, unreadCount, setUnreadCount, setView } = useAppStore()

  useEffect(() => {
    if (!user?.id) return

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}`)
        const data = await res.json()
        setUnreadCount(data.unreadCount)
      } catch {
        // silent
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user?.id, setUnreadCount])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#006233] rounded-xl flex items-center justify-center shadow-md overflow-hidden">
            <Image src="/logo.png" alt="BOKKO" width={40} height={40} className="rounded-lg" style={{ width: 'auto', height: '100%' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#006233] leading-tight">BOKKO</h1>
            <p className="text-[10px] text-gray-500 leading-none">Covoiturage au Sénégal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setView('notifications')}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#CE1126] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-[#006233]/5 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-[#CE1126]" />
            <span className="text-xs font-medium text-[#006233]">
              {user?.role === 'DRIVER' ? 'Chauffeur' : 'Passager'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
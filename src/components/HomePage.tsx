'use client'

import Image from 'next/image'
import { useAppStore } from '@/store/store'

export default function HomePage() {
  const setView = useAppStore((s) => s.setView)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006233] via-[#006233] to-[#004d28] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo */}
        <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-lg border border-white/20 overflow-hidden">
          <Image src="/logo.png" alt="BOKKO" width={112} height={112} className="rounded-2xl" loading="eager" />
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">
          BOKKO
        </h1>
        <p className="text-[#FFD700] font-semibold text-lg mb-12">
          Covoiturage au Sénégal
        </p>

        {/* Big Role Cards */}
        <div className="w-full max-w-xs space-y-4">
          {/* Passenger Card */}
          <button
            onClick={() => setView('passenger-login')}
            className="w-full min-h-[120px] rounded-2xl bg-white flex items-center gap-5 p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
          >
            <div className="w-16 h-16 bg-[#006233]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🧑‍💼</span>
            </div>
            <div>
              <p className="text-xl font-bold text-[#006233]">PASSAGER</p>
              <p className="text-sm text-gray-500 mt-0.5">Chercher un trajet</p>
            </div>
          </button>

          {/* Driver Card */}
          <button
            onClick={() => setView('driver-login')}
            className="w-full min-h-[120px] rounded-2xl bg-[#FFD700] flex items-center gap-5 p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left"
          >
            <div className="w-16 h-16 bg-[#FFD700]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🚕</span>
            </div>
            <div>
              <p className="text-xl font-bold text-[#006233]">CHAUFFEUR</p>
              <p className="text-sm text-[#006233]/60 mt-0.5">Publier un trajet</p>
            </div>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white/10 backdrop-blur-sm rounded-t-3xl px-6 py-8">
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <span className="text-2xl">🔒</span>
            <p className="text-white/90 text-xs font-medium mt-2">Sécurité</p>
          </div>
          <div className="text-center">
            <span className="text-2xl">💰</span>
            <p className="text-white/90 text-xs font-medium mt-2">Économique</p>
          </div>
          <div className="text-center">
            <span className="text-2xl">🤝</span>
            <p className="text-white/90 text-xs font-medium mt-2">Communauté</p>
          </div>
        </div>
      </div>

      {/* Admin link discret */}
      <div className="text-center pb-4">
        <button
          onClick={() => setView('admin-login')}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Administration
        </button>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as unknown as { standalone: boolean }).standalone 
      || document.referrer.includes('android-app://')
    setIsStandalone(standalone)

    if (standalone) return

    // Détecter iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(isIOSDevice)

    // Capturer l'événement d'installation (Android)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Afficher après 3 secondes
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Pour iOS, afficher le prompt après 3 secondes
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Ne plus afficher pendant 7 jours
    sessionStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  // Ne pas afficher si déjà en mode standalone ou dismissed
  if (isStandalone || !showPrompt) return null
  if (sessionStorage.getItem('pwa-dismissed')) {
    const dismissed = parseInt(sessionStorage.getItem('pwa-dismissed')!)
    if (Date.now() - dismissed < 7 * 24 * 60 * 60 * 1000) return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative overflow-hidden">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>

          {/* Green accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#006233] via-[#FFD700] to-[#CE1126]" />

          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 bg-[#006233] rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <img 
                src="/icons/icon-96x96.png" 
                alt="BOKKO" 
                className="w-10 h-10 rounded-lg"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-sm">Installer BOKKO</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {isIOS 
                  ? "Appuyez sur Partager puis « Sur l'écran d'accueil »"
                  : 'Accédez à l\'application depuis votre écran d\'accueil'
                }
              </p>
            </div>

            {/* Install button */}
            {!isIOS && deferredPrompt ? (
              <Button
                onClick={handleInstall}
                size="sm"
                className="h-10 px-4 rounded-xl bg-[#006233] hover:bg-[#006233]/90 text-white text-xs font-semibold shrink-0"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Installer
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-[#006233] shrink-0">
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'

export default function BackButton() {
  const { view, viewHistory, goBack } = useAppStore()

  const handleBack = () => {
    const { user } = useAppStore.getState()
    const isDriver = user?.role === 'DRIVER'

    // Si on a un historique, utiliser goBack (dépile sans rempiler)
    if (viewHistory.length > 0) {
      // Éviter de retourner vers les vues de connexion/enregistrement si connecté
      const lastView = viewHistory[viewHistory.length - 1]
      if (user && (lastView === 'passenger-login' || lastView === 'passenger-register' || lastView === 'driver-login' || lastView === 'driver-register')) {
        // Ignorer cet historique et retourner au dashboard
        if (isDriver) {
          goBack('driver-dashboard')
        } else {
          goBack('passenger-dashboard')
        }
      } else {
        goBack()
      }
      return
    }

    // Pas d'historique : utiliser le fallback intelligent basé sur la vue actuelle
    switch (view) {
      case 'passenger-login':
      case 'passenger-register':
        goBack('home')
        break
      case 'passenger-search':
      case 'passenger-reservations':
      case 'notifications':
        if (isDriver) goBack('driver-dashboard')
        else goBack('passenger-dashboard')
        break
      case 'passenger-trip-detail':
      case 'passenger-packages':
      case 'passenger-package-form':
        if (isDriver) goBack('driver-dashboard')
        else goBack('passenger-search')
        break
      case 'trip-share':
        if (isDriver) goBack('driver-dashboard')
        else goBack('passenger-reservations')
        break
      case 'shared-trip-view':
        goBack('home')
        break
      case 'driver-login':
      case 'driver-register':
        goBack('home')
        break
      case 'driver-publish':
      case 'driver-manage':
      case 'driver-trips':
      case 'driver-packages':
        goBack('driver-dashboard')
        break
      case 'driver-profile':
        if (isDriver) goBack('driver-dashboard')
        else goBack('passenger-dashboard')
        break
      case 'driver-profile-edit':
        goBack('driver-profile')
        break
      case 'driver-rating':
        goBack('driver-profile')
        break
      default:
        if (isDriver) goBack('driver-dashboard')
        else if (user?.role === 'PASSENGER') goBack('passenger-dashboard')
        else goBack('home')
    }
  }

  const showBack = view !== 'home' && view !== 'passenger-dashboard' && view !== 'driver-dashboard' && view !== 'shared-trip-view'

  if (!showBack) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="gap-1.5 text-gray-600 hover:text-[#006233] hover:bg-[#006233]/5 -ml-2"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm">Retour</span>
    </Button>
  )
}

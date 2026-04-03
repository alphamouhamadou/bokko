'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/store'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BackButton from '@/components/BackButton'
import HomePage from '@/components/HomePage'
import PassengerLogin from '@/components/PassengerLogin'
import PassengerRegister from '@/components/PassengerRegister'
import PassengerDashboard from '@/components/PassengerDashboard'
import PassengerSearch from '@/components/PassengerSearch'
import PassengerTripDetail from '@/components/PassengerTripDetail'
import PassengerReservations from '@/components/PassengerReservations'
import PassengerPackages from '@/components/PassengerPackages'
import PackageForm from '@/components/PackageForm'
import DriverLogin from '@/components/DriverLogin'
import DriverRegister from '@/components/DriverRegister'
import DriverDashboard from '@/components/DriverDashboard'
import DriverPublish from '@/components/DriverPublish'
import DriverManage from '@/components/DriverManage'
import DriverTrips from '@/components/DriverTrips'
import DriverPackages from '@/components/DriverPackages'
import NotificationsPanel from '@/components/NotificationsPanel'
import DriverProfile from '@/components/DriverProfile'
import ProfileEditor from '@/components/ProfileEditor'
import RatingForm from '@/components/RatingForm'
import TripShare from '@/components/TripShare'
import SharedTripView from '@/components/SharedTripView'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function Page() {
  const view = useAppStore((s) => s.view)

  // Handle shared trip view from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shareCode = urlParams.get('share')
    if (shareCode) {
      const store = useAppStore.getState()
      if (store.view !== 'shared-trip-view') {
        store.setView('shared-trip-view')
      }
    }
  }, [])

  // Fix: corriger la vue si elle ne correspond pas au rôle ou nécessite du state non persisté
  useEffect(() => {
    const store = useAppStore.getState()
    const role = store.user?.role
    const currentView = store.view
    if (!role) return

    // driver-profile et driver-rating sont accessibles aux passagers aussi
    const passengerOnlyViews = ['passenger-dashboard', 'passenger-search', 'passenger-trip-detail', 'passenger-reservations', 'passenger-packages', 'passenger-package-form']
    const driverOnlyViews = ['driver-dashboard', 'driver-publish', 'driver-manage', 'driver-trips', 'driver-packages', 'driver-profile-edit']

    // Vues qui nécessitent du state non persisté (selectedTrip, selectedDriver, etc.)
    const needsNonPersistedState: string[] = [
      'passenger-trip-detail', 'passenger-package-form', 'driver-rating',
      'driver-profile', 'driver-profile-edit', 'trip-share'
    ]

    if (role === 'DRIVER' && passengerOnlyViews.includes(currentView)) {
      store.setView('driver-dashboard')
    } else if (role === 'PASSENGER' && driverOnlyViews.includes(currentView)) {
      store.setView('passenger-dashboard')
    } else if (needsNonPersistedState.includes(currentView)) {
      // Rediriger vers le dashboard approprié car le state nécessaire est perdu au refresh
      if (role === 'DRIVER') {
        store.setView('driver-dashboard')
      } else {
        store.setView('passenger-dashboard')
      }
    }
  }, [])

  const showHeader = view !== 'home' && view !== 'shared-trip-view'
  const showFooter = view !== 'home' && view !== 'shared-trip-view'
  const isSharedView = view === 'shared-trip-view'

  if (isSharedView) {
    return (
      <>
        <SharedTripView />
        <ServiceWorkerRegistration />
      </>
    )
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col bg-gray-50 relative">
      <ServiceWorkerRegistration />
      {showHeader && <Header />}
      
      <div className="flex-1 flex flex-col">
        {showHeader && (
          <div className="px-4 pt-2 pb-0">
            <BackButton />
          </div>
        )}

        {view === 'home' && <HomePage />}
        {view === 'passenger-login' && <PassengerLogin />}
        {view === 'passenger-register' && <PassengerRegister />}
        {view === 'passenger-dashboard' && <PassengerDashboard />}
        {view === 'passenger-search' && <PassengerSearch />}
        {view === 'passenger-trip-detail' && <PassengerTripDetail />}
        {view === 'passenger-reservations' && <PassengerReservations />}
        {view === 'passenger-packages' && <PassengerPackages />}
        {view === 'passenger-package-form' && <PackageForm />}
        {view === 'driver-login' && <DriverLogin />}
        {view === 'driver-register' && <DriverRegister />}
        {view === 'driver-dashboard' && <DriverDashboard />}
        {view === 'driver-publish' && <DriverPublish />}
        {view === 'driver-manage' && <DriverManage />}
        {view === 'driver-trips' && <DriverTrips />}
        {view === 'driver-packages' && <DriverPackages />}
        {view === 'notifications' && <NotificationsPanel />}
        {view === 'driver-profile' && <DriverProfile />}
        {view === 'driver-profile-edit' && <ProfileEditor />}
        {view === 'driver-rating' && <RatingForm />}
        {view === 'trip-share' && <TripShare />}
      </div>

      {showFooter && <Footer />}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  )
}

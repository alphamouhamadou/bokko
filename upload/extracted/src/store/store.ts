import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type View =
  | 'home'
  | 'passenger-login' | 'passenger-register' | 'passenger-dashboard'
  | 'passenger-search' | 'passenger-trip-detail' | 'passenger-reservations'
  | 'passenger-packages' | 'passenger-package-form'
  | 'driver-login' | 'driver-register' | 'driver-dashboard'
  | 'driver-publish' | 'driver-manage' | 'driver-trips' | 'driver-packages'
  | 'notifications' | 'driver-profile' | 'driver-profile-edit'
  | 'driver-rating' | 'trip-share' | 'shared-trip-view'

export interface TripData {
  id: string
  driverId: string
  origin: string
  destination: string
  departureTime: string
  pricePerSeat: number
  availableSeats: number
  tripType: string
  status: string
  description?: string
  createdAt: string
  updatedAt: string
  driver?: {
    id: string
    name: string
    phone: string
    role: string
    waveBusinessLink?: string | null
  }
  vehicle?: {
    id: string
    brand: string
    model: string
    color: string
    plateNumber: string
    capacity: number
  } | null
  acceptsPackages?: boolean
  packagePricePerKg?: number
  totalBooked?: number
  remainingSeats?: number
}

interface UserData {
  id: string
  phone: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
  licenseNumber?: string
  licenseExpiry?: string
  photoUrl?: string
  bio?: string
  experience?: number
  totalTrips?: number
  averageRating?: number
  totalRatings?: number
  waveBusinessLink?: string | null
}

interface VehicleData {
  id: string
  brand: string
  model: string
  color: string
  plateNumber: string
  capacity: number
}

interface SearchFilters {
  origin: string
  destination: string
  date: string
}

interface NotificationData {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  data: string | null
  createdAt: string
}

interface AppState {
  view: View
  user: UserData | null
  vehicle: VehicleData | null
  selectedTrip: TripData | null
  searchFilters: SearchFilters
  notifications: NotificationData[]
  unreadCount: number
  viewHistory: View[]
  selectedDriver: any | null
  shareCode: string | null
  ratingTripId: string | null

  setView: (view: View, skipHistory?: boolean) => void
  goBack: (fallback?: View) => void
  setUser: (user: UserData | null, vehicle?: VehicleData | null) => void
  setSelectedTrip: (trip: any | null) => void
  setSearchFilters: (filters: SearchFilters) => void
  setNotifications: (notifications: NotificationData[]) => void
  setUnreadCount: (count: number) => void
  setSelectedDriver: (driver: any) => void
  setShareCode: (code: string | null) => void
  setRatingTripId: (tripId: string | null) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      view: 'home',
      user: null,
      vehicle: null,
      selectedTrip: null,
      searchFilters: { origin: '', destination: '', date: '' },
      notifications: [],
      unreadCount: 0,
      viewHistory: [],
      selectedDriver: null,
      shareCode: null,
      ratingTripId: null,

      setView: (view, skipHistory = false) => set((state) => {
        const role = state.user?.role
        const passengerOnlyViews: View[] = [
          'passenger-dashboard', 'passenger-search', 'passenger-trip-detail',
          'passenger-reservations', 'passenger-packages', 'passenger-package-form'
        ]
        // Vues uniquement chauffeur (exclure driver-profile et driver-rating que les passagers doivent pouvoir voir)
        const driverOnlyViews: View[] = [
          'driver-dashboard', 'driver-publish', 'driver-manage', 'driver-trips',
          'driver-packages', 'driver-profile-edit'
        ]
        // Empêcher un chauffeur d'aller dans les vues passager
        if (role === 'DRIVER' && passengerOnlyViews.includes(view)) {
          return { view: 'driver-dashboard' }
        }
        // Empêcher un passager d'aller dans les vues chauffeur uniquement
        if (role === 'PASSENGER' && driverOnlyViews.includes(view)) {
          return { view: 'passenger-dashboard' }
        }
        // Sauvegarder dans l'historique sauf si skipHistory (utilisé par goBack)
        const newHistory = skipHistory
          ? state.viewHistory
          : [...state.viewHistory, state.view]
        // Limiter l'historique à 20 entrées max
        const trimmedHistory = newHistory.length > 20 ? newHistory.slice(-20) : newHistory
        return { view, viewHistory: trimmedHistory }
      }),

      goBack: (fallback) => set((state) => {
        if (state.viewHistory.length > 0) {
          const newHistory = [...state.viewHistory]
          const previousView = newHistory.pop()!
          return { view: previousView, viewHistory: newHistory }
        }
        // Fallback si pas d'historique
        if (fallback) {
          return { view: fallback }
        }
        const role = state.user?.role
        if (role === 'DRIVER') return { view: 'driver-dashboard' }
        if (role === 'PASSENGER') return { view: 'passenger-dashboard' }
        return { view: 'home' }
      }),

      setUser: (user, vehicle = null) => set({ user, vehicle }),

      setSelectedTrip: (trip) => set({ selectedTrip: trip }),

      setSearchFilters: (filters) => set({ searchFilters: filters }),

      setNotifications: (notifications) => set({ notifications }),

      setUnreadCount: (count) => set({ unreadCount: count }),

      setSelectedDriver: (driver) => set({ selectedDriver: driver }),

      setShareCode: (code) => set({ shareCode: code }),

      setRatingTripId: (tripId) => set({ ratingTripId: tripId }),

      logout: () =>
        set({
          view: 'home',
          user: null,
          vehicle: null,
          selectedTrip: null,
          searchFilters: { origin: '', destination: '', date: '' },
          notifications: [],
          unreadCount: 0,
          viewHistory: [],
          selectedDriver: null,
          shareCode: null,
          ratingTripId: null,
        }),
    }),
    {
      name: 'bokko-storage',
      partialize: (state) => ({
        user: state.user,
        vehicle: state.vehicle,
        view: state.view,
      }),
    }
  )
)

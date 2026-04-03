'use client'

import { useState, useEffect } from 'react'
import { Star, Car, X } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface FavoriteDriver {
  id: string
  driverId: string
  addedAt: string
  driver: {
    id: string
    name: string
    phone: string
    averageRating: number
    totalRatings: number
    totalTrips: number
    vehicle: {
      brand: string
      model: string
      color: string
      plateNumber: string
      capacity: number
    } | null
  }
}

export default function FavoriteDrivers() {
  const { user, setView, setSelectedDriver } = useAppStore()
  const [favorites, setFavorites] = useState<FavoriteDriver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/favorites?userId=${user.id}`)
      const data = await res.json()
      setFavorites(data.favorites || [])
    } catch {
      toast.error('Erreur lors du chargement des favoris')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (driverId: string, driverName: string) => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/favorites?userId=${user.id}&driverId=${driverId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la suppression')
        return
      }
      setFavorites((prev) => prev.filter((f) => f.driverId !== driverId))
      toast.success(`${driverName} retiré de vos favoris`)
    } catch {
      toast.error('Erreur de connexion')
    }
  }

  const handleViewProfile = (fav: FavoriteDriver) => {
    setSelectedDriver({
      id: fav.driver.id,
      name: fav.driver.name,
      phone: fav.driver.phone,
    })
    setView('driver-profile')
  }

  const getColorDot = (color: string) => {
    const map: Record<string, string> = {
      'Blanc': 'bg-white border-2 border-gray-300',
      'Noir': 'bg-gray-800',
      'Gris': 'bg-gray-400',
      'Rouge': 'bg-red-500',
      'Bleu': 'bg-blue-500',
      'Vert': 'bg-green-500',
      'Argent': 'bg-gray-300',
      'Marron': 'bg-amber-700',
    }
    return map[color] || 'bg-gray-400'
  }

  return (
    <div className="flex-1 px-4 py-4 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">❤️ Chauffeurs favoris</h2>
        <p className="text-sm text-gray-500 mt-0.5">Vos chauffeurs préférés</p>
      </div>

      {/* Favorites List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <span className="text-5xl">❤️</span>
            <p className="text-sm text-gray-500 font-medium mt-4">Vous n&apos;avez pas encore de chauffeurs favoris</p>
            <p className="text-xs text-gray-400 mt-1">
              Cliquez sur ❤️ dans le profil d&apos;un chauffeur pour l&apos;ajouter
            </p>
            <Button
              onClick={() => setView('passenger-search')}
              className="mt-4 bg-[#006233] hover:bg-[#006233]/90 text-white rounded-xl text-sm"
            >
              Rechercher un trajet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {favorites.map((fav) => (
            <Card key={fav.id} className="border-0 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <button
                    onClick={() => handleViewProfile(fav)}
                    className="flex-shrink-0"
                  >
                    <div className="w-14 h-14 bg-[#006233]/10 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">👨‍✈️</span>
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleViewProfile(fav)}
                      className="w-full text-left"
                    >
                      <p className="text-base font-bold text-gray-900 truncate">{fav.driver.name}</p>
                    </button>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-1">
                      {fav.driver.averageRating > 0 ? (
                        <>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= Math.round(fav.driver.averageRating)
                                    ? 'text-[#FFD700] fill-[#FFD700]'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {fav.driver.averageRating.toFixed(1)} ({fav.driver.totalRatings})
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Pas encore de notes</span>
                      )}
                    </div>

                    {/* Vehicle info */}
                    {fav.driver.vehicle && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3 h-3 rounded-full ${getColorDot(fav.driver.vehicle.color)}`} />
                          <span className="text-xs text-gray-600">
                            {fav.driver.vehicle.brand} {fav.driver.vehicle.model}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{fav.driver.totalTrips} trajets</span>
                      </div>
                    )}

                    {/* Added date */}
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Ajouté le {new Date(fav.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(fav.driverId, fav.driver.name)}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors active:scale-90"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'

interface GeoLocation {
  latitude: number
  longitude: number
}

interface UseGeolocationReturn {
  location: GeoLocation | null
  error: string | null
  loading: boolean
  refresh: () => void
}

export function useGeolocation(autoStart = false): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getPosition = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par votre navigateur')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case 1:
            setError('Permission de localisation refusée')
            break
          case 2:
            setError('Position indisponible')
            break
          case 3:
            setError('Délai de localisation dépassé')
            break
          default:
            setError('Erreur de localisation')
        }
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  useEffect(() => {
    if (autoStart) {
      getPosition()
    }
  }, [autoStart])

  return { location, error, loading, refresh: getPosition }
}

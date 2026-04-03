'use client'

import { useState, useEffect, useCallback } from 'react'
import { detectBokkoCity } from '@/utils/geolocation'

const SESSION_CACHE_KEY = 'bokko_geolocation_city'

interface NearestCity {
  city: string
  subLocation?: string
}

interface UseGeolocationReturn {
  isLoading: boolean
  nearestCity: NearestCity | null
  error: string | null
  refetch: () => void
}

/**
 * Custom hook for automatic passenger geolocation detection.
 * 
 * - On mount, requests GPS permission and detects nearest BOKKO city
 * - Caches the result in sessionStorage to avoid re-geocoding
 * - Handles all errors gracefully (permission denied, unavailable, timeout)
 * - If geolocation fails, silently returns null (no blocking error)
 */
export function useGeolocation(): UseGeolocationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [nearestCity, setNearestCity] = useState<NearestCity | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetchKey, setFetchKey] = useState(0)

  const detect = useCallback(async () => {
    // Check sessionStorage cache first
    try {
      const cached = sessionStorage.getItem(SESSION_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        // Cache is valid for 30 minutes
        if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setNearestCity({ city: parsed.city, subLocation: parsed.subLocation })
          return
        }
      }
    } catch {
      // Ignore cache read errors
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await detectBokkoCity()

      if (result) {
        setNearestCity(result)
        // Cache in sessionStorage
        try {
          sessionStorage.setItem(
            SESSION_CACHE_KEY,
            JSON.stringify({
              city: result.city,
              subLocation: result.subLocation,
              timestamp: Date.now(),
            })
          )
        } catch {
          // Ignore cache write errors (e.g., storage full)
        }
      } else {
        // Could not determine city — silent, no error shown to user
        setNearestCity(null)
      }
    } catch {
      // Geolocation failed silently
      setNearestCity(null)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    detect()
  }, [detect, fetchKey])

  const refetch = useCallback(() => {
    // Clear cache and re-fetch
    try {
      sessionStorage.removeItem(SESSION_CACHE_KEY)
    } catch {
      // Ignore
    }
    setFetchKey((k) => k + 1)
  }, [])

  return { isLoading, nearestCity, error, refetch }
}

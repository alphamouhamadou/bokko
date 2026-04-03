/**
 * BOKKO Geolocation Utilities
 * GPS detection, reverse geocoding via Nominatim, and city matching
 */

// Fallback coordinates for each BOKKO city (center points)
export const BOKKO_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Dakar: { lat: 14.6937, lng: -17.4441 },
  'Thiès': { lat: 14.7936, lng: -16.9265 },
  'Thiènaba': { lat: 14.5533, lng: -16.9039 },
}

// Sub-locations for each BOKKO city
const SUB_LOCATIONS: Record<string, string[]> = {
  Dakar: ['Plateau', 'Liberté', 'Médina', 'Almadies', 'Ouakam', 'Parcelles'],
  'Thiès': ['Kaur', 'Sindia', 'Centre', 'Ndioloff'],
  'Thiènaba': ['Village', 'Marché'],
}

/**
 * Get current GPS position from the browser
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator || !navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Permission refusée'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Position indisponible'))
            break
          case error.TIMEOUT:
            reject(new Error('Délai expiré'))
            break
          default:
            reject(new Error('Erreur de géolocalisation'))
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache position for 5 minutes
      }
    )
  })
}

/**
 * Reverse geocode using Nominatim (OpenStreetMap) — no API key needed
 * Returns the nearest city and optional sub-location
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ city: string; subLocation?: string }> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr&zoom=14`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'BOKKO-Carpooling/1.0',
    },
  })

  if (!response.ok) {
    throw new Error('Erreur de géocodage inversé')
  }

  const data = await response.json()
  const address = data.address || {}

  // Try to extract city-level info from various OSM address fields
  // Priority: city/town/village > county > state
  const rawCity =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    ''

  // Also get suburb/district for sub-location matching
  const rawSuburb =
    address.suburb ||
    address.district ||
    address.neighbourhood ||
    address.quarter ||
    ''

  return {
    city: rawCity,
    subLocation: rawSuburb || undefined,
  }
}

/**
 * Match a geocoded city name to a BOKKO city
 * Returns the matched city with optional sub-location, or null if no match
 */
export function matchBokkoCity(geocodedCity: string, geocodedSubLocation?: string): {
  city: string
  subLocation?: string
} | null {
  const normalized = geocodedCity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const normalizedSub = geocodedSubLocation
    ? geocodedSubLocation.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : ''

  // Match Thiènaba
  if (normalized.includes('thienaba')) {
    const subLocations = SUB_LOCATIONS['Thiènaba']
    const matchedSub = subLocations.find(
      (sub) => normalizedSub.includes(sub.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )
    return { city: 'Thiènaba', subLocation: matchedSub || undefined }
  }

  // Match Thiès
  if (normalized.includes('thies')) {
    const subLocations = SUB_LOCATIONS['Thiès']
    const matchedSub = subLocations.find(
      (sub) => normalizedSub.includes(sub.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )
    return { city: 'Thiès', subLocation: matchedSub || undefined }
  }

  // Match Dakar
  if (normalized.includes('dakar')) {
    const subLocations = SUB_LOCATIONS['Dakar']
    const matchedSub = subLocations.find(
      (sub) => normalizedSub.includes(sub.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )
    return { city: 'Dakar', subLocation: matchedSub || undefined }
  }

  return null
}

/**
 * Haversine formula to calculate distance between two coordinates in km
 */
export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Find the nearest BOKKO city from given coordinates using fallback city coords
 * Used as a fallback when Nominatim matching fails
 */
export function findNearestCityByDistance(
  lat: number,
  lng: number
): { city: string; distance: number } {
  let nearestCity = 'Dakar'
  let nearestDistance = Infinity

  for (const [city, coords] of Object.entries(BOKKO_CITY_COORDS)) {
    const dist = getDistanceFromLatLonInKm(lat, lng, coords.lat, coords.lng)
    if (dist < nearestDistance) {
      nearestDistance = dist
      nearestCity = city
    }
  }

  return { city: nearestCity, distance: nearestDistance }
}

/**
 * Full geolocation detection pipeline:
 * 1. Get GPS position
 * 2. Reverse geocode
 * 3. Match to BOKKO city
 * 4. Fallback to nearest city by distance if Nominatim doesn't match
 */
export async function detectBokkoCity(): Promise<{
  city: string
  subLocation?: string
} | null> {
  try {
    const pos = await getCurrentPosition()
    const geocoded = await reverseGeocode(pos.lat, pos.lng)

    // Try to match geocoded result to a BOKKO city
    const matched = matchBokkoCity(geocoded.city, geocoded.subLocation)
    if (matched) {
      return matched
    }

    // Fallback: use distance to city centers (within 50km radius)
    const nearest = findNearestCityByDistance(pos.lat, pos.lng)
    if (nearest.distance <= 50) {
      return { city: nearest.city }
    }

    // Too far from any BOKKO city
    return null
  } catch {
    return null
  }
}

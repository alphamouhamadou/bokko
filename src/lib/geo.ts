// Coordonnées GPS des villes desservies par BOKKO
const LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Thiènaba': { lat: 14.6833, lng: -16.8833 },
  'Thiès':    { lat: 14.7917, lng: -16.9267 },
  'Dakar':    { lat: 14.7167, lng: -17.4677 },
}

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * Retourne la distance en kilomètres
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Retourne la ville la plus proche parmi les localisations BOKKO
 * @param userLat Latitude de l'utilisateur
 * @param userLng Longitude de l'utilisateur
 * @param maxDistanceKm Distance max en km (défaut 30)
 * @returns Le nom de la ville la plus proche ou null
 */
export function getNearestLocation(
  userLat: number,
  userLng: number,
  maxDistanceKm = 30
): string | null {
  let nearest: string | null = null
  let minDist = Infinity

  for (const [name, coords] of Object.entries(LOCATIONS)) {
    const dist = getDistanceKm(userLat, userLng, coords.lat, coords.lng)
    if (dist < minDist) {
      minDist = dist
      nearest = name
    }
  }

  // Ne retourne que si dans le rayon max
  if (minDist <= maxDistanceKm) {
    return nearest
  }
  return null
}

/**
 * Retourne la distance en km entre l'utilisateur et une ville
 */
export function getDistanceToLocation(
  userLat: number,
  userLng: number,
  locationName: string
): number | null {
  const coords = LOCATIONS[locationName]
  if (!coords) return null
  return Math.round(getDistanceKm(userLat, userLng, coords.lat, coords.lng) * 10) / 10
}

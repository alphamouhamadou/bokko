/**
 * Service de géocodage via Nominatim (OpenStreetMap) — gratuit, sans clé API
 * Convertit coordonnées GPS ↔ adresse et recherche des adresses au Sénégal
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  address: {
    road?: string
    quarter?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}

/**
 * Reverse geocoding : coordonnées → adresse lisible
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      'accept-language': 'fr',
      zoom: '18',
    })
    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { 'User-Agent': 'BOKKO-Carpooling/1.0' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.error) return null
    return formatAddress(data)
  } catch {
    return null
  }
}

/**
 * Forward geocoding : texte → coordonnées + résultats
 */
export async function searchAddress(query: string): Promise<Array<{
  display_name: string
  lat: number
  lon: number
  type: string
}>> {
  if (!query || query.length < 3) return []
  try {
    const params = new URLSearchParams({
      q: `${query}, Sénégal`,
      format: 'json',
      'accept-language': 'fr',
      limit: '5',
      countrycodes: 'sn',
      addressdetails: '1',
    })
    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { 'User-Agent': 'BOKKO-Carpooling/1.0' },
    })
    if (!res.ok) return []
    const data: NominatimResult[] = await res.json()
    return data.map((item) => ({
      display_name: formatAddress(item),
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
    }))
  } catch {
    return []
  }
}

/**
 * Formate l'adresse Nominatim en texte court
 */
function formatAddress(data: NominatimResult): string {
  const addr = data.address || {}
  const parts: string[] = []

  if (addr.road) {
    parts.push(addr.road)
    if (addr.quarter) parts.push(addr.quarter)
  }
  const city = addr.city || addr.town || addr.village || ''
  if (city && !parts.includes(city)) {
    parts.push(city)
  }

  // Fallback : utiliser display_name tronqué
  if (parts.length === 0) {
    return data.display_name.split(',').slice(0, 3).join(',').trim()
  }

  return parts.join(', ')
}

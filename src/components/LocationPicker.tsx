'use client'

import { useState, useRef, useEffect } from 'react'
import { Navigation, Search, MapPin, Loader2, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useGeolocation } from '@/hooks/use-geolocation'
import { reverseGeocode, searchAddress } from '@/lib/geocoding'

interface LocationPickerProps {
  label: string
  placeholder?: string
  onSelect: (data: { address: string; lat: number; lon: number }) => void
  currentAddress?: string
}

export default function LocationPicker({ label, placeholder, onSelect, currentAddress }: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ display_name: string; lat: number; lon: number }>>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState(currentAddress || '')
  const { location, loading: geoLoading, refresh: geoRefresh } = useGeolocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Reverse geocode quand GPS réussit
  useEffect(() => {
    if (location && !selected) {
      reverseGeocode(location.latitude, location.longitude).then((addr) => {
        if (addr) {
          setSelected(addr)
          onSelect({ address: addr, lat: location.latitude, lon: location.longitude })
          toast.success('Position détectée')
        }
      })
    }
  }, [location])

  // Recherche avec debounce
  const handleInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await searchAddress(value)
      setResults(res)
      setSearching(false)
    }, 400)
  }

  const handleGPS = () => {
    geoRefresh()
  }

  const handleSelectResult = (result: typeof results[0]) => {
    setSelected(result.display_name)
    setQuery('')
    setResults([])
    onSelect({ address: result.display_name, lat: result.lat, lon: result.lon })
  }

  const handleClear = () => {
    setSelected('')
    setQuery('')
    setResults([])
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>

      {/* Bouton GPS */}
      <button
        onClick={handleGPS}
        disabled={geoLoading}
        className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all bg-white border border-dashed border-[#006233]/30 text-[#006233] hover:border-[#006233] hover:bg-[#006233]/5 active:scale-[0.98] flex items-center justify-center gap-2 mb-2"
      >
        {geoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
        {geoLoading ? 'Localisation GPS...' : '📍 Utiliser ma position'}
      </button>

      {/* Adresse sélectionnée */}
      {selected ? (
        <div className="flex items-center gap-2 p-3 bg-[#006233]/5 rounded-xl border border-[#006233]/20">
          <MapPin className="w-4 h-4 text-[#006233] flex-shrink-0" />
          <span className="text-sm text-gray-700 flex-1 truncate">{selected}</span>
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Champ de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder || 'Rechercher une adresse...'}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#006233] transition-colors"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Résultats de recherche */}
          {searching && (
            <div className="flex items-center gap-2 py-2 px-1 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Recherche...
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-h-40 overflow-y-auto mt-1">
              {results.map((result, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectResult(result)}
                  className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-[#006233] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-gray-700 leading-relaxed">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {!searching && query.length >= 3 && results.length === 0 && (
            <p className="text-xs text-gray-400 py-1 px-1">Aucun résultat trouvé</p>
          )}
        </>
      )}
    </div>
  )
}

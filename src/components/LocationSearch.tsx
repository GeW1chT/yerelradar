'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Crosshair, Loader2 } from 'lucide-react'
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/google-maps-loader'

interface LocationSearchProps {
  onLocationSelect?: (location: {
    address: string
    lat: number
    lng: number
    city?: string
    district?: string
  }) => void
  placeholder?: string
  defaultValue?: string
  className?: string
}

export default function LocationSearch({
  onLocationSelect,
  placeholder = "Konum ara...",
  defaultValue = "",
  className = ""
}: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<string>('')

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        // Load Google Maps if not already loaded
        if (!isGoogleMapsLoaded()) {
          await loadGoogleMaps()
        }

        if (inputRef.current && window.google?.maps?.places) {
          const autocompleteInstance = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['establishment', 'geocode'],
              componentRestrictions: { country: 'tr' }, // Restrict to Turkey
              fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
            }
          )

          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace()
            handlePlaceSelect(place)
          })

          setAutocomplete(autocompleteInstance)
        }
      } catch (error) {
        console.error('Error initializing autocomplete:', error)
      }
    }

    initAutocomplete()
  }, [])



  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) return

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    
    // Extract city and district from address components
    let city = ''
    let district = ''
    
    if (place.address_components) {
      for (const component of place.address_components) {
        if (component.types.includes('administrative_area_level_1')) {
          city = component.long_name
        }
        if (component.types.includes('administrative_area_level_2') || 
            component.types.includes('sublocality_level_1')) {
          district = component.long_name
        }
      }
    }

    const locationData = {
      address: place.formatted_address || place.name || '',
      lat,
      lng,
      city,
      district
    }

    setCurrentLocation(locationData.address)

    if (onLocationSelect) {
      onLocationSelect(locationData)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum özelliğini desteklemiyor')
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          // Reverse geocoding to get address
          const geocoder = new google.maps.Geocoder()
          const response = await geocoder.geocode({
            location: { lat, lng }
          })

          if (response.results[0]) {
            const place = response.results[0]
            const address = place.formatted_address

            // Extract city and district
            let city = ''
            let district = ''
            
            for (const component of place.address_components) {
              if (component.types.includes('administrative_area_level_1')) {
                city = component.long_name
              }
              if (component.types.includes('administrative_area_level_2') || 
                  component.types.includes('sublocality_level_1')) {
                district = component.long_name
              }
            }

            const locationData = {
              address,
              lat,
              lng,
              city,
              district
            }

            setCurrentLocation(address)
            if (inputRef.current) {
              inputRef.current.value = address
            }

            if (onLocationSelect) {
              onLocationSelect(locationData)
            }
          }
        } catch (error) {
          console.error('Error getting address:', error)
          alert('Adres alınırken hata oluştu')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        setLoading(false)
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Konum izni reddedildi')
            break
          case error.POSITION_UNAVAILABLE:
            alert('Konum bilgisi mevcut değil')
            break
          case error.TIMEOUT:
            alert('Konum alma işlemi zaman aşımına uğradı')
            break
          default:
            alert('Konum alınırken hata oluştu')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Mevcut konumumu kullan"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Crosshair className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Location suggestions dropdown would appear here automatically via Google Places */}
    </div>
  )
}
'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

interface Business {
  id: string
  name: string
  lat: number
  lng: number
  category: string
  avgRating: number
  address: string
  verified: boolean
  isPremium: boolean
}

interface GoogleMapProps {
  businesses: Business[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  showUserLocation?: boolean
  onMarkerClick?: (business: Business) => void
  selectedBusinessId?: string
}

export default function GoogleMap({
  businesses = [],
  center = { lat: 41.0082, lng: 28.9784 }, // Istanbul center
  zoom = 12,
  height = '400px',
  showUserLocation = true,
  onMarkerClick,
  selectedBusinessId
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if Google Maps is already loaded
        if (typeof window !== 'undefined' && window.google) {
          createMap()
        } else {
          // Load Google Maps dynamically
          await loadGoogleMaps()
          createMap()
        }
      } catch (err) {
        console.error('Error loading Google Maps:', err)
        setError('Harita yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    if (mapRef.current) {
      initMap()
    }
  }, [])

  // Update markers when businesses change
  useEffect(() => {
    if (map && businesses.length > 0) {
      updateMarkers()
    }
  }, [map, businesses, selectedBusinessId])

  // Get user location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // Center map on user location if no businesses
          if (map && businesses.length === 0) {
            map.setCenter(location)
          }
        },
        (error) => {
          console.warn('Error getting user location:', error)
        }
      )
    }
  }, [map, showUserLocation, businesses.length])

  const loadGoogleMaps = async () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve(window.google)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.google)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const createMap = () => {
    if (!mapRef.current || !window.google) return

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    })

    setMap(mapInstance)
  }

  const updateMarkers = () => {
    if (!map) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    // Add business markers
    businesses.forEach((business) => {
      const marker = new google.maps.Marker({
        position: { lat: business.lat, lng: business.lng },
        map,
        title: business.name,
        icon: {
          url: getMarkerIcon(business),
          scaledSize: new google.maps.Size(32, 32)
        }
      })

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(business)
      })

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => {
          const existingInfoWindow = (m as any).infoWindow
          if (existingInfoWindow) {
            existingInfoWindow.close()
          }
        })

        infoWindow.open(map, marker)
        
        if (onMarkerClick) {
          onMarkerClick(business)
        }
      })

      // Store info window reference
      ;(marker as any).infoWindow = infoWindow

      // Highlight selected business
      if (selectedBusinessId === business.id) {
        marker.setAnimation(google.maps.Animation.BOUNCE)
        setTimeout(() => marker.setAnimation(null), 2000)
        infoWindow.open(map, marker)
      }

      newMarkers.push(marker)
    })

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: 'Konumunuz',
        icon: {
          url: '/icons/user-location.png',
          scaledSize: new google.maps.Size(24, 24)
        }
      })
      newMarkers.push(userMarker)
    }

    setMarkers(newMarkers)

    // Fit map to show all markers
    if (businesses.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      businesses.forEach(business => {
        bounds.extend({ lat: business.lat, lng: business.lng })
      })
      if (userLocation) {
        bounds.extend(userLocation)
      }
      map.fitBounds(bounds)
    }
  }

  const getMarkerIcon = (business: Business) => {
    if (business.isPremium) {
      return '/icons/premium-marker.png'
    }
    if (business.verified) {
      return '/icons/verified-marker.png'
    }
    return '/icons/default-marker.png'
  }

  const createInfoWindowContent = (business: Business) => {
    return `
      <div class="p-3 max-w-xs">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-gray-900">${business.name}</h3>
          ${business.verified ? '<span class="text-blue-500">✓</span>' : ''}
        </div>
        <p class="text-sm text-gray-600 mb-2">${business.category}</p>
        <p class="text-xs text-gray-500 mb-2">${business.address}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-yellow-500">★</span>
            <span class="text-sm ml-1">${business.avgRating.toFixed(1)}</span>
          </div>
          <button 
            onclick="window.location.href='/istanbul/${business.id}'"
            class="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
          >
            Detaylar
          </button>
        </div>
      </div>
    `
  }

  const handleGetDirections = () => {
    if (userLocation && businesses.length > 0) {
      const firstBusiness = businesses[0]
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${firstBusiness.lat},${firstBusiness.lng}`
      window.open(url, '_blank')
    }
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg border border-gray-200"
      />
      
      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2">
        {userLocation && (
          <button
            onClick={handleGetDirections}
            className="bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Yol tarifi al"
          >
            <Navigation className="w-5 h-5 text-blue-600" />
          </button>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Standart İşletme</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Premium İşletme</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Doğrulanmış</span>
          </div>
        </div>
      </div>
    </div>
  )
}
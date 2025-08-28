'use client'

import { useState, useEffect } from 'react'
import { Filter, List, Map, Search, MapPin, Star, Navigation, Sliders } from 'lucide-react'
import GoogleMap from '@/components/GoogleMap'
import LocationSearch from '@/components/LocationSearch'
import { Header } from '@/components/Header'

interface Business {
  id: string
  name: string
  lat: number
  lng: number
  category: string
  subcategory: string
  avgRating: number
  totalReviews: number
  address: string
  verified: boolean
  isPremium: boolean
  priceRange: string
  distance?: number
}

interface MapBusiness {
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

const MOCK_BUSINESSES: Business[] = [
  {
    id: '1',
    name: 'Köşe Pizza',
    lat: 41.0431,
    lng: 29.0099,
    category: 'Restoran',
    subcategory: 'Pizza',
    avgRating: 4.2,
    totalReviews: 128,
    address: 'Barbaros Bulvarı No:45, Beşiktaş',
    verified: true,
    isPremium: false,
    priceRange: 'MODERATE'
  },
  {
    id: '2',
    name: 'Starbucks Zorlu Center',
    lat: 41.0420,
    lng: 29.0110,
    category: 'Kafe',
    subcategory: 'Kahve',
    avgRating: 4.0,
    totalReviews: 89,
    address: 'Zorlu Center AVM, Beşiktaş',
    verified: true,
    isPremium: true,
    priceRange: 'EXPENSIVE'
  },
  {
    id: '3',
    name: 'Berber Ali',
    lat: 41.0450,
    lng: 29.0080,
    category: 'Berber',
    subcategory: 'Erkek Berber',
    avgRating: 4.7,
    totalReviews: 67,
    address: 'Beşiktaş Çarşı, Beşiktaş',
    verified: true,
    isPremium: false,
    priceRange: 'BUDGET'
  },
  {
    id: '4',
    name: 'Sushico Nişantaşı',
    lat: 41.0500,
    lng: 28.9950,
    category: 'Restoran',
    subcategory: 'Japon',
    avgRating: 4.5,
    totalReviews: 201,
    address: 'Teşvikiye Cad., Şişli',
    verified: true,
    isPremium: true,
    priceRange: 'EXPENSIVE'
  },
  {
    id: '5',
    name: 'Kahve Dünyası Taksim',
    lat: 41.0370,
    lng: 28.9857,
    category: 'Kafe',
    subcategory: 'Kahve',
    avgRating: 4.1,
    totalReviews: 156,
    address: 'İstiklal Caddesi, Beyoğlu',
    verified: false,
    isPremium: false,
    priceRange: 'MODERATE'
  }
]

const CATEGORIES = [
  'Tümü',
  'Restoran',
  'Kafe',
  'Berber',
  'Market',
  'Eczane',
  'Spor Salonu'
]

const PRICE_RANGES = [
  { label: 'Tümü', value: '' },
  { label: 'Ekonomik (₺)', value: 'BUDGET' },
  { label: 'Orta (₺₺)', value: 'MODERATE' },
  { label: 'Pahalı (₺₺₺)', value: 'EXPENSIVE' },
  { label: 'Lüks (₺₺₺₺)', value: 'LUXURY' }
]

export default function MapPage() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES)
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>(MOCK_BUSINESSES)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [maxDistance, setMaxDistance] = useState(10) // km
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)

  // Apply filters
  useEffect(() => {
    let filtered = [...businesses]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(business => business.category === selectedCategory)
    }

    // Price range filter
    if (selectedPriceRange) {
      filtered = filtered.filter(business => business.priceRange === selectedPriceRange)
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(business => business.avgRating >= minRating)
    }

    // Verified only filter
    if (showVerifiedOnly) {
      filtered = filtered.filter(business => business.verified)
    }

    // Distance filter (if user location is available)
    if (userLocation && maxDistance < 50) {
      filtered = filtered.filter(business => {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.lat,
          business.lng
        )
        return distance <= maxDistance
      })
    }

    // Calculate distances for all businesses
    if (userLocation) {
      filtered = filtered.map(business => ({
        ...business,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.lat,
          business.lng
        )
      }))
    }

    setFilteredBusinesses(filtered)
  }, [businesses, searchQuery, selectedCategory, selectedPriceRange, minRating, maxDistance, showVerifiedOnly, userLocation])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1)
    const dLng = deg2rad(lng2 - lng1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180)
  }

  const handleLocationSelect = (location: any) => {
    setUserLocation({ lat: location.lat, lng: location.lng })
  }

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Tümü')
    setSelectedPriceRange('')
    setMinRating(0)
    setMaxDistance(10)
    setShowVerifiedOnly(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Harita Görünümü</h1>
            <p className="text-gray-600">
              {filteredBusinesses.length} işletme bulundu
              {userLocation && ` (konumunuza göre)`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Sliders className="w-4 h-4" />
              <span>Filtreler</span>
            </button>
          </div>
        </div>

        {/* Search and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="İşletme, kategori veya adres ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Konum seçin..."
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiyat Aralığı
                </label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRICE_RANGES.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Puan: {minRating}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesafe: {maxDistance === 50 ? 'Sınırsız' : `${maxDistance} km`}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Sadece doğrulanmış işletmeler</span>
              </label>

              <button
                onClick={resetFilters}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Business List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">İşletmeler</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredBusinesses.map((business) => (
                  <BusinessListItem
                    key={business.id}
                    business={business}
                    isSelected={selectedBusiness?.id === business.id}
                    onClick={() => handleBusinessClick(business)}
                  />
                ))}
                {filteredBusinesses.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>Kriterlere uygun işletme bulunamadı</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            {viewMode === 'map' ? (
              <GoogleMap
                businesses={filteredBusinesses.map(b => ({ 
                  id: b.id, 
                  name: b.name, 
                  lat: b.lat, 
                  lng: b.lng, 
                  category: b.category, 
                  avgRating: b.avgRating, 
                  address: b.address, 
                  verified: b.verified, 
                  isPremium: b.isPremium 
                }))}
                center={userLocation || { lat: 41.0082, lng: 28.9784 }}
                height="600px"
                showUserLocation={true}
                onMarkerClick={(mapBusiness) => {
                  const fullBusiness = filteredBusinesses.find(b => b.id === mapBusiness.id)
                  if (fullBusiness) handleBusinessClick(fullBusiness)
                }}
                selectedBusinessId={selectedBusiness?.id}
              />
            ) : (
              <div className="space-y-4">
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface BusinessListItemProps {
  business: Business
  isSelected: boolean
  onClick: () => void
}

function BusinessListItem({ business, isSelected, onClick }: BusinessListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900 truncate">{business.name}</h4>
            {business.verified && (
              <span className="ml-1 text-blue-500 text-sm">✓</span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{business.subcategory}</p>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {business.avgRating} ({business.totalReviews})
            </span>
          </div>
          {business.distance && (
            <p className="text-xs text-gray-500 mt-1">
              {business.distance.toFixed(1)} km uzakta
            </p>
          )}
        </div>
        {business.isPremium && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
            Premium
          </span>
        )}
      </div>
    </button>
  )
}

interface BusinessCardProps {
  business: Business
}

function BusinessCard({ business }: BusinessCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
            {business.verified && (
              <span className="ml-2 text-blue-500">✓ Doğrulanmış</span>
            )}
            {business.isPremium && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Premium
              </span>
            )}
          </div>
          <p className="text-gray-600">{business.subcategory}</p>
          <p className="text-sm text-gray-500 mt-1">{business.address}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {business.avgRating} ({business.totalReviews} yorum)
            </span>
          </div>
          {business.distance && (
            <span className="text-sm text-gray-500">
              {business.distance.toFixed(1)} km
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Detaylar
          </button>
          <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, MapPin, TrendingUp, Star, Grid, List, Map } from 'lucide-react'
import { BusinessCard } from '@/components/BusinessCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Business, SearchFilters, PriceRange } from '@/types'

const categories = [
  { name: 'Tümü', slug: '', count: 1240 },
  { name: 'Restoran', slug: 'restoran', count: 456 },
  { name: 'Kafe', slug: 'kafe', count: 234 },
  { name: 'Fast Food', slug: 'fast-food', count: 123 },
  { name: 'Berber', slug: 'berber', count: 89 },
  { name: 'Kuaför', slug: 'kuafor', count: 67 },
  { name: 'Market', slug: 'market', count: 156 },
  { name: 'Eczane', slug: 'eczane', count: 45 }
]

const districts = [
  'Tümü', 'Beşiktaş', 'Kadıköy', 'Şişli', 'Beyoğlu', 'Fatih', 'Üsküdar', 'Bakırköy'
]

const priceRanges = [
  { label: 'Ekonomik (₺)', value: 'BUDGET' as PriceRange },
  { label: 'Orta (₺₺)', value: 'MODERATE' as PriceRange },
  { label: 'Pahalı (₺₺₺)', value: 'EXPENSIVE' as PriceRange },
  { label: 'Lüks (₺₺₺₺)', value: 'LUXURY' as PriceRange }
]

interface CityPageProps {
  params: Promise<{ city: string }>
}

export default function CityPage({ params }: CityPageProps) {
  const resolvedParams = use(params)
  const [filters, setFilters] = useState<SearchFilters>({
    city: resolvedParams.city,
    sortBy: 'rating'
  })
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // API call to fetch businesses
  const { data: businessesData, isLoading } = useQuery({
    queryKey: ['businesses', resolvedParams.city, filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        city: resolvedParams.city,
        ...(filters.category && { category: filters.category }),
        ...(filters.district && { district: filters.district }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.query && { query: filters.query }),
        ...(filters.rating && { minRating: filters.rating.toString() }),
        ...(filters.priceRange?.length && { priceRange: filters.priceRange.join(',') }),
        ...(filters.isOpen && { isOpen: 'true' }),
        ...(filters.hasDelivery && { hasDelivery: 'true' })
      })
      
      const response = await fetch(`/api/businesses?${searchParams}`)
      if (!response.ok) {
        throw new Error('Businesses fetch failed')
      }
      return response.json()
    }
  })
  
  const businesses = businessesData?.data || []

  const cityName = resolvedParams.city.charAt(0).toUpperCase() + resolvedParams.city.slice(1)

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* City Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{cityName}</h1>
              <p className="text-gray-600 mt-2">
                {businesses?.length || 0} işletme • AI destekli öneriler
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <TrendingUp className="w-4 h-4 mr-1" />
                Bu hafta popüler
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Star className="w-4 h-4 mr-1" />
                Yüksek puanlı
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 bg-white rounded-xl shadow-sm p-6 h-fit sticky top-24`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white text-gray-900 border-gray-600 hover:bg-gray-50 hover:border-gray-700 font-medium shadow-sm"
                onClick={() => setFilters({ city: resolvedParams.city, sortBy: 'rating' })}
              >
                Temizle
              </Button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900">Kategoriler</h4>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.slug} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.slug}
                      checked={filters.category === category.slug}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 font-medium">
                      {category.name} ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Districts */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900">Bölgeler</h4>
              <select
                value={filters.district || ''}
                onChange={(e) => updateFilter('district', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
              >
                {districts.map((district) => (
                  <option key={district} value={district === 'Tümü' ? '' : district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900">Fiyat Aralığı</h4>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={range.value}
                      checked={filters.priceRange?.includes(range.value) || false}
                      onChange={(e) => {
                        const current = filters.priceRange || []
                        if (e.target.checked) {
                          updateFilter('priceRange', [...current, range.value])
                        } else {
                          updateFilter('priceRange', current.filter(p => p !== range.value))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 font-medium">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-900">Minimum Puan</h4>
              <select
                value={filters.rating || ''}
                onChange={(e) => updateFilter('rating', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
              >
                <option value="">Tümü</option>
                <option value="4">4+ Yıldız</option>
                <option value="3">3+ Yıldız</option>
                <option value="2">2+ Yıldız</option>
              </select>
            </div>

            {/* Special Filters */}
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Özel Filtreler</h4>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isOpen || false}
                    onChange={(e) => updateFilter('isOpen', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900 font-medium">Şu anda açık</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasDelivery || false}
                    onChange={(e) => updateFilter('hasDelivery', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900 font-medium">Teslimat var</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.accessibility || false}
                    onChange={(e) => updateFilter('accessibility', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-900 font-medium">Engelli erişimi</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Controls */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtreler
                </Button>
                
                <select
                  value={filters.sortBy || 'rating'}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium bg-white"
                >
                  <option value="rating">En Yüksek Puan</option>
                  <option value="reviews">En Çok Yorum</option>
                  <option value="distance">En Yakın</option>
                  <option value="trending">Trend</option>
                  <option value="newest">En Yeni</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">İşletmeler yükleniyor...</p>
              </div>
            ) : (
              <div className={`
                ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 
                  viewMode === 'list' ? 'space-y-4' : 'h-96 bg-gray-200 rounded-xl flex items-center justify-center'}
              `}>
                {viewMode === 'map' ? (
                  <div className="text-center text-gray-500">
                    Harita görünümü yakında eklenecek
                  </div>
                ) : (
                  businesses?.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      variant={viewMode === 'list' ? 'compact' : 'default'}
                      showAI={true}
                    />
                  ))
                )}
              </div>
            )}

            {/* Load More */}
            {businesses && businesses.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Daha Fazla Göster
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
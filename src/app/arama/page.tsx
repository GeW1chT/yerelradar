'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { 
  Filter, Grid, List, Map, SlidersHorizontal, Clock, 
  Star, TrendingUp, MapPin, Zap, AlertCircle 
} from 'lucide-react'
import SearchComponent from '@/components/SearchComponent'
import { BusinessCard } from '@/components/BusinessCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Business } from '@/types'

interface SearchFilters {
  q: string
  city?: string
  category?: string
  minRating?: number
  priceRange?: string[]
  sortBy: 'relevance' | 'rating' | 'distance' | 'reviews' | 'trending'
  isOpen?: boolean
  hasDelivery?: boolean
  accessibility?: boolean
  radius: number
  aiEnhanced: boolean
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Parse search parameters
  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || undefined,
    category: searchParams.get('category') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    priceRange: searchParams.get('priceRange')?.split(',') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    isOpen: searchParams.get('isOpen') === 'true',
    hasDelivery: searchParams.get('hasDelivery') === 'true',
    accessibility: searchParams.get('accessibility') === 'true',
    radius: searchParams.get('radius') ? Number(searchParams.get('radius')) : 10,
    aiEnhanced: searchParams.get('aiEnhanced') !== 'false'
  })

  // Search API call
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      const searchQuery = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
          searchQuery.set(key, Array.isArray(value) ? value.join(',') : String(value))
        }
      })

      const response = await fetch(`/api/search?${searchQuery.toString()}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      return response.json()
    },
    enabled: !!filters.q
  })

  const businesses = searchResults?.data || []
  const meta = searchResults?.meta || {}

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (query: string, searchFilters?: any) => {
    setFilters(prev => ({
      ...prev,
      q: query,
      ...(searchFilters || {})
    }))
  }

  if (!filters.q) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              YerelRadar'da Arama Yapın
            </h1>
            <p className="text-gray-600 mb-8">
              AI destekli arama ile şehrinizdeki en iyi işletmeleri keşfedin
            </p>
            <SearchComponent 
              autoFocus 
              onSearch={handleSearch}
              showFilters={true}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SearchComponent 
            initialQuery={filters.q}
            initialLocation={filters.city}
            onSearch={handleSearch}
            showFilters={false}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              &quot;{filters.q}&quot; için arama sonuçları
            </h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              {isLoading ? (
                <span>Aranıyor...</span>
              ) : (
                <>
                  <span>{meta.total || 0} sonuç bulundu</span>
                  {meta.searchTime && (
                    <span>({meta.searchTime}ms)</span>
                  )}
                  {filters.aiEnhanced && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Zap className="w-3 h-3 mr-1" />
                      AI Destekli
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium bg-white"
            >
              <option value="relevance">En İlgili</option>
              <option value="rating">En Yüksek Puan</option>
              <option value="distance">En Yakın</option>
              <option value="reviews">En Çok Yorum</option>
              <option value="trending">Trend</option>
            </select>

            {/* View Mode Buttons */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600 text-white' : ''}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-600 text-white' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-blue-600 text-white' : ''}
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border-gray-300"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtreler
            </Button>
          </div>
        </div>

        {/* AI Suggestions */}
        {meta.suggestions && meta.suggestions.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">AI Önerileri</h3>
                <div className="flex flex-wrap gap-2">
                  {meta.suggestions.map((suggestion: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSearch(suggestion)}
                      className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <div className="w-80 bg-white rounded-xl shadow-sm p-6 h-fit sticky top-32">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    category: undefined,
                    minRating: undefined,
                    priceRange: undefined,
                    isOpen: false,
                    hasDelivery: false,
                    accessibility: false
                  }))}
                  className="bg-white border-gray-300"
                >
                  Temizle
                </Button>
              </div>

              {/* Active Filters */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {filters.minRating && (
                    <Badge variant="outline" className="bg-white border-gray-300">
                      <Star className="w-3 h-3 mr-1" />
                      {filters.minRating}+ yıldız
                    </Badge>
                  )}
                  {filters.isOpen && (
                    <Badge variant="outline" className="bg-white border-gray-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Şu anda açık
                    </Badge>
                  )}
                  {filters.hasDelivery && (
                    <Badge variant="outline" className="bg-white border-gray-300">
                      Teslimat var
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-900">Minimum Puan</h4>
                <select
                  value={filters.minRating || ''}
                  onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                >
                  <option value="">Tümü</option>
                  <option value="4">4+ Yıldız</option>
                  <option value="3">3+ Yıldız</option>
                  <option value="2">2+ Yıldız</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-900">Fiyat Aralığı</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Ekonomik (₺)', value: 'BUDGET' },
                    { label: 'Orta (₺₺)', value: 'MODERATE' },
                    { label: 'Pahalı (₺₺₺)', value: 'EXPENSIVE' },
                    { label: 'Lüks (₺₺₺₺)', value: 'LUXURY' }
                  ].map((range) => (
                    <label key={range.value} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
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

              {/* Special Features */}
              <div>
                <h4 className="font-medium mb-3 text-gray-900">Özellikler</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isOpen}
                      onChange={(e) => updateFilter('isOpen', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 font-medium">Şu anda açık</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasDelivery}
                      onChange={(e) => updateFilter('hasDelivery', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 font-medium">Teslimat var</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.accessibility}
                      onChange={(e) => updateFilter('accessibility', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-900 font-medium">Engelli erişimi</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Results Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Aranıyor...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Arama hatası</h3>
                <p className="text-gray-600">Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.</p>
              </div>
            ) : businesses.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sonuç bulunamadı</h3>
                <p className="text-gray-600 mb-4">
                  &quot;{filters.q}&quot; için sonuç bulunamadı. Farklı anahtar kelimeler deneyin.
                </p>
                {meta.suggestions && meta.suggestions.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {meta.suggestions.map((suggestion: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Results Grid */}
                <div className={`
                  ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 
                    viewMode === 'list' ? 'space-y-4' : 'h-96 bg-gray-200 rounded-xl flex items-center justify-center'}
                `}>
                  {viewMode === 'map' ? (
                    <div className="text-center text-gray-500">
                      Harita görünümü yakında eklenecek
                    </div>
                  ) : (
                    businesses.map((business: Business) => (
                      <BusinessCard
                        key={business.id}
                        business={business}
                        variant={viewMode === 'list' ? 'compact' : 'default'}
                        showAI={true}
                        searchQuery={filters.q}
                      />
                    ))
                  )}
                </div>

                {/* Load More */}
                {meta.hasMore && (
                  <div className="text-center mt-12">
                    <Button variant="outline" size="lg">
                      Daha Fazla Göster
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
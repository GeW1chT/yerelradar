'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@clerk/nextjs'
import { 
  Heart, Star, MapPin, TrendingUp, User, Sparkles, 
  RefreshCw, Settings, Filter, Clock, Zap
} from 'lucide-react'
import { BusinessCard } from '@/components/BusinessCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PersonalizedRecommendationsProps {
  city?: string
  category?: string
  userLocation?: { lat: number; lng: number }
  limit?: number
  showTitle?: boolean
  variant?: 'full' | 'compact' | 'sidebar'
}

export default function PersonalizedRecommendations({
  city,
  category,
  userLocation,
  limit = 10,
  showTitle = true,
  variant = 'full'
}: PersonalizedRecommendationsProps) {
  const { user, isSignedIn } = useUser()
  const [recommendationType, setRecommendationType] = useState<'general' | 'nearby' | 'trending' | 'similar'>('general')
  const [showSettings, setShowSettings] = useState(false)

  // Fetch personalized recommendations
  const { data: recommendationsData, isLoading, refetch } = useQuery({
    queryKey: ['recommendations', user?.id, city, category, recommendationType, userLocation],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (city) params.set('city', city)
      if (category) params.set('category', category)
      if (limit) params.set('limit', limit.toString())
      params.set('type', recommendationType)
      if (userLocation) {
        params.set('lat', userLocation.lat.toString())
        params.set('lng', userLocation.lng.toString())
      }

      const response = await fetch(`/api/recommendations?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Recommendations fetch failed')
      }
      return response.json()
    },
    enabled: !!isSignedIn
  })

  const recommendations = recommendationsData?.data || []
  const meta = recommendationsData?.meta || {}

  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kişiselleştirilmiş Öneriler
          </h3>
          <p className="text-gray-600 mb-4">
            Size özel öneriler görmek için giriş yapın
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Giriş Yap
          </Button>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        {showTitle && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Size Özel</h3>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((business: any) => (
              <div key={business.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{business.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{business.avgRating}</span>
                    <span className="text-xs text-blue-600">• {business.personalizedScore}% uyum</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{business.matchReason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
              Size Özel Öneriler
            </h2>
            <p className="text-gray-600 mt-1">
              Geçmiş aktivitelerinize göre sizin için seçtiklerimiz
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {meta.personalizedScore && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="w-3 h-3 mr-1" />
                %{meta.personalizedScore} kişiselleştirme
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>
      )}

      {/* AI Recommendations Message */}
      {meta.recommendations?.personalizedMessage && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900 mb-1">AI Önerisi</h3>
              <p className="text-sm text-purple-700">{meta.recommendations.personalizedMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Type Filters */}
      {showSettings && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Öneri Türü</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'general', label: 'Genel Öneriler', icon: Star },
              { key: 'nearby', label: 'Yakınımdakiler', icon: MapPin },
              { key: 'trending', label: 'Trend Olanlar', icon: TrendingUp },
              { key: 'similar', label: 'Benzer Yerler', icon: Heart }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={recommendationType === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecommendationType(key as any)}
                className={recommendationType === key ? 'bg-purple-600 text-white' : 'bg-white border-gray-300'}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-xl"></div>
              <div className="bg-white p-4 rounded-b-xl border border-t-0 border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((business: any) => (
            <div key={business.id} className="relative">
              <BusinessCard
                business={business}
                userLocation={userLocation}
                variant="default"
                showAI={true}
              />
              
              {/* Personalization Overlay */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {business.personalizedScore}% uyum
                </Badge>
              </div>
              
              {/* Match Reason */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 border">
                  <p className="text-xs text-gray-700 font-medium">
                    {business.matchReason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz öneri bulunamadı
          </h3>
          <p className="text-gray-600 mb-4">
            Daha fazla yorum yaparak önerilerimizi geliştirin
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </div>
      )}

      {/* Next Update Info */}
      {meta.nextUpdate && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Öneriler {new Date(meta.nextUpdate).toLocaleDateString('tr-TR')} tarihinde güncellenecek
          </p>
        </div>
      )}
    </div>
  )
}
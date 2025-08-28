'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Clock, Phone, Wifi, Car, Heart, Share2, TrendingUp, Shield, Users } from 'lucide-react'
import { Business, Amenity } from '@/types'
import { cn, formatPriceRange, formatRating, formatDistance, isBusinessOpen, generateStarRating, calculateDistance } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BusinessCardProps {
  business: Business
  userLocation?: { lat: number; lng: number }
  isLiked?: boolean
  onLike?: (businessId: string) => void
  onShare?: (business: Business) => void
  variant?: 'default' | 'compact' | 'featured'
  showAI?: boolean
}

export function BusinessCard({ 
  business, 
  userLocation, 
  isLiked = false,
  onLike,
  onShare,
  variant = 'default',
  showAI = true
}: BusinessCardProps) {
  const { full, half, empty } = generateStarRating(business.avgRating)
  const isOpen = business.workingHours ? isBusinessOpen(business.workingHours) : false
  
  const distance = userLocation 
    ? formatDistance(calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng))
    : null

  const amenityIcons: Partial<Record<Amenity, any>> = {
    WIFI: Wifi,
    PARKING: Car,
    WHEELCHAIR_ACCESSIBLE: Shield,
    // Add other icons as needed
  }

  if (variant === 'compact') {
    return (
      <Link href={`/${business.city.toLowerCase()}/${business.slug}`}>
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
            <Image
              src={business.images?.[0]?.url || '/placeholder-business.jpg'}
              alt={business.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{business.name}</h3>
            <div className="flex items-center space-x-1">
              <StarRating rating={business.avgRating} size="sm" />
              <span className="text-sm text-gray-600">({business.totalReviews})</span>
            </div>
            <p className="text-sm text-gray-500 truncate">{business.district}</p>
          </div>
          {distance && (
            <span className="text-sm text-gray-500">{distance}</span>
          )}
        </div>
      </Link>
    )
  }

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white",
      variant === 'featured' && "border-2 border-blue-200 shadow-lg"
    )}>
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={business.images?.[0]?.url || '/placeholder-business.jpg'}
          alt={business.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {business.verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Doğrulandı
            </Badge>
          )}
          {business.isPremium && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              ⭐ Premium
            </Badge>
          )}
          {business.trendScore > 8 && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trend
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 hover:bg-white"
            onClick={() => onLike?.(business.id)}
          >
            <Heart className={cn("w-4 h-4", isLiked && "fill-red-500 text-red-500")} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 hover:bg-white"
            onClick={() => onShare?.(business)}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Price Range */}
        {business.priceRange && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="outline" className="bg-white/90">
              {formatPriceRange(business.priceRange)}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <Link href={`/${business.city.toLowerCase()}/${business.slug}`}>
              <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors truncate">
                {business.name}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm">{business.category}</p>
          </div>
          
          <div className="flex flex-col items-end ml-3">
            <div className="flex items-center space-x-1">
              <StarRating rating={business.avgRating} />
              <span className="font-medium">{formatRating(business.avgRating)}</span>
            </div>
            <span className="text-sm text-gray-500">({business.totalReviews})</span>
          </div>
        </div>

        {/* Location & Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{business.district}</span>
            {distance && (
              <span className="ml-2 text-blue-600">• {distance}</span>
            )}
          </div>
          
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span className={cn(
              isOpen ? "text-green-600" : "text-red-600"
            )}>
              {isOpen ? "Açık" : "Kapalı"}
            </span>
          </div>
        </div>

        {/* Health Score */}
        {business.healthScore > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sağlık Skoru</span>
              <span className={cn(
                "font-medium",
                business.healthScore >= 8 ? "text-green-600" : 
                business.healthScore >= 6 ? "text-yellow-600" : "text-red-600"
              )}>
                {business.healthScore.toFixed(1)}/10
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={cn(
                  "h-1.5 rounded-full",
                  business.healthScore >= 8 ? "bg-green-500" : 
                  business.healthScore >= 6 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${business.healthScore * 10}%` }}
              />
            </div>
          </div>
        )}

        {/* Amenities */}
        {business.amenities && business.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {business.amenities.slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity.amenity]
              return (
                <Badge key={amenity.id} variant="outline" className="text-xs">
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {amenity.amenity.replace('_', ' ')}
                </Badge>
              )
            })}
            {business.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{business.amenities.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* AI Summary */}
        {showAI && business.aiSummary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-start space-x-2">
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                AI
              </div>
              <p className="text-sm text-blue-800 flex-1">{business.aiSummary}</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{business.totalCheckIns} check-in</span>
            </div>
            {business.phone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${business.phone}`)}
              >
                <Phone className="w-4 h-4 mr-1" />
                Ara
              </Button>
            )}
          </div>
          
          <Link href={`/${business.city.toLowerCase()}/${business.slug}`}>
            <Button size="sm" variant="default">
              Detaylar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Star Rating Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'xs' | 'sm' | 'md' }) {
  const { full, half, empty } = generateStarRating(rating)
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  }
  
  return (
    <div className="flex">
      {/* Full stars */}
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
      ))}
      
      {/* Half star */}
      {half && (
        <div className="relative">
          <Star className={cn(sizeClasses[size], "text-gray-300")} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(sizeClasses[size], "fill-yellow-400 text-yellow-400")} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className={cn(sizeClasses[size], "text-gray-300")} />
      ))}
    </div>
  )
}
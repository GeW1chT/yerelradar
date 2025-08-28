'use client'

import { useState, useEffect, use } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeft, Star, MapPin, Clock, Phone, Globe, Share2, Heart, 
  TrendingUp, Users, Camera, MessageSquare, Navigation, Car, 
  Wifi, Shield, Award, Zap, CheckCircle, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ReviewForm from '@/components/ReviewForm'
import { Business, Review, WorkingHours, Amenity } from '@/types'
import { 
  formatRating, formatDistance, formatTimeAgo, isBusinessOpen, 
  generateStarRating, formatPriceRange, calculateDistance 
} from '@/lib/utils'

// Mock data for development
const mockBusiness: Business = {
  id: '1',
  name: 'Köşe Pizza',
  slug: 'kose-pizza-besiktas',
  description: '25 yıldır İstanbul\'da aynı lezzetle hizmet veren aile işletmesi. Özel tariflerimiz ve taze malzemelerimizle unutulmaz pizza deneyimi sunuyoruz.',
  category: 'Restoran',
  subcategory: 'Pizza',
  city: 'İstanbul',
  district: 'Beşiktaş',
  neighborhood: 'Levent',
  address: 'Barbaros Bulvarı No:45 Beşiktaş/İstanbul',
  lat: 41.0431,
  lng: 29.0099,
  phone: '+90 212 234 12 34',
  website: 'https://kosepizza.com',
  email: 'info@kosepizza.com',
  verified: true,
  isPremium: true,
  avgRating: 4.2,
  totalReviews: 128,
  totalCheckIns: 245,
  healthScore: 8.5,
  hygieneScore: 9.0,
  serviceScore: 8.2,
  valueScore: 7.8,
  trendScore: 8.8,
  aiSummary: 'Müşteriler lezzetli pizzaları, hızlı servisini ve samimi atmosferini övüyor. Özellikle margherita ve sucuklu pizza favoriler arasında. Temizlik konusunda da yüksek not alıyor.',
  priceRange: 'MODERATE',
  covidSafety: 8.5,
  createdAt: new Date(),
  updatedAt: new Date(),
  
  workingHours: [
    { id: '1', businessId: '1', day: 'MONDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
    { id: '2', businessId: '1', day: 'TUESDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
    { id: '3', businessId: '1', day: 'WEDNESDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
    { id: '4', businessId: '1', day: 'THURSDAY', openTime: '11:00', closeTime: '23:00', isClosed: false },
    { id: '5', businessId: '1', day: 'FRIDAY', openTime: '11:00', closeTime: '24:00', isClosed: false },
    { id: '6', businessId: '1', day: 'SATURDAY', openTime: '11:00', closeTime: '24:00', isClosed: false },
    { id: '7', businessId: '1', day: 'SUNDAY', openTime: '12:00', closeTime: '23:00', isClosed: false },
  ],
  
  images: [
    { id: '1', businessId: '1', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop', caption: 'İmza pizza margherita', order: 0, aiTags: ['pizza', 'margherita', 'cheese'], createdAt: new Date() },
    { id: '2', businessId: '1', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop', caption: 'Sucuklu özel pizza', order: 1, aiTags: ['pizza', 'sucuk', 'hot'], createdAt: new Date() },
    { id: '3', businessId: '1', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop', caption: 'Sıcak ve samimi atmosfer', order: 2, aiTags: ['interior', 'cozy', 'restaurant'], createdAt: new Date() },
  ],
  
  amenities: [
    { id: '1', businessId: '1', amenity: 'WIFI', createdAt: new Date() },
    { id: '2', businessId: '1', amenity: 'PARKING', createdAt: new Date() },
    { id: '3', businessId: '1', amenity: 'DELIVERY', createdAt: new Date() },
    { id: '4', businessId: '1', amenity: 'TAKEOUT', createdAt: new Date() },
    { id: '5', businessId: '1', amenity: 'ACCEPTS_CARDS', createdAt: new Date() },
  ]
}

const mockReviews: Review[] = [
  {
    id: '1',
    businessId: '1',
    userId: '1',
    rating: 5,
    title: 'Harika pizza deneyimi!',
    content: 'Yıllardır geliyorum ve hiç bozulmadı. Pizzalar çok lezzetli, servis hızlı ve personel güler yüzlü. Özellikle margherita pizza muhteşem!',
    aiSentiment: 'VERY_POSITIVE',
    aiScore: 9.2,
    tasteScore: 9,
    serviceScore: 8,
    cleanlinessScore: 9,
    priceScore: 8,
    atmosphereScore: 8,
    aiTags: ['lezzet', 'hızlı servis', 'güler yüz'],
    aiSummary: 'Uzun süreli müşteri, lezzet ve servis kalitesinden çok memnun',
    helpfulCount: 12,
    isVerifiedVisit: true,
    visitDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '2',
    businessId: '1',
    userId: '2',
    rating: 4,
    title: 'Güzel ama biraz pahalı',
    content: 'Pizza lezzetli ama fiyatlar biraz yüksek. Atmosfer güzel, temizlik iyi. Bir kez daha gelebilirim.',
    aiSentiment: 'POSITIVE',
    aiScore: 7.5,
    tasteScore: 8,
    serviceScore: 7,
    cleanlinessScore: 8,
    priceScore: 6,
    atmosphereScore: 8,
    aiTags: ['lezzet', 'pahalı', 'temiz'],
    aiSummary: 'Kaliteden memnun ama fiyat konusunda tereddütlü',
    helpfulCount: 8,
    isVerifiedVisit: true,
    visitDate: new Date('2024-01-10'),
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  }
]

interface BusinessDetailPageProps {
  params: Promise<{ city: string; slug: string }>
}

export default function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  const resolvedParams = use(params)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Fallback to Istanbul center
          setUserLocation({ lat: 41.0082, lng: 28.9784 })
        }
      )
    }
  }, [])

  // Mock API calls
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', resolvedParams.slug],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800))
      return mockBusiness
    }
  })

  const { data: reviews } = useQuery({
    queryKey: ['reviews', resolvedParams.slug],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockReviews
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İşletme bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!business) return <div>İşletme bulunamadı</div>

  const { full, half, empty } = generateStarRating(business.avgRating)
  const isOpen = isBusinessOpen(business.workingHours || [])
  const distance = userLocation 
    ? formatDistance(calculateDistance(userLocation.lat, userLocation.lng, business.lat, business.lng))
    : null

  const handleReviewSubmit = async (formData: FormData) => {
    try {
      formData.append('businessId', business.id)
      
      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Review submission failed')
      }
      
      const result = await response.json()
      
      if (result.success) {
        alert('Yorumunuz başarıyla gönderildi!')
        setShowReviewForm(false)
        // Refresh reviews data
        // In a real app, you would invalidate the query here
      } else {
        throw new Error(result.error || 'Yorum gönderilemedi')
      }
    } catch (error) {
      console.error('Review submission error:', error)
      alert('Yorum gönderilirken hata oluştu')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${resolvedParams.city}`} className="flex items-center text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {resolvedParams.city.charAt(0).toUpperCase() + resolvedParams.city.slice(1)} işletmeleri
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {isLiked ? 'Kaydedildi' : 'Kaydet'}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Paylaş
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-96">
                <Image
                  src={business.images?.[activeImageIndex]?.url || '/placeholder-business.jpg'}
                  alt={business.images?.[activeImageIndex]?.caption || business.name}
                  fill
                  className="object-cover"
                />
                
                {/* Image Navigation */}
                {business.images && business.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-center space-x-2">
                      {business.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === activeImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Photo count */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  <Camera className="w-4 h-4 inline mr-1" />
                  {business.images?.length || 0} fotoğraf
                </div>
              </div>
              
              {/* Image thumbnails */}
              {business.images && business.images.length > 1 && (
                <div className="p-4 flex space-x-3 overflow-x-auto">
                  {business.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                        index === activeImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.caption || ''}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
                    {business.verified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Doğrulandı
                      </Badge>
                    )}
                    {business.isPremium && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {business.category}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {business.district}
                    </span>
                    {distance && (
                      <span className="text-blue-600">• {distance}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {business.description}
                  </p>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center justify-between border-t border-b py-4 mb-4">
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-1 mb-1">
                      <StarRating rating={business.avgRating} size="md" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatRating(business.avgRating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {business.totalReviews} yorum
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {business.healthScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Sağlık Skoru
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {business.totalCheckIns}
                    </div>
                    <div className="text-sm text-gray-500">
                      Check-in
                    </div>
                  </div>
                </div>
                
                <Button size="lg">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Yorum Yaz
                </Button>
              </div>

              {/* AI Summary */}
              {business.aiSummary && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      AI Özet
                    </div>
                    <p className="text-gray-800 flex-1 leading-relaxed">
                      {business.aiSummary}
                    </p>
                  </div>
                </div>
              )}

              {/* Amenities */}
              {business.amenities && business.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Özellikler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {business.amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{amenity.amenity.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Yorumlar</h2>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Yorum Yaz
                  </Button>
                  <Button variant="outline">
                    Tüm Yorumları Gör
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {reviews?.slice(0, showAllReviews ? reviews.length : 3).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {reviews && reviews.length > 3 && !showAllReviews && (
                <div className="text-center mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllReviews(true)}
                  >
                    Daha Fazla Yorum Göster ({reviews.length - 3} yorum daha)
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">İletişim</h3>
                <div className={`flex items-center text-sm font-medium ${
                  isOpen ? 'text-green-600' : 'text-red-600'
                }`}>
                  <Clock className="w-4 h-4 mr-1" />
                  {isOpen ? 'Açık' : 'Kapalı'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{business.address}</span>
                </div>
                
                {business.phone && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${business.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {business.phone}
                    </a>
                  </Button>
                )}

                {business.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  </Button>
                )}

                <Button className="w-full">
                  <Navigation className="w-4 h-4 mr-2" />
                  Yol Tarifi Al
                </Button>
              </div>

              {/* Working Hours */}
              {business.workingHours && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Çalışma Saatleri</h4>
                  <div className="space-y-2 text-sm">
                    {business.workingHours.map((hours) => (
                      <div key={hours.id} className="flex justify-between">
                        <span className="text-gray-600">{hours.day}</span>
                        <span className="text-gray-900">
                          {hours.isClosed ? 'Kapalı' : `${hours.openTime} - ${hours.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              businessId={business.id}
              businessName={business.name}
              businessType={business.category}
              onSubmit={handleReviewSubmit}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}
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
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
      ))}
      {half && (
        <div className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />
      ))}
    </div>
  )
}

// Review Card Component
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
            U
          </div>
          <div>
            <div className="font-medium text-gray-900">Kullanıcı</div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <StarRating rating={review.rating} />
              <span>•</span>
              <span>{formatTimeAgo(review.createdAt)}</span>
              {review.isVerifiedVisit && (
                <>
                  <span>•</span>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Doğrulanmış
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm">
          {review.helpfulCount} kişi faydalı buldu
        </Button>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
      <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>
      
      {/* AI Analysis */}
      {review.aiTags && review.aiTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.aiTags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {review.aiSummary && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">AI Analizi</div>
              <p className="text-sm text-gray-700">{review.aiSummary}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
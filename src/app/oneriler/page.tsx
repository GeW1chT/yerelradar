'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { 
  Sparkles, MapPin, Filter, TrendingUp, Heart, User,
  Settings, RefreshCw, Clock, Zap, Brain
} from 'lucide-react'
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations'
import SearchComponent from '@/components/SearchComponent'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function RecommendationsPage() {
  const { user, isSignedIn } = useUser()
  const searchParams = useSearchParams()
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'İstanbul')

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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Kişiselleştirilmiş Öneriler
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI destekli sistemimiz, geçmiş aktivitelerinizi analiz ederek size en uygun işletmeleri önerir
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">AI Analizi</h3>
                <p className="text-sm text-gray-600">
                  Yorumlarınız ve tercihleriniz analiz edilerek kişisel profiliniz oluşturulur
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <Zap className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Akıllı Eşleştirme</h3>
                <p className="text-sm text-gray-600">
                  Size benzer kullanıcıların beğendikleri yerler de önerilerimize dahil edilir
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Sürekli Gelişim</h3>
                <p className="text-sm text-gray-600">
                  Her aktivitenizle önerilerimiz daha da kişiselleşir ve kaliteli hale gelir
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                <User className="w-5 h-5 mr-2" />
                Giriş Yapın
              </Button>
              <p className="text-sm text-gray-500">
                Hesabınız yok mu? Hemen ücretsiz kayıt olun
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 mr-3" />
              <h1 className="text-4xl font-bold">Size Özel Öneriler</h1>
            </div>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              AI teknolojimiz, geçmiş aktivitelerinizi ve tercihlerinizi analiz ederek 
              size en uygun işletmeleri öneriyor
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-sm text-purple-200">Doğruluk Oranı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-purple-200">Güncelleme</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1000+</div>
                <div className="text-sm text-purple-200">İşletme</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchComponent 
            placeholder="Hangi tür işletme arıyorsunuz?"
            showFilters={true}
            initialLocation={selectedCity}
          />
        </div>
      </div>

      {/* City Selection */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <MapPin className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600 font-medium">Şehir:</span>
            <div className="flex space-x-2">
              {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'].map((city) => (
                <Button
                  key={city}
                  variant={selectedCity === city ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCity(city)}
                  className={selectedCity === city ? 'bg-purple-600 text-white' : 'bg-white border-gray-300'}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PersonalizedRecommendations
          city={selectedCity}
          userLocation={userLocation}
          limit={12}
          showTitle={true}
          variant="full"
        />

        {/* Additional Sections */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How It Works */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 text-purple-600 mr-2" />
              Nasıl Çalışır?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">1</div>
                <div>
                  <h4 className="font-medium text-gray-900">Aktivite Analizi</h4>
                  <p className="text-sm text-gray-600">Yorumlarınız, kaydettiğiniz yerler ve puanlarınız analiz edilir</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">2</div>
                <div>
                  <h4 className="font-medium text-gray-900">AI Profilleme</h4>
                  <p className="text-sm text-gray-600">Yapay zeka algoritmaları kişisel tercih profilinizi oluşturur</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">3</div>
                <div>
                  <h4 className="font-medium text-gray-900">Akıllı Öneriler</h4>
                  <p className="text-sm text-gray-600">Size en uygun işletmeler önerilir ve sürekli güncellenir</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              Önerileri İyileştirme İpuçları
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Heart className="w-4 h-4 text-red-500 mt-1" />
                <p className="text-sm text-gray-700">Daha fazla yorum yazarak sistem sizi daha iyi tanır</p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-green-500 mt-1" />
                <p className="text-sm text-gray-700">Konum paylaşımı yakınınızdaki yerleri önermemizi sağlar</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-orange-500 mt-1" />
                <p className="text-sm text-gray-700">Düzenli kullanım önerilerin kalitesini artırır</p>
              </div>
              <div className="flex items-start space-x-3">
                <Filter className="w-4 h-4 text-purple-500 mt-1" />
                <p className="text-sm text-gray-700">Profil ayarlarınızı güncel tutun</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
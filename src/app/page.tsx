'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Star, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const cities = [
  { 
    name: 'İstanbul', 
    slug: 'istanbul', 
    businessCount: 15420, 
    reviewCount: 89500,
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&h=300&fit=crop',
    districts: ['Beşiktaş', 'Kadıköy', 'Şişli', 'Beyoğlu']
  },
  { 
    name: 'Ankara', 
    slug: 'ankara', 
    businessCount: 8760, 
    reviewCount: 42300,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop',
    districts: ['Çankaya', 'Kızılay', 'Bahçelievler']
  },
  { 
    name: 'İzmir', 
    slug: 'izmir', 
    businessCount: 6890, 
    reviewCount: 35600,
    image: 'https://images.unsplash.com/photo-1535262473814-0a07c8ab03dd?w=400&h=300&fit=crop',
    districts: ['Alsancak', 'Konak', 'Bornova']
  },
  { 
    name: 'Antalya', 
    slug: 'antalya', 
    businessCount: 4520, 
    reviewCount: 28900,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    districts: ['Kaleiçi', 'Lara', 'Muratpaşa']
  },
]

const features = [
  {
    icon: Zap,
    title: 'AI Destekli Yorumlar',
    description: 'Yapay zeka ile analiz edilen yorumlar sayesinde gerçek deneyimleri keşfet'
  },
  {
    icon: TrendingUp,
    title: 'Trend Analizi',
    description: 'Şehirde yükselen kategoriler ve mekanları ilk sen keşfet'
  },
  {
    icon: Users,
    title: 'Yerel Kahramanlar',
    description: 'Güvenilir yorumcuları takip et, önerilerinden faydalanın'
  },
  {
    icon: Star,
    title: 'Sağlık Skorları',
    description: 'AI ile hesaplanan hijyen ve güvenlik puanları'
  }
]

const stats = [
  { label: 'Kayıtlı İşletme', value: '35,590+' },
  { label: 'AI Analiz Edilen Yorum', value: '196,400+' },
  { label: 'Aktif Kullanıcı', value: '89,200+' },
  { label: 'Şehir', value: '24' }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🤖 Yapay Zeka Destekli Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Şehrindeki En İyi
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                İşletmeleri Keşfet
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              AI destekli yorumlar, akıllı öneriler ve yerel kahramanlarla 
              gerçek deneyimleri keşfet. Sağlık skorları ile güvenli seçimler yap.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Restoran, kafe, berber... aradığın yeri yaz"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg text-gray-900 bg-white rounded-xl shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400">
                    {stat.value}
                  </div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* City Selection */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hangi Şehirde Keşfe Başlayalım?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Her şehrin kendine özgü lezzetleri ve deneyimleri var. 
              AI destekli sistemimizle şehrinin gizli keşfini yap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cities.map((city, index) => (
              <Link key={city.slug} href={`/${city.slug}`}>
                <div className="group cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={city.image}
                      alt={city.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{city.name}</h3>
                      <div className="flex items-center text-sm opacity-90">
                        <MapPin className="w-4 h-4 mr-1" />
                        {city.districts.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {city.businessCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">İşletme</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {city.reviewCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">AI Yorum</div>
                      </div>
                    </div>

                    <Button className="w-full group-hover:bg-blue-700 transition-colors">
                      Keşfet
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden YerelRadar?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Geleneksel yorum sitelerinin ötesinde, yapay zeka destekli 
              analitiklerle daha akıllı seçimler yapın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen Keşfetmeye Başla
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Binlerce AI analizi yapılmış yorum ve akıllı öneri seni bekliyor.
            Şehrindeki gizli lezzetleri ve deneyimleri keşfet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100">
              İşletmeleri Keşfet
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              İşletme Sahibi misin?
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
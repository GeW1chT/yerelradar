'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, TrendingDown, Users, MessageSquare, Star, Eye, 
  Phone, Globe, MapPin, Calendar, Download, Settings, 
  BarChart3, PieChart, Activity, Target, Zap, AlertTriangle,
  Award, Shield, Clock, CheckCircle, ArrowUpRight, ArrowDownRight, Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Business, BusinessAnalytics, Review } from '@/types'

// Mock data for demonstration
const mockBusinessData = {
  business: {
    id: '1',
    name: 'Köşe Pizza',
    category: 'Restoran',
    district: 'Beşiktaş',
    verified: true,
    isPremium: true,
    avgRating: 4.2,
    totalReviews: 128,
    totalCheckIns: 245,
    healthScore: 8.5,
    trendScore: 8.8
  },
  analytics: {
    thisMonth: {
      profileViews: 2340,
      phoneClicks: 87,
      websiteClicks: 156,
      directionClicks: 203,
      newReviews: 12,
      avgRating: 4.3,
      checkIns: 45
    },
    lastMonth: {
      profileViews: 1980,
      phoneClicks: 72,
      websiteClicks: 134,
      directionClicks: 187,
      newReviews: 8,
      avgRating: 4.1,
      checkIns: 38
    },
    yearlyGrowth: {
      profileViews: 34.2,
      reviews: 28.5,
      rating: 12.1,
      checkIns: 41.7
    }
  },
  aiInsights: {
    overview: 'Bu ay performansınız çok iyi! Profil görüntülenme sayınız %18 arttı ve yeni yorumlar %50 daha fazla.',
    strengths: ['Hızlı servis', 'Lezzetli pizza', 'Temiz ortam', 'Güler yüzlü personel'],
    improvements: ['Park sorunu', 'Gürültü seviyesi', 'Bekleme süresi'],
    suggestions: [
      'Valet hizmeti düşünebilirsiniz - müşteriler park konusunda şikayetçi',
      'Akşam saatlerinde müzik sesini kısabilirsiniz',
      'Rezervasyon sistemi ekleyerek bekleme sürelerini azaltabilirsiniz'
    ],
    competitorAnalysis: 'Bölgenizdeki rakiplerinize göre hizmet kalitesinde %23 daha iyisiniz',
    trendPrediction: 'Gelecek ay %15-20 artış bekleniyor'
  },
  recentReviews: [
    {
      id: '1',
      rating: 5,
      title: 'Harika deneyim!',
      content: 'Pizza çok lezzetli, servis hızlı...',
      aiSentiment: 'VERY_POSITIVE',
      aiTags: ['lezzet', 'hızlı servis'],
      createdAt: new Date('2024-01-20'),
      helpful: true
    },
    {
      id: '2', 
      rating: 3,
      title: 'Ortalama',
      content: 'Pizza güzel ama biraz pahalı...',
      aiSentiment: 'NEUTRAL',
      aiTags: ['fiyat', 'lezzet'],
      createdAt: new Date('2024-01-18'),
      helpful: false
    }
  ]
}

const StatCard = ({ title, value, change, icon: Icon, positive }: {
  title: string
  value: string | number
  change: number
  icon: any
  positive?: boolean
}) => {
  const isPositive = positive !== false && change > 0
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}

export default function BusinessDashboard() {
  const [timeRange, setTimeRange] = useState('thisMonth')
  const [activeTab, setActiveTab] = useState('overview')

  // Mock API calls
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['business-dashboard', timeRange],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockBusinessData
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  const { business, analytics, aiInsights, recentReviews } = dashboardData || mockBusinessData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {business.name}
                {business.verified && (
                  <Badge className="ml-3 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Doğrulandı
                  </Badge>
                )}
                {business.isPremium && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                    <Award className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-1">{business.category} • {business.district}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Rapor İndir
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Button>
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                Profili Görüntüle
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
                { id: 'analytics', name: 'Analitik', icon: TrendingUp },
                { id: 'reviews', name: 'Yorumlar', icon: MessageSquare },
                { id: 'ai-insights', name: 'AI İçgörüler', icon: Zap },
                { id: 'competitors', name: 'Rakip Analizi', icon: Target }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Profil Görüntülenme"
                value={analytics.thisMonth.profileViews.toLocaleString()}
                change={18.2}
                icon={Eye}
              />
              <StatCard
                title="Yeni Yorumlar"
                value={analytics.thisMonth.newReviews}
                change={50.0}
                icon={MessageSquare}
              />
              <StatCard
                title="Ortalama Puan"
                value={analytics.thisMonth.avgRating.toFixed(1)}
                change={4.9}
                icon={Star}
              />
              <StatCard
                title="Check-in"
                value={analytics.thisMonth.checkIns}
                change={18.4}
                icon={Users}
              />
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Performans Özeti</h3>
                  <p className="text-gray-700 leading-relaxed">{aiInsights.overview}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Hızlı Eylemler</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    İletişim Bilgilerini Güncelle
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="w-4 h-4 mr-2" />
                    Çalışma Saatlerini Düzenle
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Fotoğraf Ekle
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Sağlık Skoru</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {business.healthScore.toFixed(1)}/10
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${business.healthScore * 10}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Mükemmel performans!</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-4">Trend Skoru</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {business.trendScore.toFixed(1)}/10
                  </div>
                  <div className="flex items-center justify-center text-green-600 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Yükselişte
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{aiInsights.trendPrediction}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Güçlü Yönleriniz
                </h3>
                <div className="space-y-3">
                  {aiInsights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Award className="w-4 h-4 text-green-600 mr-3" />
                      <span className="text-green-800">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  Gelişim Alanları
                </h3>
                <div className="space-y-3">
                  {aiInsights.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <Target className="w-4 h-4 text-yellow-600 mr-3" />
                      <span className="text-yellow-800">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-blue-500 mr-2" />
                AI Önerileri
              </h3>
              <div className="space-y-4">
                {aiInsights.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 text-purple-500 mr-2" />
                Rakip Analizi
              </h3>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-800 text-lg font-medium">{aiInsights.competitorAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Son Yorumlar</h3>
                <Button variant="outline">Tüm Yorumları Gör</Button>
              </div>
              
              <div className="space-y-6">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <Badge variant={review.aiSentiment === 'VERY_POSITIVE' ? 'default' : 'secondary'}>
                          {review.aiSentiment === 'VERY_POSITIVE' ? 'Çok Pozitif' : 'Nötr'}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-700 mb-3">{review.content}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {review.aiTags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
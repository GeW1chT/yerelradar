'use client'

import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { User, Settings, MapPin, Star, Calendar, Camera, MessageSquare, Award, TrendingUp } from 'lucide-react'
import Gamification from '@/components/Gamification'
import { Header } from '@/components/Header'

export default function ProfilePage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil Sayfası</h1>
            <p className="text-gray-600 mb-6">
              Profilinizi görmek için giriş yapmanız gerekiyor.
            </p>
            <a
              href="/giris"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Genel Bakış', icon: User },
    { id: 'gamification', name: 'Rozetler & Başarılar', icon: Award },
    { id: 'reviews', name: 'Yorumlarım', icon: MessageSquare },
    { id: 'photos', name: 'Fotoğraflarım', icon: Camera },
    { id: 'stats', name: 'İstatistikler', icon: TrendingUp },
    { id: 'settings', name: 'Ayarlar', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
            
            {/* Profile Info */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                {/* Avatar */}
                <div className="relative -mt-16 mb-4 md:mb-0">
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'Profil'}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white"
                  />
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.fullName || 'Yerel Radar Kullanıcısı'}
                      </h1>
                      <p className="text-gray-600 mb-2">
                        {user.primaryEmailAddress?.emailAddress}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(user.createdAt || '').toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long'
                          })} tarihinde katıldı
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          İstanbul, Türkiye
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="flex space-x-6 mt-4 md:mt-0">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{(user.publicMetadata?.totalReviews as number) || 0}</div>
                        <div className="text-sm text-gray-600">Yorum</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{(user.publicMetadata?.helpfulVotes as number) || 0}</div>
                        <div className="text-sm text-gray-600">Faydalı</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{(user.publicMetadata?.experiencePoints as number) || 0}</div>
                        <div className="text-sm text-gray-600">XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 whitespace-nowrap font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'gamification' && <Gamification />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'photos' && <PhotosTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}

function OverviewTab({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Activity */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <strong>Köşe Pizza</strong> için yorum yazdınız
                  </p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm ml-1">4.5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Level & Progress */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-center">
            <div className="text-3xl mb-2">🌱</div>
            <h3 className="font-bold text-lg">Başlangıç</h3>
            <p className="text-blue-100 text-sm mb-4">Seviye 1</p>
            <div className="bg-blue-400 rounded-full h-2 mb-2">
              <div className="bg-yellow-400 h-2 rounded-full w-1/3"></div>
            </div>
            <p className="text-xs text-blue-100">Sonraki seviyeye 67 XP</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Yakın Hedefler</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>📝</span>
                <span className="text-sm">İlk Yorum</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hazır!</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>📸</span>
                <span className="text-sm">Fotoğraf Paylaş</span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">0/1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewsTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Yorumlarım</h3>
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Henüz yorum yapmadınız</p>
        <p className="text-sm text-gray-400 mt-2">İlk yorumunuzu yazarak rozetler kazanmaya başlayın!</p>
      </div>
    </div>
  )
}

function PhotosTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fotoğraflarım</h3>
      <div className="text-center py-12">
        <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Henüz fotoğraf paylaşmadınız</p>
        <p className="text-sm text-gray-400 mt-2">İşletmelerden fotoğraf paylaşarak puanlar kazanın!</p>
      </div>
    </div>
  )
}

function StatsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Yorum İstatistikleri</h3>
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Toplam Yorum</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Ortalama Puan</span>
            <span className="font-medium">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Faydalı Oylar</span>
            <span className="font-medium">0</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Aktivite</h3>
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Bu Hafta</span>
            <span className="font-medium">0 aktivite</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Bu Ay</span>
            <span className="font-medium">0 aktivite</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Seri</span>
            <span className="font-medium">0 gün</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Keşif</h3>
          <MapPin className="w-6 h-6 text-purple-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Ziyaret Edilen</span>
            <span className="font-medium">0 işletme</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Şehirler</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Kategoriler</span>
            <span className="font-medium">0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Ayarları</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Bildirimler</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Yeni rozet bildirimleri</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Yorum yanıtları</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="ml-3 text-sm text-gray-700">Haftalık özet</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Gizlilik</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Profilim herkese açık</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
              <span className="ml-3 text-sm text-gray-700">Yorumlarım görünür</span>
            </label>
          </div>
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  )
}
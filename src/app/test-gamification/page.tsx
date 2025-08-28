'use client'

import { useState } from 'react'
import { Badge, Star, Trophy, Target, Zap, Users, Camera, MapPin, Heart, Calendar, Award, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MOCK_ACHIEVEMENTS = [
  {
    id: 'FIRST_REVIEW',
    name: 'İlk Yorum',
    description: 'İlk yorumunu yazdın!',
    icon: '🎉',
    points: 50,
    type: 'milestone',
    earned: true,
    earnedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'REVIEW_VETERAN',
    name: 'Yorum Veteranı',
    description: '10 yorum yazdın',
    icon: '📝',
    points: 100,
    type: 'milestone',
    earned: false,
    progress: 70,
    isUnlocked: false
  },
  {
    id: 'PHOTO_ENTHUSIAST',
    name: 'Fotoğraf Meraklısı',
    description: '10 fotoğraf paylaştın',
    icon: '📸',
    points: 75,
    type: 'activity',
    earned: false,
    progress: 30,
    isUnlocked: false
  },
  {
    id: 'EXPLORER',
    name: 'Kaşif',
    description: '25 farklı işletmeyi keşfettin',
    icon: '🗺️',
    points: 150,
    type: 'exploration',
    earned: false,
    progress: 16,
    isUnlocked: false
  },
  {
    id: 'HELPFUL_HERO',
    name: 'Faydalı Kahraman',
    description: '100 faydalı oy aldın',
    icon: '🦸',
    points: 200,
    type: 'community',
    earned: false,
    progress: 85,
    isUnlocked: true
  }
]

const LEVEL_INFO = {
  BEGINNER: { name: 'Başlangıç', color: 'bg-gray-500', icon: '🌱', minPoints: 0 },
  CONTRIBUTOR: { name: 'Katkıda Bulunan', color: 'bg-green-500', icon: '📝', minPoints: 100 },
  REVIEWER: { name: 'Yorumcu', color: 'bg-blue-500', icon: '⭐', minPoints: 500 },
  EXPERT: { name: 'Uzman', color: 'bg-purple-500', icon: '🎯', minPoints: 2000 },
  GURU: { name: 'Guru', color: 'bg-orange-500', icon: '🧠', minPoints: 5000 },
  LOCAL_HERO: { name: 'Yerel Kahraman', color: 'bg-red-500', icon: '👑', minPoints: 10000 }
}

const ACHIEVEMENT_TYPE_ICONS = {
  milestone: Trophy,
  activity: Camera,
  exploration: MapPin,
  social: Users,
  community: Heart,
  engagement: Calendar,
  prestige: Award
}

export default function TestGamificationPage() {
  const [selectedTab, setSelectedTab] = useState<'earned' | 'available'>('earned')
  const [newAchievements, setNewAchievements] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    experiencePoints: 750,
    level: 'REVIEWER' as keyof typeof LEVEL_INFO,
    totalReviews: 7,
    helpfulVotes: 85,
    totalPhotos: 3,
    visitedBusinesses: 4
  })

  const currentLevel = LEVEL_INFO[userStats.level]
  const earnedAchievements = MOCK_ACHIEVEMENTS.filter(a => a.earned)
  const availableAchievements = MOCK_ACHIEVEMENTS.filter(a => !a.earned)

  const triggerAction = (action: string) => {
    let pointsEarned = 0
    let newStats = { ...userStats }

    switch (action) {
      case 'review':
        pointsEarned = 10
        newStats.totalReviews += 1
        break
      case 'photo':
        pointsEarned = 5
        newStats.totalPhotos += 1
        break
      case 'helpful_vote':
        pointsEarned = 2
        newStats.helpfulVotes += 1
        break
      case 'checkin':
        pointsEarned = 3
        newStats.visitedBusinesses += 1
        break
    }

    newStats.experiencePoints += pointsEarned
    setUserStats(newStats)

    // Check for new achievements
    const newlyEarned = availableAchievements.filter(achievement => {
      if (achievement.id === 'REVIEW_VETERAN' && newStats.totalReviews >= 10) return true
      if (achievement.id === 'PHOTO_ENTHUSIAST' && newStats.totalPhotos >= 10) return true
      if (achievement.id === 'HELPFUL_HERO' && newStats.helpfulVotes >= 100) return true
      return false
    })

    if (newlyEarned.length > 0) {
      setNewAchievements(newlyEarned)
      setTimeout(() => setNewAchievements([]), 3000)
    }
  }

  const levelProgress = ((userStats.experiencePoints % 1000) / 1000) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* New Achievement Notifications */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <div className="font-bold">Yeni Rozet!</div>
                <div className="text-sm">{achievement.name}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YerelRadar Gamification Sistemi</h1>
          <p className="text-gray-600">Rozetler, seviyeler ve başarı sistemi test sayfası</p>
        </div>

        <div className="space-y-6">
          {/* Level and Progress Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{currentLevel.icon}</span>
                <div>
                  <h2 className="text-xl font-bold">{currentLevel.name}</h2>
                  <p className="text-blue-100">{userStats.experiencePoints} XP</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-yellow-300">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">{userStats.experiencePoints}</span>
                </div>
                <p className="text-sm text-blue-100">Toplam Puan</p>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>İlerleme</span>
                <span>{Math.round(1000 - (userStats.experiencePoints % 1000))} XP kaldı</span>
              </div>
              <div className="w-full bg-blue-500 rounded-full h-3">
                <div 
                  className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Achievement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Badge className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{earnedAchievements.length}</div>
              <div className="text-sm text-gray-600">Kazanılan Rozet</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {availableAchievements.filter(a => a.progress && a.progress > 50).length}
              </div>
              <div className="text-sm text-gray-600">Yakın Hedefler</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((earnedAchievements.length / MOCK_ACHIEVEMENTS.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Tamamlama Oranı</div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{userStats.totalReviews}</div>
              <div className="text-sm text-gray-600">Toplam Yorum</div>
            </div>
          </div>

          {/* Achievement Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setSelectedTab('earned')}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    selectedTab === 'earned'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Badge className="w-4 h-4 mr-2 inline" />
                  Kazanılan Rozetler ({earnedAchievements.length})
                </button>
                <button
                  onClick={() => setSelectedTab('available')}
                  className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    selectedTab === 'available'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-4 h-4 mr-2 inline" />
                  Hedefler ({availableAchievements.length})
                </button>
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'earned' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earnedAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      earned={true}
                    />
                  ))}
                </div>
              )}

              {selectedTab === 'available' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      earned={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Test Aksiyonları</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => triggerAction('review')}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center space-y-2"
              >
                <span className="text-2xl">📝</span>
                <span className="text-sm">Yorum Yaz (+10 XP)</span>
              </button>
              <button
                onClick={() => triggerAction('photo')}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex flex-col items-center space-y-2"
              >
                <span className="text-2xl">📸</span>
                <span className="text-sm">Fotoğraf Paylaş (+5 XP)</span>
              </button>
              <button
                onClick={() => triggerAction('helpful_vote')}
                className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex flex-col items-center space-y-2"
              >
                <span className="text-2xl">👍</span>
                <span className="text-sm">Faydalı Oy (+2 XP)</span>
              </button>
              <button
                onClick={() => triggerAction('checkin')}
                className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors flex flex-col items-center space-y-2"
              >
                <span className="text-2xl">📍</span>
                <span className="text-sm">Check-in (+3 XP)</span>
              </button>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalReviews}</div>
              <div className="text-sm text-gray-600">Toplam Yorum</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{userStats.helpfulVotes}</div>
              <div className="text-sm text-gray-600">Faydalı Oylar</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{userStats.totalPhotos}</div>
              <div className="text-sm text-gray-600">Paylaşılan Fotoğraf</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{userStats.visitedBusinesses}</div>
              <div className="text-sm text-gray-600">Ziyaret Edilen Yer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: any
  earned: boolean
}

function AchievementCard({ achievement, earned }: AchievementCardProps) {
  const TypeIcon = ACHIEVEMENT_TYPE_ICONS[achievement.type as keyof typeof ACHIEVEMENT_TYPE_ICONS] || Badge

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border-2 transition-all ${
        earned
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
          : achievement.isUnlocked
          ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{achievement.icon}</span>
          <TypeIcon className={`w-4 h-4 ${earned ? 'text-yellow-600' : 'text-gray-400'}`} />
        </div>
        <div className={`text-xs px-2 py-1 rounded ${
          earned ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'
        }`}>
          {achievement.points} XP
        </div>
      </div>
      
      <h3 className={`font-bold mb-2 ${earned ? 'text-gray-900' : 'text-gray-700'}`}>
        {achievement.name}
      </h3>
      
      <p className={`text-sm mb-3 ${earned ? 'text-gray-700' : 'text-gray-500'}`}>
        {achievement.description}
      </p>

      {!earned && achievement.progress !== undefined && (
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>İlerleme</span>
            <span>{achievement.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                achievement.isUnlocked ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${achievement.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {earned && achievement.earnedAt && (
        <div className="text-xs text-yellow-700 mt-2">
          📅 {new Date(achievement.earnedAt).toLocaleDateString('tr-TR')} tarihinde kazanıldı
        </div>
      )}

      {!earned && achievement.isUnlocked && (
        <div className="text-xs text-green-700 mt-2 font-medium">
          🎉 Rozet kazanmaya hazır!
        </div>
      )}
    </motion.div>
  )
}
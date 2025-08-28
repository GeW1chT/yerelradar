'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Badge, Star, Trophy, Target, Zap, Users, Camera, MapPin, Heart, Calendar, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  type: string
  requirement?: any
  progress?: number
  isUnlocked?: boolean
  earnedAt?: string
}

interface GamificationData {
  earned: Achievement[]
  available: Achievement[]
}

interface LevelProgress {
  progress: number
  nextLevelPoints: number | null
}

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

export default function Gamification() {
  const { user: clerkUser } = useUser()
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null)
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'earned' | 'available'>('earned')
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (clerkUser) {
      fetchGamificationData()
    }
  }, [clerkUser])

  const fetchGamificationData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gamification')
      const result = await response.json()
      
      if (result.success) {
        setGamificationData(result.data)
        // Mock level progress - in real app this would come from API
        setLevelProgress({
          progress: Math.random() * 100,
          nextLevelPoints: 2000
        })
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerAction = async (action: string, businessId?: string) => {
    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, businessId })
      })
      
      const result = await response.json()
      
      if (result.success && result.data.newAchievements.length > 0) {
        setNewAchievements(result.data.newAchievements)
        setTimeout(() => setNewAchievements([]), 3000)
        fetchGamificationData() // Refresh data
      }
    } catch (error) {
      console.error('Error triggering action:', error)
    }
  }

  if (!clerkUser) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          Rozet sisteminizi görmek için giriş yapın
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentLevel = LEVEL_INFO[clerkUser.publicMetadata?.level as keyof typeof LEVEL_INFO] || LEVEL_INFO.BEGINNER
  const experiencePoints = clerkUser.publicMetadata?.experiencePoints as number || 0

  return (
    <div className="space-y-6">
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

      {/* Level and Progress Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{currentLevel.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{currentLevel.name}</h2>
              <p className="text-blue-100">{experiencePoints} XP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-yellow-300">
              <Zap className="w-5 h-5" />
              <span className="font-bold">{experiencePoints}</span>
            </div>
            <p className="text-sm text-blue-100">Toplam Puan</p>
          </div>
        </div>
        
        {levelProgress && levelProgress.nextLevelPoints && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>İlerleme</span>
              <span>{levelProgress.nextLevelPoints - experiencePoints} XP kaldı</span>
            </div>
            <div className="w-full bg-blue-500 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress.progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <Badge className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {gamificationData?.earned?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Kazanılan Rozet</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {gamificationData?.available?.filter(a => a.progress && a.progress > 50).length || 0}
          </div>
          <div className="text-sm text-gray-600">Yakın Hedefler</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {gamificationData ? Math.round(((gamificationData.earned?.length || 0) / ((gamificationData.earned?.length || 0) + (gamificationData.available?.length || 1))) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Tamamlama Oranı</div>
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
              Kazanılan Rozetler ({gamificationData?.earned?.length || 0})
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
              Hedefler ({gamificationData?.available?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'earned' && (
            <div>
              {gamificationData?.earned && gamificationData.earned.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gamificationData.earned.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      earned={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Badge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz rozet kazanmadınız
                  </h3>
                  <p className="text-gray-500 mb-4">
                    İlk yorumunuzu yazarak başlayın!
                  </p>
                  <button
                    onClick={() => triggerAction('review')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Test: İlk Yorum Rozetini Kazan
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'available' && (
            <div>
              {gamificationData?.available && gamificationData.available.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gamificationData.available.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      earned={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tüm rozetleri kazandınız!
                  </h3>
                  <p className="text-gray-500">
                    Harika iş! Yerel kahraman oldunuz 🏆
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions for Testing */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Test Aksiyonları (Geliştirme)</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerAction('review')}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            +Yorum
          </button>
          <button
            onClick={() => triggerAction('photo')}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            +Fotoğraf
          </button>
          <button
            onClick={() => triggerAction('helpful_vote')}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            +Faydalı Oy
          </button>
          <button
            onClick={() => triggerAction('checkin')}
            className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
          >
            +Check-in
          </button>
        </div>
      </div>
    </div>
  )
}

interface AchievementCardProps {
  achievement: Achievement
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
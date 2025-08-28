'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Badge, Star, Trophy, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  earnedAt?: string
}

const LEVEL_INFO = {
  BEGINNER: { name: 'Başlangıç', color: 'bg-gray-500', icon: '🌱' },
  CONTRIBUTOR: { name: 'Katkıda Bulunan', color: 'bg-green-500', icon: '📝' },
  REVIEWER: { name: 'Yorumcu', color: 'bg-blue-500', icon: '⭐' },
  EXPERT: { name: 'Uzman', color: 'bg-purple-500', icon: '🎯' },
  GURU: { name: 'Guru', color: 'bg-orange-500', icon: '🧠' },
  LOCAL_HERO: { name: 'Yerel Kahraman', color: 'bg-red-500', icon: '👑' }
}

export default function GamificationWidget() {
  const { user: clerkUser } = useUser()
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clerkUser) {
      fetchRecentAchievements()
    }
  }, [clerkUser])

  const fetchRecentAchievements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gamification?type=earned')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Show the 3 most recent achievements
        const recent = result.data
          .sort((a: Achievement, b: Achievement) => 
            new Date(b.earnedAt || '').getTime() - new Date(a.earnedAt || '').getTime()
          )
          .slice(0, 3)
        setRecentAchievements(recent)
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!clerkUser) return null

  const currentLevel = LEVEL_INFO[clerkUser.publicMetadata?.level as keyof typeof LEVEL_INFO] || LEVEL_INFO.BEGINNER
  const experiencePoints = clerkUser.publicMetadata?.experiencePoints as number || 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Seviye & Rozetler</h3>
        <Link 
          href="/profil"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Tümünü Gör
        </Link>
      </div>

      {/* Level Progress */}
      <div className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <span className="text-2xl">{currentLevel.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{currentLevel.name}</span>
            <div className="flex items-center text-yellow-600 text-sm">
              <Zap className="w-4 h-4 mr-1" />
              {experiencePoints} XP
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${Math.min((experiencePoints % 1000) / 10, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Son Kazanılan Rozetler</span>
          <Badge className="w-4 h-4 text-blue-600" />
        </div>
        
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-2 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        ) : recentAchievements.length > 0 ? (
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-lg">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {achievement.description}
                  </p>
                </div>
                <div className="flex items-center text-yellow-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  {achievement.points}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Henüz rozet kazanmadınız</p>
            <p className="text-xs text-gray-400 mt-1">İlk yorumunuzu yazın!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => window.location.href = '/profil'}
            className="flex items-center justify-center space-x-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>İstatistik</span>
          </button>
          <button 
            onClick={() => window.location.href = '/profil'}
            className="flex items-center justify-center space-x-2 p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
          >
            <Badge className="w-4 h-4" />
            <span>Rozetler</span>
          </button>
        </div>
      </div>
    </div>
  )
}